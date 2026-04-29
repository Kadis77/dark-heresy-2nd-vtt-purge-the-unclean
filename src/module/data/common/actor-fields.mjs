/**
 * Shared field builder functions for actor TypeDataModels.
 * These correspond to the shared templates in the old template.json.
 */

export function characteristicField(label, short) {
    const f = foundry.data.fields;
    return new f.SchemaField({
        label: new f.StringField({ initial: label }),
        short: new f.StringField({ initial: short }),
        base: new f.NumberField({ initial: 0, integer: true }),
        advance: new f.NumberField({ initial: 0, integer: true }),
        modifier: new f.NumberField({ initial: 0, integer: true }),
        unnatural: new f.NumberField({ initial: 0, integer: true }),
        cost: new f.NumberField({ initial: 0, integer: true }),
    });
}

export function skillField(label, characteristics, characteristic, isSpecialist = false) {
    const f = foundry.data.fields;
    return new f.SchemaField({
        label: new f.StringField({ initial: label }),
        characteristics: new f.ArrayField(new f.StringField(), { initial: [...characteristics] }),
        selectedCharacteristic: new f.StringField({ initial: '' }),
        advance: new f.NumberField({ initial: 0, integer: true }),
        isSpecialist: new f.BooleanField({ initial: isSpecialist }),
        specialities: new f.ObjectField(),
        cost: new f.NumberField({ initial: 0, integer: true }),
        characteristic: new f.StringField({ initial: characteristic }),
    });
}

/** Fields shared by all actor types (the "base" template). */
export function baseActorFields() {
    const f = foundry.data.fields;
    return {
        wounds: new f.SchemaField({
            max: new f.NumberField({ initial: 0, integer: true }),
            value: new f.NumberField({ initial: 0, integer: true }),
            critical: new f.NumberField({ initial: 0, integer: true }),
            rolled: new f.BooleanField({ initial: false }),
        }),
        initiative: new f.SchemaField({
            characteristic: new f.StringField({ initial: 'agility' }),
            base: new f.StringField({ initial: '1d10' }),
        }),
        size: new f.NumberField({ initial: 4, integer: true }),
        characteristics: new f.SchemaField({
            weaponSkill: characteristicField('Weapon Skill', 'WS'),
            ballisticSkill: characteristicField('Ballistic Skill', 'BS'),
            strength: characteristicField('Strength', 'S'),
            toughness: characteristicField('Toughness', 'T'),
            agility: characteristicField('Agility', 'Ag'),
            intelligence: characteristicField('Intelligence', 'Int'),
            perception: characteristicField('Perception', 'Per'),
            willpower: characteristicField('Willpower', 'WP'),
            fellowship: characteristicField('Fellowship', 'Fel'),
            influence: characteristicField('Influence', 'Inf'),
        }),
    };
}

/** Fields shared by acolyte and npc actor types (the "creature" template). */
export function creatureActorFields() {
    const f = foundry.data.fields;
    return {
        fatigue: new f.SchemaField({
            max: new f.NumberField({ initial: 0, integer: true }),
            value: new f.NumberField({ initial: 0, integer: true }),
        }),
        fate: new f.SchemaField({
            max: new f.NumberField({ initial: 0, integer: true }),
            value: new f.NumberField({ initial: 0, integer: true }),
            rolled: new f.BooleanField({ initial: false }),
        }),
        psy: new f.SchemaField({
            rating: new f.NumberField({ initial: 0, integer: true }),
            sustained: new f.NumberField({ initial: 0, integer: true }),
            defaultPR: new f.NumberField({ initial: 0, integer: true }),
            class: new f.StringField({ initial: 'bound' }),
            cost: new f.NumberField({ initial: 0, integer: true }),
            hasFocus: new f.BooleanField({ initial: false }),
        }),
        backpack: new f.SchemaField({
            hasBackpack: new f.BooleanField({ initial: false }),
            name: new f.StringField({ initial: 'Backpack' }),
            isCombatVest: new f.BooleanField({ initial: false }),
            weight: new f.SchemaField({
                max: new f.NumberField({ initial: 30, integer: true }),
            }),
        }),
        skills: new f.SchemaField({
            acrobatics: skillField('Acrobatics', ['Ag', 'S'], 'Ag'),
            athletics: skillField('Athletics', ['S', 'T'], 'S'),
            awareness: skillField('Awareness', ['Per', 'Fel', 'Int'], 'Per'),
            charm: skillField('Charm', ['Fel', 'Inf'], 'Fel'),
            command: skillField('Command', ['Fel', 'Int', 'S', 'WP'], 'Fel'),
            commerce: skillField('Commerce', ['Int', 'Fel'], 'Int'),
            commonLore: skillField('Common Lore', ['Int', 'Fel'], 'Int', true),
            deceive: skillField('Deceive', ['Fel', 'Int'], 'Fel'),
            dodge: skillField('Dodge', ['Ag'], 'Ag'),
            forbiddenLore: skillField('Forbidden Lore', ['Int', 'Fel'], 'Int', true),
            inquiry: skillField('Inquiry', ['Fel', 'Int', 'Per'], 'Fel'),
            interrogation: skillField('Interrogation', ['WP', 'Fel'], 'WP'),
            intimidate: skillField('Intimidate', ['S', 'WP'], 'S'),
            linguistics: skillField('Linguistics', ['Int', 'Fel'], 'Int', true),
            logic: skillField('Logic', ['Int', 'Ag'], 'Int'),
            medicae: skillField('Medicae', ['Int', 'Ag', 'Per'], 'Int'),
            navigate: skillField('Navigate', ['Int', 'Per'], 'Int', true),
            operate: skillField('Operate', ['Ag', 'Int'], 'Ag', true),
            parry: skillField('Parry', ['WS'], 'WS'),
            psyniscience: skillField('Psyniscience', ['Per', 'WP'], 'Per'),
            scholasticLore: skillField('Scholastic Lore', ['Int', 'Fel'], 'Int', true),
            scrutiny: skillField('Scrutiny', ['Per', 'Fel'], 'Per'),
            security: skillField('Security', ['Int', 'Ag'], 'Int'),
            sleightOfHand: skillField('Sleight of Hand', ['Ag', 'Int'], 'Ag'),
            stealth: skillField('Stealth', ['Ag', 'Per'], 'Ag'),
            survival: skillField('Survival', ['Per', 'Ag', 'Int'], 'Per'),
            techUse: skillField('Tech Use', ['Int', 'Ag'], 'Int'),
            trade: skillField('Trade', ['Int', 'Ag', 'Fel'], 'Int', true),
        }),
    };
}

/** Fields for the "npc" template. */
export function npcActorFields() {
    const f = foundry.data.fields;
    return {
        faction: new f.StringField({ initial: '' }),
        subfaction: new f.StringField({ initial: '' }),
        type: new f.StringField({ initial: 'troop' }),
        threatLevel: new f.NumberField({ initial: 0, integer: true }),
    };
}
