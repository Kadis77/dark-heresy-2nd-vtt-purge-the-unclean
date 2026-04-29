import { DarkHeresyItemSheet } from './item-sheet.mjs';

export class DarkHeresyJournalEntrySheet extends DarkHeresyItemSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 800, height: 350 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        tabs: [{ navSelector: '.dh-navigation', contentSelector: '.dh-body', initial: 'stats' }],
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-journal-entry-sheet.hbs' },
    };
}
