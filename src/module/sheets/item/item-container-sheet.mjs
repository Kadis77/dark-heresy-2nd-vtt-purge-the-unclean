/**
 * An item sheet that can accept other items within it --
 * e.g. weapons with associated weapon mods
 */
import { DarkHeresyItemSheet } from './item-sheet.mjs';

export class DarkHeresyItemContainerSheet extends DarkHeresyItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        if (!context.item.system.container) {
            game.dh.warn('Unexpected Sheet Type: Item has container sheet but is not container?', context);
        }
        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);
        if (!this.isEditable) return;

        if (this.item.system.container) {
            const form = this.element.querySelector('form') ?? this.element;
            form.addEventListener('dragover', (ev) => this._onDragOver(ev));
            form.addEventListener('drop', (ev) => this._onDrop(ev));
            form.addEventListener('dragend', (ev) => this._onDragEnd(ev));

            this.element.querySelectorAll('.item-roll').forEach(el =>
                el.addEventListener('click', (ev) => this._onItemRoll(ev)));
            this.element.querySelectorAll('.item-create').forEach(el =>
                el.addEventListener('click', async (ev) => await this._onItemCreate(ev)));
            this.element.querySelectorAll('.item-edit').forEach(el =>
                el.addEventListener('click', (ev) => this._onItemEdit(ev)));
            this.element.querySelectorAll('.item-delete').forEach(el =>
                el.addEventListener('click', async (ev) => await this._onItemDelete(ev)));
            this.element.querySelectorAll('.item-drag').forEach(el => {
                el.setAttribute('draggable', true);
                el.addEventListener('dragstart', this._onItemDragStart.bind(this), false);
            });
        }
    }

    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        let data;
        let item;
        let actor;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (data.type !== 'Item') {
                game.dh.log('ItemCollection | Containers only accept items', data);
                return false;
            } else {
                game.dh.log('_onDrop data: ', data);
                item = fromUuidSync(data.uuid);

                if (data.actor) {
                    actor = data.actor;
                } else if (data.uuid && data.uuid.startsWith('Actor.')) {
                    actor = await fromUuid(data.uuid);
                }

                // Check if Item already Exists
                if (this.item.items.find((i) => i._id === item._id)) {
                    game.dh.log('Item already exists in container -- ignoring');
                    return false;
                }
            }
        } catch (err) {
            game.dh.log('Item Container | drop error', err);
            return false;
        }

        if (item) {
            // Check up the chain that we are not dropping one of our parents onto us.
            let canAdd = this.item.id !== item._id;
            let parent = this.item.parent;
            let count = 0;
            while (parent && count < 10) {
                count += 1;
                canAdd = canAdd && parent.id !== item._id;
                parent = parent.parent;
            }
            if (!canAdd) {
                game.dh.log('ItemCollection | Cant drop on yourself');
                ui.notifications.info('Cannot drop item into itself');
                throw new Error('Dragging bag onto itself or ancestor opens a planar vortex and you are sucked into it');
            }
            // drop from player characters or another bag.
            if (this.canAdd(item)) {
                await this.item.createNestedDocuments([item]);
                if (actor && (actor.type === 'acolyte' || actor.isToken)) await actor.deleteEmbeddedDocuments('Item', [item._id]);
                return false;
            }
            // Item is not accepted by this container -- place back onto actor
            else if (this.item.parent) {
                if (actor && actor.type === 'acolyte') await actor.deleteEmbeddedDocuments('Item', [item._id]);
                await this.item.parent.createNestedDocuments([item]);
                ui.notifications.info('Item dropped back into actor.');
                return false;
            }
        }
        return false;
    }

    _onDragEnd(event) {
        event.preventDefault();
        return false;
    }

    _onDragOver(event) {
        event.preventDefault();
        return false;
    }

    _onItemRoll(event) {
        event.preventDefault();
        return false;
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.dataset.type;
        await this.item.createNestedDocuments([{ name: `New ${type.capitalize()}`, type }]);
    }

    _onItemEdit(event) {
        event.preventDefault();
        const item = this.item.items.get(event.currentTarget.dataset.itemId);
        item.sheet.render(true);
    }

    async _onItemDelete(event) {
        event.preventDefault();
        const itemId = event.currentTarget.dataset.itemId;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Confirm Delete' },
            content: '<p>Are you sure you would like to delete this?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            await this.item.deleteNestedDocuments([itemId]);
            this.render();
        }
    }

    async _onItemDragStart(event) {
        event.stopPropagation();
        game.dh.log('Item:_onItemDragStart', event);

        const element = event.currentTarget;
        if (!element.dataset?.itemId) {
            game.dh.log('No Item Id - Cancelling Drag');
            return;
        }

        const itemId = element.dataset.itemId;
        const item = this.item.items.get(itemId);
        if (!item) {
            game.dh.log('Default Foundry Handler');
            return super._onDragStart(event);
        }

        const dragData = {
            parentId: this.item.id,
            type: 'Item',
            data: item,
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        await this.item.deleteNestedDocuments([itemId]);
    }

    canAdd(itemData) {
        return this.item.system.containerTypes.includes(itemData.type);
    }
}
