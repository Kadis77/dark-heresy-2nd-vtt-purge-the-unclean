import { itemDescriptionFields } from '../common/item-fields.mjs';

export class CriticalInjuryDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            type: new f.StringField({ initial: 'impact' }),
            part: new f.StringField({ initial: 'body' }),
        };
    }
}
