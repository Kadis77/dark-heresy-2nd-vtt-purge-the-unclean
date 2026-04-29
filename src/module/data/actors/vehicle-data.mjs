import { baseActorFields, npcActorFields } from '../common/actor-fields.mjs';

export class VehicleDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...baseActorFields(),
            ...npcActorFields(),
            front: new f.StringField({ initial: '' }),
            side: new f.StringField({ initial: '' }),
            rear: new f.StringField({ initial: '' }),
            availability: new f.StringField({ initial: '' }),
            speed: new f.SchemaField({
                cruising: new f.NumberField({ initial: 0, integer: true }),
                tactical: new f.NumberField({ initial: 0, integer: true }),
            }),
            crew: new f.StringField({ initial: '' }),
            manoeuverability: new f.NumberField({ initial: 0, integer: true }),
            carryingCapacity: new f.NumberField({ initial: 0, integer: true }),
            integrity: new f.SchemaField({
                max: new f.NumberField({ initial: 0, integer: true }),
                value: new f.NumberField({ initial: 0, integer: true }),
                critical: new f.NumberField({ initial: 0, integer: true }),
            }),
        };
    }
}
