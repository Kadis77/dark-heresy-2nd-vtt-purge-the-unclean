import { refundAmmo } from '../rules/ammo.mjs';
import { uuid } from '../rolls/roll-helpers.mjs';
import { AssignDamageData } from '../rolls/assign-damage-data.mjs';
import { prepareAssignDamageRoll } from '../prompts/assign-damage-prompt.mjs';
import { DHTargetedActionManager } from './targeted-action-manager.mjs';
import { Hit } from '../rolls/damage-data.mjs';
import { DarkHeresySettings } from '../dark-heresy-settings.mjs';
import { SYSTEM_ID } from '../hooks-manager.mjs';

export class BasicActionManager {
    // This is stored rolls for allowing re-rolls, ammo refund, etc.
    storedRolls = {};

    initializeHooks() {
        // Use event delegation on document for chat message controls.
        // In v13+ the renderChatMessage hook passes a pre-insertion element;
        // ApplicationV2 may clone it before inserting, orphaning any bound listeners.
        // Delegation from document fires on the live DOM and is always reliable.
        Hooks.on('ready', () => {
            document.addEventListener('click', async (ev) => {
                const hideControl = ev.target.closest('.roll-control__hide-control');
                if (hideControl) { ev.preventDefault(); return this._toggleExpandChatMessage(hideControl); }

                const refundControl = ev.target.closest('.roll-control__refund');
                if (refundControl) { ev.preventDefault(); return this._refundResources(refundControl); }

                const rerollControl = ev.target.closest('.roll-control__fate-reroll');
                if (rerollControl) { ev.preventDefault(); return this._fateReroll(rerollControl); }

                const assignControl = ev.target.closest('.roll-control__assign-damage');
                if (assignControl) { ev.preventDefault(); return this._assignDamage(assignControl); }

                const applyControl = ev.target.closest('.roll-control__apply-damage');
                if (applyControl) { ev.preventDefault(); return this._applyDamage(applyControl); }
            });
        });

        // Initialize Scene Control Buttons
        Hooks.on('getSceneControlButtons', (controls) => {
            try {
                // controls may be an array (v12) or object (v13+)
                const bar = Array.isArray(controls)
                    ? controls.find((c) => c.name === 'token')
                    : controls['token'];
                if (bar) {
                    bar.tools.push({
                        name: 'Assign Damage',
                        title: 'Assign Damage',
                        icon: 'fas fa-shield',
                        visible: true,
                        onClick: async () => DHBasicActionManager.assignDamageTool(),
                        button: true,
                    });
                }
            } catch (error) {
                game.dh.log('Unable to add assign damage scene control.', error);
            }
        });
    }

    // Handlers now receive the matched element directly (not the event),
    // since they are called from event delegation where currentTarget is document.

    async _toggleExpandChatMessage(el) {
        game.dh.log('roll-control-toggle');
        el.querySelector('span')?.classList.toggle('active');
        const target = el.dataset.toggle;
        // Traverse relative to the containing .dh-roll rather than using
        // document.getElementById — more reliable inside Foundry's rendering context.
        const targetEl = el.closest('.dh-roll')?.querySelector(`[id="${target}"]`);
        if (targetEl) targetEl.style.display = targetEl.style.display === 'none' ? '' : 'none';
    }

