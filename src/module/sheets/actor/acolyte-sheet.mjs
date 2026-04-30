import { ActorContainerSheet } from './actor-container-sheet.mjs';
import { DHBasicActionManager } from '../../actions/basic-action-manager.mjs';
import { DHTargetedActionManager } from '../../actions/targeted-action-manager.mjs';
import { Hit } from '../../rolls/damage-data.mjs';
import { AssignDamageData } from '../../rolls/assign-damage-data.mjs';
import { prepareAssignDamageRoll } from '../../prompts/assign-damage-prompt.mjs';

export class AcolyteSheet extends ActorContainerSheet {
    static DEFAULT_OPTIONS = {
        classes: ['dark-heresy-2nd', 'sheet', 'actor'],
        position: { width: 1000, height: 750 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        tabs: [{ navSelector: '.dh-navigation', contentSelector: '.dh-body', initial: 'main' }],
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/actor/actor-acolyte-sheet.hbs' },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.dh = CONFIG.dh;
        context.effects = this.actor.effects.contents;
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this.element.querySelectorAll('.roll-characteristic').forEach(el =>
            el.addEventListener('click', async (ev) => await this._prepareRollCharacteristic(ev)));
        this.element.querySelectorAll('.roll-skill').forEach(el =>
            el.addEventListener('click', async (ev) => await this._prepareRollSkill(ev)));
        this.element.querySelectorAll('.acolyte-homeWorld').forEach(el =>
            el.addEventListener('change', async (ev) => await this._onHomeworldChange(ev)));
        this.element.querySelectorAll('.bonus-vocalize').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onBonusVocalize(ev)));
        this.element.querySelectorAll('.combat-control').forEach(el =>
            el.addEventListener('click', async (ev) => await this._combatControls(ev)));
    }

    async _combatControls(event) {
        switch (event.currentTarget.dataset.action) {
            case 'attack':
                await DHTargetedActionManager.performWeaponAttack(this.actor);
                break;
            case 'assign-damage': {
                const hitData = new Hit();
                const assignData = new AssignDamageData(this.actor, hitData);
                await prepareAssignDamageRoll(assignData);
                break;
            }
            case 'dodge':
                await this.actor.rollSkill('dodge');
                break;
            case 'parry':
                await this.actor.rollSkill('parry');
                break;
        }
    }

    async _onBonusVocalize(event) {
        const bonus = this.actor.backgroundEffects.abilities.find(
            (a) => a.name === event.currentTarget.dataset.bonusName
        );
        if (bonus) {
            await DHBasicActionManager.sendItemVocalizeChat({
                actor: this.actor.name,
                name: bonus.name,
                type: bonus.source,
                description: bonus.benefit,
            });
        }
    }

    async _prepareRollCharacteristic(event) {
        await this.actor.rollCharacteristic(event.currentTarget.dataset.characteristic);
    }

    async _prepareRollSkill(event) {
        const el = event.currentTarget;
        await this.actor.rollSkill(el.dataset.skill, el.dataset.specialty);
    }

    async _onHomeworldChange() {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Roll Characteristics?' },
            content: '<p>Would you like to roll Wounds and Fate for this homeworld?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            if (!this.actor.backgroundEffects?.homeworld) return;
            const woundRoll = new Roll(this.actor.backgroundEffects.homeworld.wounds);
            await woundRoll.evaluate();
            const fateRoll = new Roll('1d10');
            await fateRoll.evaluate();
            await this.actor.update({
                'system.wounds.max': woundRoll.total,
                'system.fate.max': parseInt(this.actor.backgroundEffects.homeworld.fate_threshold) +
                    (fateRoll.total >= this.actor.backgroundEffects.homeworld.emperors_blessing ? 1 : 0),
            });
        }
    }
}
