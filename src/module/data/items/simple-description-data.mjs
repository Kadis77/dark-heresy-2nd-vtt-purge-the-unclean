import { itemDescriptionFields } from '../common/item-fields.mjs';

/** Used by: aptitude, malignancy, mentalDisorder, mutation, backpack */
export class SimpleDescriptionDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return { ...itemDescriptionFields() };
    }
}
