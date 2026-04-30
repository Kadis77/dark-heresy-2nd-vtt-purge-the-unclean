import { toggleUIExpanded } from '../../rules/config.mjs';
import { DHBasicActionManager } from '../../actions/basic-action-manager.mjs';
import { prepareCreateSpecialistSkillPrompt } from '../../prompts/simple-prompt.mjs';

/**
 * Shared Actor functions for Actor that contains embedded items.
 * Migrated from ApplicationV1 (ActorSheet) to ApplicationV2 (ActorSheetV2) for Foundry v14.
 */
export class ActorContainerSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        form: { submitOnChange: true, closeOnSubmit: false },
        window: { resizable: true },
    };

    get title() {
        return this.document.name;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.actor = this.actor;
        context.system = this.actor.system;
        return context;
    }

    _activateTabs() {
        for (const [group, activeTab] of Object.entries(this.tabGroups ?? {})) {
            const navSelector = `.dh-navigation[data-group="${group}"] [data-tab]`;
            const contentSelector = `.tab[data-group="${group}"]`;
            this.element.querySelectorAll(contentSelector).forEach(el =>
                el.classList.toggle('active', el.dataset.tab === activeTab));
            this.element.querySelectorAll(navSelector).forEach(el =>
                el.classList.toggle('active', el.dataset.tab === activeTab));
            this.element.querySelectorAll(navSelector).forEach(navItem => {
                navItem.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    const tab = ev.currentTarget.dataset.tab;
                    this.tabGroups[group] = tab;
                    this.element.querySelectorAll(contentSelector).forEach(el =>
                        el.classList.toggle('active', el.dataset.tab === tab));
                    this.element.querySelectorAll(navSelector).forEach(el =>
                        el.classList.toggle('active', el.dataset.tab === tab));
                });
            });
        }
    }

    _onRender(context, options) {
        super._onRender(context, options);
        this._activateTabs();
        if (!this.isEditable) return;

        // Drop handler on the form/element
        const form = this.element.querySelector('form') ?? this.element;
        form.addEventListener('drop', (ev) => this._onDrop(ev));

        this.element.querySelectorAll('.sheet-control__hide-control').forEach(el =>
            el.addEventListener('click', async (ev) => await this._sheetControlHideToggle(ev)));
        this.element.querySelectorAll('.item-roll').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onItemRoll(ev)));
        this.element.querySelectorAll('.item-damage').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onItemDamage(ev)));
        this.element.querySelectorAll('.item-create').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onItemCreate(ev)));
        this.element.querySelectorAll('.item-edit').forEach(el =>
            el.addEventListener('click', (ev) => this._onItemEdit(ev)));
        this.element.querySelectorAll('.item-delete').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onItemDelete(ev)));
        this.element.querySelectorAll('.item-vocalize').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onItemVocalize(ev)));
        this.element.querySelectorAll('.item-drag').forEach(item => {
            if (item.dataset?.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', this._onItemDragStart.bind(this), false);
            }
        });
        this.element.querySelectorAll('.actor-drag').forEach(item => {
            if (item.dataset?.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', this._onActorDragStart.bind(this), false);
            }
        });
        this.element.querySelectorAll('.effect-delete').forEach(el =>
            el.addEventListener('click', async (ev) => await this._effectDelete(ev)));
        this.element.querySelectorAll('.effect-edit').forEach(el =>
            el.addEventListener('click', async (ev) => await this._effectEdit(ev)));
        this.element.querySelectorAll('.effect-create').forEach(el =>
            el.addEventListener('click', async (ev) => await this._effectCreate(ev)));
        this.element.querySelectorAll('.effect-enable').forEach(el =>
            el.addEventListener('click', async (ev) => await this._effectEnable(ev)));
        this.element.querySelectorAll('.effect-disable').forEach(el =>
            el.addEventListener('click', async (ev) => await this._effectDisable(ev)));
        this.element.querySelectorAll('.add-skill').forEach(el =>
            el.addEventListener('click', async (ev) => await this._addSpecialistSkill(ev)));
    }

    _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        game.dh.log('Actor _onDrop', event);
        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (data.type === 'Item' || data.type === 'item') {
                if (this.actor.items.find((i) => i._id === data?.data?._id)) {
                    game.dh.log('Item already exists on Actor -- ignoring');
                    return false;
                } else {
                    return super._onDrop(event);
                }
            }
        } catch (err) {
            game.dh.log('Actor Container | drop error', err);
            return false;
        }
    }

    async _addSpecialistSkill(event) {
        const specialistSkill = event.currentTarget.dataset.skill;
        const skill = this.actor.system.skills[specialistSkill];
        if (!skill) {
            ui.notifications.warn(`Skill not specified -- unexpected error.`);
            return;
        }
        await prepareCreateSpecialistSkillPrompt({ actor: this.actor, skill, skillName: specialistSkill });
    }

    async _onItemDamage(event) {
        await this.actor.damageItem(event.currentTarget.dataset.itemId);
    }

    async _onItemRoll(event) {
        await this.actor.rollItem(event.currentTarget.dataset.itemId);
    }

    async _onItemCreate(event) {
        const type = event.currentTarget.dataset.type;
        await this.actor.createEmbeddedDocuments('Item', [{ name: `New ${type.capitalize()}`, type }], { renderSheet: true });
    }

    _onItemEdit(event) {
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        item.sheet.render(true);
    }

    async _onItemDelete(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Confirm Delete' },
            content: '<p>Are you sure you would like to delete this?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
            this.render();
        }
    }

    async _onItemVocalize(event) {
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        await DHBasicActionManager.sendItemVocalizeChat({
            actor: this.actor.name,
            name: item.name,
            type: item.type?.toUpperCase(),
            description: await TextEditor.enrichHTML(item.system.benefit ?? item.system.description, {
                rollData: { actor: this.actor, item, pr: this.actor.psy?.rating },
            }),
        });
    }

    async _sheetControlHideToggle(event) {
        const el = event.currentTarget;
        el.querySelector('span')?.classList.toggle('active');
        const target = el.dataset.toggle;
        this.element.querySelectorAll('.' + target).forEach(targetEl => {
            targetEl.style.display = targetEl.style.display === 'none' ? '' : 'none';
        });
        toggleUIExpanded(target);
    }

    async _onItemDragStart(event) {
        event.stopPropagation();
        game.dh.log('Actor:_onItemDragStart', event);
        const element = event.currentTarget;
        if (!element.dataset?.itemId) {
            game.dh.warn('No Item Id - Cancelling Drag');
            return;
        }
        const item = this.actor.items.get(element.dataset.itemId);
        if (!item) {
            game.dh.log('Default Foundry Handler');
            return super._onDragStart(event);
        }
        const dragData = {
            actorId: this.actor.id,
            uuid: this.actor.uuid,
            actorName: this.actor.name,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token?.id : null,
            type: 'Item',
            data: item,
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    async _onActorDragStart(event) {
        event.stopPropagation();
        game.dh.log('_onActorDragStart', event);
        const element = event.currentTarget;
        if (!element.dataset?.itemType) {
            game.dh.warn('No Drag Type - Cancelling Drag');
            return;
        }
        const dragType = element.dataset.itemType;
        const dragData = {
            actorId: this.actor.id,
            uuid: this.actor.uuid,
            actorName: this.actor.name,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token?.id : null,
            type: dragType,
            data: {},
        };
        switch (dragType) {
            case 'characteristic': {
                const characteristic = this.actor.characteristics[element.dataset.itemId];
                dragData.data = { name: characteristic.label, characteristic: element.dataset.itemId };
                event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                return;
            }
            case 'skill': {
                const skill = this.actor.skills[element.dataset.itemId];
                let name = skill.label;
                if (element.dataset.speciality) {
                    name = `${name}: ${skill.specialities[element.dataset.speciality].label}`;
                }
                dragData.data = { name, skill: element.dataset.itemId, speciality: element.dataset.speciality };
                event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                return;
            }
            default:
                game.dh.warn('No handler for drag type: ' + dragType + ' Using default foundry handler.');
                return super._onDragStart(event);
        }
    }

    async _effectDisable(event) {
        this.actor.effects.get(event.currentTarget.dataset.effectId).update({ disabled: true });
    }

    async _effectEnable(event) {
        this.actor.effects.get(event.currentTarget.dataset.effectId).update({ disabled: false });
    }

    async _effectDelete(event) {
        this.actor.effects.get(event.currentTarget.dataset.effectId).delete();
    }

    async _effectEdit(event) {
        this.actor.effects.get(event.currentTarget.dataset.effectId).sheet.render(true);
    }

    async _effectCreate() {
        return this.actor.createEmbeddedDocuments('ActiveEffect', [{
            name: 'New Effect',
            icon: 'icons/svg/aura.svg',
            origin: this.actor.uuid,
            disabled: true,
        }], { renderSheet: true });
    }
}
