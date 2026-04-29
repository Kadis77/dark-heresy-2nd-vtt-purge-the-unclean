import { physicalItemFields, itemDescriptionFields, damageFields, attackFields, actionFields, backpackItemFields } from '../common/item-fields.mjs';

export class AmmunitionDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...damageFields(),
            ...attackFields(),
            ...actionFields(),
            ...backpackItemFields(),
            container: new f.BooleanField({ initial: true }),
            containerTypes: new f.ArrayField(new f.StringField(), { initial: ['attackSpecial'] }),
            weaponType: new f.StringField({ initial: '' }),
        };
    }
}
