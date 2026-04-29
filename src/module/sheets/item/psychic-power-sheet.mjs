import { DarkHeresyItemContainerSheet } from './item-container-sheet.mjs';

export class DarkHeresyPsychicPowerSheet extends DarkHeresyItemContainerSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 820, height: 575 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        tabs: [{ navSelector: '.dh-navigation', contentSelector: '.dh-body', initial: 'stats' }],
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-psychic-power-sheet.hbs' },
    };
}
