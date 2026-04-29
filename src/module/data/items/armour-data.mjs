import { physicalItemFields, itemDescriptionFields, armourPointFields, backpackItemFields } from '../common/item-fields.mjs';

export class ArmourDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...armourPointFields(),
            ...backpackItemFields(),
            container: new f.BooleanField({ initial: true }),
            containerTypes: new f.ArrayField(new f.StringField(), { initial: ['armourModification'] }),
            maxAgility: new f.NumberField({ initial: 0, integer: true }),
        };
    }
}
