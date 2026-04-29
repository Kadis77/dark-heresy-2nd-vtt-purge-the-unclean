import { physicalItemFields, itemDescriptionFields, actionFields, backpackItemFields } from '../common/item-fields.mjs';

/** Used by: consumable, drug, tool, gear */
export class ConsumableDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...actionFields(),
            ...backpackItemFields(),
        };
    }
}
