/**
 * Shared field builder functions for item TypeDataModels.
 * These correspond to the shared item templates in the old template.json.
 */

export function physicalItemFields() {
    const f = foundry.data.fields;
    return {
        craftsmanship: new f.StringField({ initial: 'common' }),
        availability: new f.StringField({ initial: 'common' }),
        equipped: new f.BooleanField({ initial: false }),
        gridWidth: new f.NumberField({ initial: 1, integer: true }),
        gridHeight: new f.NumberField({ initial: 1, integer: true }),
        gridX: new f.NumberField({ initial: null, integer: true, nullable: true }),
        gridY: new f.NumberField({ initial: null, integer: true, nullable: true }),
        stashed: new f.BooleanField({ initial: false }),
        isNaturallyCovert: new f.BooleanField({ initial: false }),
    };
}

export function itemDescriptionFields() {
    const f = foundry.data.fields;
    return {
        description: new f.HTMLField({ initial: '' }),
        source: new f.StringField({ initial: '' }),
    };
}

export function armourPointFields() {
    const f = foundry.data.fields;
    return {
        type: new f.StringField({ initial: '' }),
        armourPoints: new f.SchemaField({
            head: new f.NumberField({ initial: 0, integer: true }),
            leftArm: new f.NumberField({ initial: 0, integer: true }),
            rightArm: new f.NumberField({ initial: 0, integer: true }),
            body: new f.NumberField({ initial: 0, integer: true }),
            leftLeg: new f.NumberField({ initial: 0, integer: true }),
            rightLeg: new f.NumberField({ initial: 0, integer: true }),
        }),
    };
}

export function attackFields() {
    const f = foundry.data.fields;
    return {
        range: new f.StringField({ initial: '' }),
        attackType: new f.StringField({ initial: '' }),
        attackBonus: new f.NumberField({ initial: 0, integer: true }),
        rateOfFire: new f.SchemaField({
            single: new f.NumberField({ initial: 1, integer: true }),
            burst: new f.NumberField({ initial: 0, integer: true }),
            full: new f.NumberField({ initial: 0, integer: true }),
        }),
    };
}

export function damageFields() {
    const f = foundry.data.fields;
    return {
        damage: new f.StringField({ initial: '' }),
        damageType: new f.StringField({ initial: '' }),
        penetration: new f.StringField({ initial: '' }),
        special: new f.ObjectField(),
    };
}

export function actionFields() {
    const f = foundry.data.fields;
    return {
        target: new f.StringField({ initial: '' }),
        effect: new f.StringField({ initial: '' }),
    };
}

