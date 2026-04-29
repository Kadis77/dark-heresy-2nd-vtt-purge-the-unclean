import { itemDescriptionFields } from '../common/item-fields.mjs';

export class TraitDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            level: new f.NumberField({ initial: 0, integer: true }),
        };
    }
}
