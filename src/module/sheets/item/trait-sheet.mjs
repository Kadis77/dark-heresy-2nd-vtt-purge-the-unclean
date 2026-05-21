import { DarkHeresyItemSheet } from './item-sheet.mjs';

export class DarkHeresyTraitSheet extends DarkHeresyItemSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 650, height: 500 },
        window: { resizable: true },
        form: { closeOnSubmit: false },

    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-trait-sheet.hbs' },
    };
}
