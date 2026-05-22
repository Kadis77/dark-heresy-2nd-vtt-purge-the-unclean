import { ActorContainerSheet } from './actor-container-sheet.mjs';
import { DHBasicActionManager } from '../../actions/basic-action-manager.mjs';
import { DHTargetedActionManager } from '../../actions/targeted-action-manager.mjs';
import { Hit } from '../../rolls/damage-data.mjs';
import { AssignDamageData } from '../../rolls/assign-damage-data.mjs';
import { prepareAssignDamageRoll } from '../../prompts/assign-damage-prompt.mjs';
import { categorizeCarryItems, stashUpdateData, gridPlaceUpdateData, unstashUpdateData } from '../../carry-grid-helpers.mjs';

export class AcolyteSheet extends ActorContainerSheet {
    static DEFAULT_OPTIONS = {
        classes: ['dark-heresy-2nd', 'sheet', 'actor'],
        position: { width: 1000, height: 750 },
        window: { resizable: true },
        form: { closeOnSubmit: false },
    };

    tabGroups = { primary: 'main' };

    static PARTS = {
        body: { template: 'systems/dark-heresy-2nd/templates/actor/actor-acolyte-sheet.hbs' },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.dh = CONFIG.dh;
        context.effects = this.actor.effects.contents;

        // Carry grid context
        context.carryGrid = this.actor.system.carryGrid;

        const { carryGridItems, unplacedItems, stashedItems } = categorizeCarryItems([...this.actor.items]);
        context.carryGridItems = carryGridItems;
        context.unplacedItems = unplacedItems;
        context.stashedItems = stashedItems;

        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        // Carry grid drag/drop
        const grid = this.element.querySelector('.dh-carry-grid');
        if (grid) {
            grid.addEventListener('dragover',  (ev) => this._onGridDragOver(ev));
            grid.addEventListener('drop',      (ev) => this._onGridDrop(ev));
            grid.addEventListener('dragleave', ()   => this._clearGridHighlight());
        }
        this.element.querySelectorAll('.grid-item, .unplaced-item, .stash-item').forEach(el => {
            el.addEventListener('dragstart', (ev) => this._onGridItemDragStart(ev));
            el.addEventListener('dragend',   ()   => { this._draggingItemData = null; el.classList.remove('dragging'); });
        });
        this.element.querySelectorAll('.grid-item').forEach(el => {
            el.addEventListener('dblclick',    (ev) => this._onGridItemEdit(ev));
            el.addEventListener('contextmenu', (ev) => this._onGridItemRemove(ev));
        });
        this.element.querySelectorAll('.stash-item').forEach(el => {
            el.addEventListener('dblclick',    (ev) => this._onGridItemEdit(ev));
            el.addEventListener('contextmenu', (ev) => this._onStashItemUnstash(ev));
        });

        const stashZone = this.element.querySelector('.dh-stash-dropzone');
        if (stashZone) {
            stashZone.addEventListener('dragover',  (ev) => this._onStashDragOver(ev));
            stashZone.addEventListener('drop',      (ev) => this._onStashDrop(ev));
            stashZone.addEventListener('dragleave', ()   => this._clearStashHighlight());
        }

        this.element.querySelectorAll('.roll-characteristic').forEach(el =>
            el.addEventListener('click', async (ev) => await this._prepareRollCharacteristic(ev)));
        this.element.querySelectorAll('.roll-skill').forEach(el =>
            el.addEventListener('click', async (ev) => await this._prepareRollSkill(ev)));
        this.element.querySelectorAll('.acolyte-homeWorld').forEach(el =>
            el.addEventListener('change', async (ev) => await this._onHomeworldChange(ev)));
        this.element.querySelectorAll('.bonus-vocalize').forEach(el =>
            el.addEventListener('click', async (ev) => await this._onBonusVocalize(ev)));
        this.element.querySelectorAll('.combat-control').forEach(el =>
            el.addEventListener('click', async (ev) => await this._combatControls(ev)));
    }

    // ─── Carry Grid ─────────────────────────────────────────────────────────

    _onGridItemDragStart(event) {
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (!item) return;
        this._draggingItemData = {
            type: 'carry-grid-item',
            itemId: item.id,
            gridWidth: item.system.gridWidth,
            gridHeight: item.system.gridHeight,
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(this._draggingItemData));
        event.currentTarget.classList.add('dragging');
        event.stopPropagation();
    }

    _getGridCellFromEvent(event, grid) {
        const rect = grid.getBoundingClientRect();
        const cellSize = 40;
        return {
            x: Math.max(0, Math.floor((event.clientX - rect.left) / cellSize)),
            y: Math.max(0, Math.floor((event.clientY - rect.top)  / cellSize)),
        };
    }

    _checkOverlap(movingItemId, x, y, w, h) {
        const { width, height } = this.actor.system.carryGrid;
        if (x < 0 || y < 0 || x + w > width || y + h > height) return true;
        for (const item of this.actor.items) {
            if (item.id === movingItemId || item.system.gridX == null) continue;
            const ox = item.system.gridX, oy = item.system.gridY;
            const ow = item.system.gridWidth, oh = item.system.gridHeight;
            if (x < ox + ow && x + w > ox && y < oy + oh && y + h > oy) return true;
        }
        return false;
    }

