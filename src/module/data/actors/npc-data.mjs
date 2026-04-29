import { baseActorFields, creatureActorFields, npcActorFields } from '../common/actor-fields.mjs';

export class NpcDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ...baseActorFields(),
            ...creatureActorFields(),
            ...npcActorFields(),
        };
    }
}
