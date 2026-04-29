import { itemDescriptionFields } from '../common/item-fields.mjs';

export class TalentDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            prerequisites: new f.StringField({ initial: '' }),
            aptitudes: new f.StringField({ initial: '' }),
            benefit: new f.HTMLField({ initial: '' }),
            tier: new f.NumberField({ initial: 0, integer: true }),
            cost: new f.NumberField({ initial: 0, integer: true }),
        };
    }
}
