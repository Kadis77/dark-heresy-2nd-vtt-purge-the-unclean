import { itemDescriptionFields } from '../common/item-fields.mjs';

export class JournalEntryDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            time: new f.StringField({ initial: '' }),
            place: new f.StringField({ initial: '' }),
        };
    }
}