    _onGridDragOver(event) {
        event.preventDefault();
        const data = this._draggingItemData;
        if (!data || data.type !== 'carry-grid-item') return;
        const grid = this.element.querySelector('.dh-carry-grid');
        const { x, y } = this._getGridCellFromEvent(event, grid);
        const valid = !this._checkOverlap(data.itemId, x, y, data.gridWidth, data.gridHeight);
        grid.classList.toggle('drag-over-valid',   valid);
        grid.classList.toggle('drag-over-invalid', !valid);
    }

    async _onGridDrop(event) {
        event.preventDefault();
        const grid = this.element.querySelector('.dh-carry-grid');
        this._clearGridHighlight();
        let data;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch { return; }
        if (data.type !== 'carry-grid-item') return super._onDrop(event);
        const { x, y } = this._getGridCellFromEvent(event, grid);
        if (this._checkOverlap(data.itemId, x, y, data.gridWidth, data.gridHeight)) {
            ui.notifications.warn('Item does not fit there.');
            return;
        }
        const item = this.actor.items.get(data.itemId);
        if (item) await item.update(gridPlaceUpdateData(x, y));
    }

    _clearGridHighlight() {
        const grid = this.element.querySelector('.dh-carry-grid');
        if (grid) grid.classList.remove('drag-over-valid', 'drag-over-invalid');
    }

    // ─── Stash ───────────────────────────────────────────────────────────────

    _onStashDragOver(event) {
        event.preventDefault();
        if (!this._draggingItemData || this._draggingItemData.type !== 'carry-grid-item') return;
        event.currentTarget.classList.add('drag-over-valid');
    }

    _clearStashHighlight() {
        const zone = this.element.querySelector('.dh-stash-dropzone');
        if (zone) zone.classList.remove('drag-over-valid');
    }

    async _onStashDrop(event) {
        event.preventDefault();
        this._clearStashHighlight();
        let data;
        try { data = JSON.parse(event.dataTransfer.getData('text/plain')); } catch { return; }
        if (data.type !== 'carry-grid-item') return;
        const item = this.actor.items.get(data.itemId);
        if (item) await item.update(stashUpdateData());
    }

    async _onStashItemUnstash(event) {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) await item.update(unstashUpdateData());
    }

    // ────────────────────────────────────────────────────────────────────────

    _onGridItemEdit(event) {
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) item.sheet.render(true);
    }

    async _onGridItemRemove(event) {
        event.preventDefault();
        event.stopPropagation();
        const item = this.actor.items.get(event.currentTarget.dataset.itemId);
        if (item) await item.update({ 'system.gridX': null, 'system.gridY': null });
    }

    // ────────────────────────────────────────────────────────────────────────

    async _combatControls(event) {
        switch (event.currentTarget.dataset.action) {
            case 'attack':
                await DHTargetedActionManager.performWeaponAttack(this.actor);
                break;
            case 'assign-damage': {
                const hitData = new Hit();
                const assignData = new AssignDamageData(this.actor, hitData);
                await prepareAssignDamageRoll(assignData);
                break;
            }
            case 'dodge':
                await this.actor.rollSkill('dodge');
                break;
            case 'parry':
                await this.actor.rollSkill('parry');
                break;
        }
    }

    async _onBonusVocalize(event) {
        const bonus = this.actor.backgroundEffects.abilities.find(
            (a) => a.name === event.currentTarget.dataset.bonusName
        );
        if (bonus) {
            await DHBasicActionManager.sendItemVocalizeChat({
                actor: this.actor.name,
                name: bonus.name,
                type: bonus.source,
                description: bonus.benefit,
            });
        }
    }

    async _prepareRollCharacteristic(event) {
        await this.actor.rollCharacteristic(event.currentTarget.dataset.characteristic);
    }

    async _prepareRollSkill(event) {
        const el = event.currentTarget;
        await this.actor.rollSkill(el.dataset.skill, el.dataset.specialty);
    }

    async _onHomeworldChange() {
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: 'Roll Characteristics?' },
            content: '<p>Would you like to roll Wounds and Fate for this homeworld?</p>',
            rejectClose: false,
        });
        if (confirmed) {
            if (!this.actor.backgroundEffects?.homeworld) return;
            const woundRoll = new Roll(this.actor.backgroundEffects.homeworld.wounds);
            await woundRoll.evaluate();
            const fateRoll = new Roll('1d10');
            await fateRoll.evaluate();
            await this.actor.update({
                'system.wounds.max': woundRoll.total,
                'system.fate.max': parseInt(this.actor.backgroundEffects.homeworld.fate_threshold) +
                    (fateRoll.total >= this.actor.backgroundEffects.homeworld.emperors_blessing ? 1 : 0),
            });
        }
    }
}
