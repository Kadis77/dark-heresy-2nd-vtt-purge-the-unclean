import { DarkHeresyItemContainerSheet } from './item-container-sheet.mjs';

export class DarkHeresyStorageLocationSheet extends DarkHeresyItemContainerSheet {
    static DEFAULT_OPTIONS = {
        position: { width: 800, height: 400 },
        window: { resizable: true },
        form: { closeOnSubmit: false },
    };

    tabGroups = { primary: 'items' };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/item/item-storage-location-sheet.hbs' },
    };
}
