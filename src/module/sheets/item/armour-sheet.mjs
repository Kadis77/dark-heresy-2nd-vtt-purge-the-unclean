import { DarkHeresyItemContainerSheet } from './item-container-sheet.mjs';

export class DarkHeresyArmourSheet extends DarkHeresyItemContainerSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 820, height: 575 },
        window: { resizable: true },
        form: { closeOnSubmit: false },
    };

    tabGroups = { primary: 'stats' };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-armour-sheet.hbs' },
    };
}
