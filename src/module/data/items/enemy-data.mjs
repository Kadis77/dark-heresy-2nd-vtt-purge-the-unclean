import { itemDescriptionFields } from '../common/item-fields.mjs';

/** Used by: enemy, peer */
export class EnemyDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            name: new f.StringField({ initial: '' }),
            modifier: new f.NumberField({ initial: 0, integer: true }),
        };
    }
}
