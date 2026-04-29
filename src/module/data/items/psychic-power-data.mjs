import { itemDescriptionFields, damageFields, attackFields } from '../common/item-fields.mjs';

export class PsychicPowerDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const f = foundry.data.fields;
        return {
            ...itemDescriptionFields(),
            ...damageFields(),
            ...attackFields(),
            // Note: psychicPower overrides the "action" template's target field with its own complex object
            effect: new f.StringField({ initial: '' }),
            action: new f.StringField({ initial: 'Half Action' }),
            container: new f.BooleanField({ initial: true }),
            containerTypes: new f.ArrayField(new f.StringField(), { initial: ['attackSpecial'] }),
            cost: new f.NumberField({ initial: 0, integer: true }),
            sustained: new f.StringField({ initial: 'No' }),
            discipline: new f.StringField({ initial: '' }),
            subtype: new f.StringField({ initial: 'Concentration' }),
            target: new f.SchemaField({
                bonus: new f.NumberField({ initial: 0, integer: true }),
                useSkill: new f.BooleanField({ initial: false }),
                characteristic: new f.StringField({ initial: 'willpower' }),
                skill: new f.StringField({ initial: 'None' }),
                opposedBonus: new f.NumberField({ initial: 0, integer: true }),
                isOpposed: new f.BooleanField({ initial: false }),
                useOpposedSkill: new f.BooleanField({ initial: false }),
                opposed: new f.StringField({ initial: 'willpower' }),
                opposedSkill: new f.StringField({ initial: 'None' }),
            }),
        };
    }
}
