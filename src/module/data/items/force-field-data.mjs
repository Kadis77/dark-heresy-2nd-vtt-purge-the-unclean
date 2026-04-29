import { physicalItemFields, itemDescriptionFields, actionFields, backpackItemFields } from '../common/item-fields.mjs';

export class ForceFieldItemDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...physicalItemFields(),
            ...itemDescriptionFields(),
            ...actionFields(),
            ...backpackItemFields(),
            protectionRating: new f.NumberField({ initial: 0, integer: true }),
            activated: new f.BooleanField({ initial: false }),
            overloaded: new f.BooleanField({ initial: false }),
        };
    }
}
