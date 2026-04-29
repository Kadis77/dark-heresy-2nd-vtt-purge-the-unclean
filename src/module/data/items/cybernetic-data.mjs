import { physicalItemFields, itemDescriptionFields, armourPointFields, backpackItemFields } from '../common/item-fields.mjs';

export class CyberneticDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...armourPointFields(),
            ...backpackItemFields(),
            hasArmourPoints: new f.BooleanField({ initial: false }),
        };
    }
}
