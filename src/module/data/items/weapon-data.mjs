import { physicalItemFields, itemDescriptionFields, damageFields, attackFields, actionFields, backpackItemFields } from '../common/item-fields.mjs';

export class WeaponDataModel extends foundry.abstract.TypeDataModel {
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
            containerTypes: new f.ArrayField(new f.StringField(), { initial: ['weaponModification', 'attackSpecial', 'ammunition'] }),
            class: new f.StringField({ initial: '' }),
            type: new f.StringField({ initial: '' }),
            reload: new f.StringField({ initial: '' }),
            clip: new f.SchemaField({
                max: new f.NumberField({ initial: 0, integer: true }),
                value: new f.NumberField({ initial: 0, integer: true }),
            }),
            modifications: new f.ArrayField(new f.ObjectField()),
        };
    }
}
