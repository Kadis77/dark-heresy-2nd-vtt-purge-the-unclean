import { toggleUIExpanded } from '../../rules/config.mjs';

/**
 * Base item sheet. Migrated from ItemSheet (ApplicationV1) to ItemSheetV2 (ApplicationV2) for Foundry v14.
 */
export class DarkHeresyItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ['dark-heresy-2nd', 'sheet', 'item'],
        position: { width: 650, height: 500 },
        window: { resizable: true },
        form: { closeOnSubmit: false },
    };

    get title() {
        return this.item.name;
    }

    tabGroups = { primary: 'description' };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.item = this.item;
        context.system = this.item.system;
        context.flags = this.item.flags;
        context.dh = CONFIG.dh;
        context.effects = this.item.effects.contents;
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

        const form = this.element.querySelector('form') ?? this.element;
        form.addEventListener('change', async (event) => {
            const input = event.target;
            if (!input.name) return;
            let value;
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number' || input.dataset.dtype === 'Number') {
                value = input.value !== '' ? Number(input.value) : null;
            } else {
                value = input.value;
            }
            await this.document.update({ [input.name]: value });
        });

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
