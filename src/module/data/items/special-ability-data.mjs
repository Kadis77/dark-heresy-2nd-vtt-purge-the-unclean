import { itemDescriptionFields } from '../common/item-fields.mjs';

export class SpecialAbilityDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            benefit: new f.HTMLField({ initial: '' }),
        };
    }
}