    async _refundResources(el) {
        const rollId = el.dataset.rollId;
        const actionData = this.getActionData(rollId);

        if (!actionData) {
            ui.notifications.warn(`Action data expired. Unable to perform action.`);
            return;
        }

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Confirm Refund' },
            content: '<p>Are you sure you would like to refund ammo, fate, etc for this action?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            await actionData.refundResources();
            ui.notifications.info(`Resources refunded`);
        }
    }

    async _fateReroll(el) {
        const rollId = el.dataset.rollId;
        const actionData = this.getActionData(rollId);

        if (!actionData) {
            ui.notifications.warn(`Action data expired. Unable to perform action.`);
            return;
        }

        if (actionData.rollData?.sourceActor?.system?.fate?.value <= 0) {
            ui.notifications.warn(`Actor does not have enough fate points!`);
            return;
        }

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Confirm Re-Roll' },
            content: '<p>Are you sure you would like to use a fate point to re-roll action?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            // Generate new ID for action data
            actionData.id = uuid();
            // Use a FP
            await actionData.rollData.sourceActor.spendFate();
            // Refund Initial Resources
            await actionData.refundResources();
            // Reset
            actionData.reset();
            // Run it back
            await actionData.performActionAndSendToChat();
        }
    }

    async _assignDamage(el) {
        const location = el.dataset.location;
        const totalDamage = el.dataset.totalDamage;
        const totalPenetration = el.dataset.totalPenetration;
        const totalFatigue = el.dataset.totalFatigue;
        const damageType = el.dataset.damageType;

        const hitData = new Hit();
        hitData.location = location;
        hitData.totalDamage = totalDamage;
        hitData.totalPenetration = totalPenetration;
        hitData.totalFatigue = totalFatigue;
        hitData.damageType = damageType;

        const targetUuid = el.dataset.targetUuid;

        let targetActor;
        if (targetUuid) {
            targetActor = await fromUuid(targetUuid);
            if (targetActor.actor != undefined) {
                targetActor = targetActor.actor;
            }
        } else {
            const targetedObjects = game.user.targets;
            if (targetedObjects && targetedObjects.size > 0) {
                const target = targetedObjects.values().next().value;
                targetActor = target.actor;
            }
        }
        if (!targetActor) {
            ui.notifications.warn(`Cannot determine target actor to assign hit.`);
            return;
        }

        const assignData = new AssignDamageData(targetActor, hitData);
        await prepareAssignDamageRoll(assignData);
    }

    async _applyDamage(el) {
        const uuid = el.dataset.uuid;
        const damageType = el.dataset.type;
        const ignoreArmour = el.dataset.ignoreArmour;
        const location = el.dataset.location;
        const damage = el.dataset.damage;
        const penetration = el.dataset.penetration;
        const fatigue = el.dataset.fatigue;

        const actor = (await fromUuid(uuid)).actor;
        if (!actor) {
            ui.notifications.warn(`Cannot determine actor to assign hit.`);
            return;
        }
        for(const field of [damage, penetration, fatigue]) {
            if(field && isNaN(parseInt(field))) {
                ui.notifications.warn(`Unable to determine damage/penetration/fatigue to assign.`);
                return;
            }
        }

        const assignDamageData = new AssignDamageData();
        assignDamageData.actor = actor;
        if(ignoreArmour || "true" === ignoreArmour || "TRUE" === ignoreArmour) {
            assignDamageData.ignoreArmour = true;
        }

        const hit = new Hit();
        if(location) {
            hit.location = location;
        }
        if(damage) {
            hit.totalDamage = Number.parseInt(damage);
        }
        if(penetration) {
            hit.totalPenetration = Number.parseInt(penetration);
        }
        if(fatigue) {
            hit.totalFatigue = Number.parseInt(fatigue);
        }
        if(damageType) {
            hit.damageType = damageType;
        }

        assignDamageData.hit = hit;

        await assignDamageData.update();
        await assignDamageData.finalize();
        await assignDamageData.performActionAndSendToChat();
    }

    async assignDamageTool() {
        const sourceToken = DHTargetedActionManager.getSourceToken();
        const sourceActorData = sourceToken ? sourceToken.actor : null;
        if(!sourceActorData) return;

        const hitData = new Hit();
        const assignData = new AssignDamageData(sourceActorData, hitData);
        await prepareAssignDamageRoll(assignData);
    }

    getActionData(id) {
        return this.storedRolls[id];
    }

    storeActionData(actionData) {
        //TODO: Cleanup all rolls older than ? minutes
        this.storedRolls[actionData.id] = actionData;
    }

    /**
     * Data Expected to vocalize item:
     * actor, name, type description
     * @param data
     * @returns {Promise<void>}
     */
    async sendItemVocalizeChat(data) {
        const html = await renderTemplate('systems/dark-heresy-2nd/templates/chat/item-vocalize-chat.hbs', data);
        let chatData = {
            author: game.user.id,
            content: html,
            rollMode: game.settings.get('core', 'rollMode'),
            style: CONST.CHAT_MESSAGE_STYLES.IC,
        };
        if (['gmroll', 'blindroll'].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients('GM');
        } else if (chatData.rollMode === 'selfroll') {
            chatData.whisper = [game.user];
        }
        ChatMessage.create(chatData);
    }
}

export const DHBasicActionManager = new BasicActionManager();
