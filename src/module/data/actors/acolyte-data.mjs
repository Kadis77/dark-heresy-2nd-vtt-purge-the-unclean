import { baseActorFields, creatureActorFields } from '../common/actor-fields.mjs';

export class AcolyteDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...baseActorFields(),
            ...creatureActorFields(),
            bio: new f.SchemaField({
                homeWorld: new f.StringField({ initial: '' }),
                background: new f.StringField({ initial: '' }),
                role: new f.StringField({ initial: '' }),
                elite: new f.StringField({ initial: '' }),
                divination: new f.StringField({ initial: '' }),
                gender: new f.StringField({ initial: '' }),
                age: new f.StringField({ initial: '' }),
                build: new f.StringField({ initial: '' }),
                complexion: new f.StringField({ initial: '' }),
                hair: new f.StringField({ initial: '' }),
                quirks: new f.StringField({ initial: '' }),
                superstition: new f.StringField({ initial: '' }),
                mementos: new f.StringField({ initial: '' }),
                notes: new f.StringField({ initial: '' }),
            }),
            experience: new f.SchemaField({
                used: new f.NumberField({ initial: 0, integer: true }),
                total: new f.NumberField({ initial: 0, integer: true }),
            }),
            insanity: new f.NumberField({ initial: 0, integer: true }),
            corruption: new f.NumberField({ initial: 0, integer: true }),
            aptitudes: new f.ObjectField(),
        };
    }
}
