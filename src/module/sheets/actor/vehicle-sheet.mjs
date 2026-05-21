import { ActorContainerSheet } from './actor-container-sheet.mjs';

export class VehicleSheet extends ActorContainerSheet {
    static DEFAULT_OPTIONS = {
        classes: ['dark-heresy-2nd', 'sheet', 'actor'],
        position: { width: 1000, height: 750 },
        window: { resizable: true },
        form: { closeOnSubmit: false },
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/actor/actor-vehicle-sheet.hbs' },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.dh = CONFIG.dh;
        return context;
    }

    async _onItemDamage() {
        game.dh.warn('Not Implemented for Vehicles Yet');
    }
}
