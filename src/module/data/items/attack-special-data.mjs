import { itemDescriptionFields } from '../common/item-fields.mjs';

export class AttackSpecialDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            enabled: new f.BooleanField({ initial: true }),
            hasLevel: new f.BooleanField({ initial: false }),
            level: new f.NumberField({ initial: 0, integer: true }),
        };
    }
}
