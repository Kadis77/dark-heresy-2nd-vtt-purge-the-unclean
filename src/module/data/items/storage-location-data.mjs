import { itemDescriptionFields } from '../common/item-fields.mjs';

export class StorageLocationDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            location: new f.StringField({ initial: '' }),
            container: new f.BooleanField({ initial: true }),
            containerTypes: new f.ArrayField(new f.StringField(), {
                initial: ['ammunition', 'armour', 'armourModification', 'cybernetic', 'consumable', 'drug', 'forceField', 'gear', 'tool', 'weapon', 'weaponModification'],
            }),
        };
    }
}
