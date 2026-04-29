import { AcolyteSheet } from './acolyte-sheet.mjs';

export class NpcSheet extends AcolyteSheet {
    static DEFAULT_OPTIONS = {
        classes: ['dark-heresy-2nd', 'sheet', 'actor'],
        position: { width: 1000, height: 750 },
        window: { resizable: true },
        form: { submitOnChange: true, closeOnSubmit: false },
        tabs: [{ navSelector: '.dh-navigation', contentSelector: '.dh-body', initial: 'main' }],
    };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/actor/actor-npc-sheet.hbs' },
    };
}
