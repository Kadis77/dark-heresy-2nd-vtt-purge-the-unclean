import { recursiveUpdate } from '../rolls/roll-helpers.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class PsychicPowerDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    /**
     * @param psychicAttackData {PsychicActionData}
     */
    constructor(psychicAttackData = {}, options = {}) {
        super(options);
        this.psychicAttackData = psychicAttackData;
        this.data = psychicAttackData.rollData;
        this.initialized = false;
    }

    static DEFAULT_OPTIONS = {
        id: 'dh-psychic-power-dialog',
        classes: ['dialog'],
        position: { width: 500 },
        window: { title: 'Psychic Power' },
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/prompt/psychic-power-roll-prompt.hbs' },
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

        const form = this.element.querySelector('form');
        if (form) {
            form.addEventListener('change', async (ev) => {
                if (ev.target.classList.contains('power-select')) return;
                const formData = new FormDataExtended(form).object;
                recursiveUpdate(this.data, formData);
                await this.data.update();
                this.render();
            });
        }

        this.element.querySelectorAll('.power-select').forEach(el =>
            el.addEventListener('change', async (ev) => await this._updatePower(ev)));
        this.element.querySelector('#power-roll')?.addEventListener('click', async (ev) => await this._rollPower(ev));
        this.element.querySelector('#power-cancel')?.addEventListener('click', async (ev) => await this._cancelPower(ev));
    }

    async _updatePower(event) {
        this.data.selectPower(event.target.name);
        await this.data.update();
        this.render();
    }

    async _cancelPower(event) {
        await this.close();
    }

    async _rollPower(event) {
        await this.data.finalize();
        await this.psychicAttackData.performActionAndSendToChat();
        await this.close();
    }
}

/**
 * @param psychicAttackData {PsychicActionData}
 */
export async function preparePsychicPowerRoll(psychicAttackData) {
    const prompt = new PsychicPowerDialog(psychicAttackData);
    prompt.render(true);
}
