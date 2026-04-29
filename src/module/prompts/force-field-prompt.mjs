import { recursiveUpdate } from '../rolls/roll-helpers.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ForceFieldDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(forceFieldData = {}, options = {}) {
        super(options);
        this.data = forceFieldData;
        this.initialized = false;
    }

    static DEFAULT_OPTIONS = {
        id: 'dh-force-field-dialog',
        classes: ['dialog'],
        position: { width: 500 },
        window: { title: 'Force Field' },
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/prompt/force-field-prompt.hbs' },
    };

    async _prepareContext(options) {
        await this.data.update();
        return this.data;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        const form = this.element.querySelector('form');
        if (form) {
            form.addEventListener('change', async () => {
                const formData = new FormDataExtended(form).object;
                recursiveUpdate(this.data, formData);
                await this.data.update();
                this.render();
            });
        }

        this.element.querySelector('#roll-force-field')?.addEventListener('click', async (ev) => await this._rollForceField(ev));
        this.element.querySelector('#cancel-prompt')?.addEventListener('click', async (ev) => await this._cancelPrompt(ev));
    }

    async _cancelPrompt(event) {
        await this.close();
    }

    async _rollForceField(event) {
        if (!this.data.forceField.system.activated) {
            ui.notifications.warn(`Force Field not activated!`);
            return;
        }

        if (this.data.forceField.system.overloaded) {
            ui.notifications.warn(`Force Field currently overloaded!`);
            return;
        }

        await this.data.finalize();
        await this.data.performActionAndSendToChat();
        await this.close();
    }
}

export async function prepareForceFieldRoll(forceFieldData) {
    const prompt = new ForceFieldDialog(forceFieldData);
    prompt.render(true);
}
