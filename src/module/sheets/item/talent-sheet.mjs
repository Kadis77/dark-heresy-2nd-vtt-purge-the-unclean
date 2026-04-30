import { DarkHeresyItemSheet } from './item-sheet.mjs';

export class DarkHeresyTalentSheet extends DarkHeresyItemSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 820, height: 575 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },

    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-talent-sheet.hbs' },
    };
}
