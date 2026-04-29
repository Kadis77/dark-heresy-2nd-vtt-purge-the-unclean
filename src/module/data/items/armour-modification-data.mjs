import { physicalItemFields, itemDescriptionFields, backpackItemFields } from '../common/item-fields.mjs';

export class ArmourModificationDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...backpackItemFields(),
        };
    }
}
