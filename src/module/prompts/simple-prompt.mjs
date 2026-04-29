import { sendActionDataToChat } from '../rolls/roll-helpers.mjs';

/**
 *
 * @param simpleSkillData {SimpleSkillData}
 * @returns {Promise<void>}
 */
export async function prepareSimpleRoll(simpleSkillData) {
    const content = await renderTemplate('systems/dark-heresy-2nd/templates/prompt/simple-roll-prompt.hbs', simpleSkillData);
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Roll Modifier' },
        content,
        rejectClose: false,
        buttons: [
            {
                action: 'roll',
                label: 'Roll',
                icon: "<i class='dh-material'>casino</i>",
                default: true,
                callback: async (event, button, dialog) => {
                    const rollData = simpleSkillData.rollData;
                    rollData.modifiers['difficulty'] = parseInt(dialog.querySelector('[id=difficulty]')?.value ?? 0);
                    rollData.modifiers['modifier'] = dialog.querySelector('#modifier')?.value ?? 0;
                    await rollData.calculateTotalModifiers();
                    await simpleSkillData.calculateSuccessOrFailure();
                    await sendActionDataToChat(simpleSkillData);
                },
            },
            {
                action: 'cancel',
                label: 'Cancel',
                icon: "<i class='dh-material'>close</i>",
            },
        ],
    });
}

export async function prepareCreateSpecialistSkillPrompt(simpleSkillData) {
    const content = await renderTemplate('systems/dark-heresy-2nd/templates/prompt/add-speciality-prompt.hbs', simpleSkillData);
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Create Specialist Skill' },
        content,
        rejectClose: false,
        buttons: [
            {
                action: 'add',
                label: 'Add',
                icon: "<i class='dh-material'>add</i>",
                default: true,
                callback: async (event, button, dialog) => {
                    const speciality = dialog.querySelector('#speciality-name')?.value;
                    await simpleSkillData.actor.addSpecialitySkill(simpleSkillData.skillName, speciality);
                },
            },
            {
                action: 'cancel',
                label: 'Cancel',
                icon: "<i class='dh-material'>close</i>",
            },
        ],
    });
}
