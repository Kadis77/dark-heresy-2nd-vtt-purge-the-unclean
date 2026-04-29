import { sendActionDataToChat } from '../rolls/roll-helpers.mjs';
import { ActionData } from '../rolls/action-data.mjs';

export async function prepareDamageRoll(rollData) {
    rollData.dh = CONFIG.dh;
    const content = await renderTemplate('systems/dark-heresy-2nd/templates/prompt/damage-roll-prompt.hbs', rollData);
    await foundry.applications.api.DialogV2.wait({
        window: { title: 'Damage Roll' },
        content,
        rejectClose: false,
        buttons: [
            {
                action: 'roll',
                label: 'Roll',
                icon: "<i class='dh-material'>casino</i>",
                default: true,
                callback: async (event, button, dialog) => {
                    const actionData = new ActionData();
                    actionData.template = 'systems/dark-heresy-2nd/templates/chat/damage-roll-chat.hbs';

                    rollData.damage = dialog.querySelector('#damage')?.value;
                    rollData.penetration = dialog.querySelector('#penetration')?.value;
                    rollData.damageType = dialog.querySelector('[name=damageType]')?.value;
                    rollData.pr = dialog.querySelector('#pr')?.value;
                    rollData.template = 'systems/dark-heresy-2nd/templates/chat/damage-roll-chat.hbs';
                    rollData.roll = new Roll(rollData.damage, rollData);
                    await rollData.roll.evaluate();

                    actionData.rollData = rollData;
                    await sendActionDataToChat(actionData);
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
