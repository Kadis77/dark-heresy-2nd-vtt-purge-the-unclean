import { DarkHeresyItemSheet } from './item-sheet.mjs';

export class DarkHeresyPeerEnemySheet extends DarkHeresyItemSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 800, height: 340 },
        window: { resizable: true },
        form: { closeOnSubmit: false },

    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-peer-enemy-sheet.hbs' },
    };
}
