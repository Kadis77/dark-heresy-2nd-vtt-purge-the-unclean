import { recursiveUpdate } from '../rolls/roll-helpers.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class WeaponAttackDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    /**
     * @param weaponActionData {WeaponActionData}
     * @param options
     */
    constructor(weaponActionData = {}, options = {}) {
        super(options);
        this.weaponAttackData = weaponActionData;
        this.data = weaponActionData.rollData;
        this.initialized = false;
    }

    static DEFAULT_OPTIONS = {
        id: 'dh-weapon-attack-dialog',
        classes: ['dialog'],
        position: { width: 500 },
        window: { title: 'Weapon Attack' },
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/prompt/weapon-roll-prompt.hbs' },
    };

    async _prepareContext(options) {
        if (!this.initialized) {
            this.data.initialize();
            this.initialized = true;
        }
        await this.data.update();
        return this.data;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        // Live update: re-sync data when any form field changes
        const form = this.element.querySelector('form');
        if (form) {
            form.addEventListener('change', async (ev) => {
                // Weapon select is handled separately
                if (ev.target.classList.contains('weapon-select')) return;
                const formData = new FormDataExtended(form).object;
                recursiveUpdate(this.data, formData);
                await this.data.update();
                this.render();
            });
        }

        this.element.querySelectorAll('.weapon-select').forEach(el =>
            el.addEventListener('change', async (ev) => await this._updateWeapon(ev)));
        this.element.querySelector('#attack-roll')?.addEventListener('click', async (ev) => await this._rollAttack(ev));
        this.element.querySelector('#attack-cancel')?.addEventListener('click', async (ev) => await this._cancelAttack(ev));
    }

    async _updateWeapon(event) {
        this.data.selectWeapon(event.target.name);
        await this.data.update();
        this.render();
    }

    async _cancelAttack(event) {
        await this.close();
    }

    async _rollAttack(event) {
        if (this.data.fireRate === 0) {
            ui.notifications.warn(`Not enough ammo to perform action. Do you need to reload?`);
            return;
        }
        await this.data.finalize();
        await this.weaponAttackData.performActionAndSendToChat();
        await this.close();
    }
}

/**
 * @param weaponAttackData {WeaponActionData}
 */
export async function prepareWeaponRoll(weaponAttackData) {
    const prompt = new WeaponAttackDialog(weaponAttackData);
    prompt.render(true);
}
