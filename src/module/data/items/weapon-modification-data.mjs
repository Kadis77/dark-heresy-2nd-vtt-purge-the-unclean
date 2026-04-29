import { physicalItemFields, itemDescriptionFields, damageFields, attackFields, backpackItemFields } from '../common/item-fields.mjs';

export class WeaponModificationDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...damageFields(),
            ...attackFields(),
            ...backpackItemFields(),
        };
    }
}
