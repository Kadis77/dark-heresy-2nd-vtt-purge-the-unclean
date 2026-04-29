import { recursiveUpdate } from '../rolls/roll-helpers.mjs';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AssignDamageDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(assignDamageData = {}, options = {}) {
        super(options);
        this.data = assignDamageData;
        this.initialized = false;
    }

    static DEFAULT_OPTIONS = {
        id: 'dh-assign-damage-dialog',
        classes: ['dialog'],
        position: { width: 500 },
        window: { title: 'Assign Damage' },
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/prompt/assign-damage-prompt.hbs' },
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

        this.element.querySelector('#assign-damage')?.addEventListener('click', async (ev) => await this._assignDamage(ev));
        this.element.querySelector('#cancel-prompt')?.addEventListener('click', async (ev) => await this._cancelPrompt(ev));
    }

    async _cancelPrompt(event) {
        await this.close();
    }

    async _assignDamage(event) {
        await this.data.finalize();
        await this.data.performActionAndSendToChat();
        await this.close();
    }
}

export async function prepareAssignDamageRoll(assignDamageData) {
    const prompt = new AssignDamageDialog(assignDamageData);
    prompt.render(true);
}
