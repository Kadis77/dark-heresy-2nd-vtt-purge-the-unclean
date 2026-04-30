import { toggleUIExpanded } from '../../rules/config.mjs';

/**
 * Base item sheet. Migrated from ItemSheet (ApplicationV1) to ItemSheetV2 (ApplicationV2) for Foundry v14.
 */
export class DarkHeresyItemSheet extends foundry.applications.sheets.ItemSheetV2 {
    static DEFAULT_OPTIONS = {
        position: { width: 650, height: 500 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        tabs: [{ navSelector: '.dh-navigation', contentSelector: '.dh-body', initial: 'description' }],
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.item = this.item;
        context.system = this.item.system;
        context.flags = this.item.flags;
        context.dh = CONFIG.dh;
        context.effects = this.item.effects.contents;
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        if (!this.isEditable) return;

        this.element.querySelectorAll('.sheet-control__hide-control').forEach(el =>
            el.addEventListener('click', async (ev) => await this._sheetControlHideToggle(ev)));
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

    async _effectDisable(event) {
        this.item.effects.get(event.currentTarget.dataset.effectId).update({ disabled: true });
    }

    async _effectEnable(event) {
        this.item.effects.get(event.currentTarget.dataset.effectId).update({ disabled: false });
    }

    async _effectDelete(event) {
        this.item.effects.get(event.currentTarget.dataset.effectId).delete();
    }

    async _effectEdit(event) {
        this.item.effects.get(event.currentTarget.dataset.effectId).sheet.render(true);
    }

    async _effectCreate() {
        return this.item.createEmbeddedDocuments('ActiveEffect', [{
            name: 'New Effect',
            icon: 'icons/svg/aura.svg',
            origin: this.item.uuid,
            disabled: true,
        }], { renderSheet: true });
    }
}
