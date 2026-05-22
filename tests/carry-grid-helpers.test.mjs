import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    categorizeCarryItems,
    stashUpdateData,
    gridPlaceUpdateData,
    unstashUpdateData,
} from '../src/module/carry-grid-helpers.mjs';

// ─── Factories ───────────────────────────────────────────────────────────────

function makeItem(overrides = {}) {
    const { system: systemOverrides = {}, ...rest } = overrides;
    return {
        id: 'item-1',
        name: 'Test Item',
        type: 'weapon',
        isPhysical: true,
        system: {
            gridX: null,
            gridY: null,
            gridWidth: 2,
            gridHeight: 1,
            stashed: false,
            ...systemOverrides,
        },
        ...rest,
    };
}

// ─── categorizeCarryItems ────────────────────────────────────────────────────

describe('categorizeCarryItems', () => {
    describe('carryGridItems', () => {
        it('includes an item that has a grid position and is not stashed', () => {
            const items = [makeItem({ system: { gridX: 0, gridY: 0 } })];
            const { carryGridItems } = categorizeCarryItems(items);
            assert.strictEqual(carryGridItems.length, 1);
        });

        it('converts 0-based gridX/gridY to 1-based colStart/rowStart', () => {
            const items = [makeItem({ system: { gridX: 2, gridY: 3 } })];
            const { carryGridItems } = categorizeCarryItems(items);
            assert.strictEqual(carryGridItems[0].gridColStart, 3);
            assert.strictEqual(carryGridItems[0].gridRowStart, 4);
        });

        it('excludes an item that is stashed even if it has a grid position', () => {
            const items = [makeItem({ system: { gridX: 0, gridY: 0, stashed: true } })];
            const { carryGridItems } = categorizeCarryItems(items);
            assert.strictEqual(carryGridItems.length, 0);
        });

        it('excludes an item with no grid position', () => {
            const items = [makeItem()]; // gridX: null
            const { carryGridItems } = categorizeCarryItems(items);
            assert.strictEqual(carryGridItems.length, 0);
        });

        it('maps id, name, type, gridWidth, gridHeight correctly', () => {
            const items = [makeItem({ id: 'w1', name: 'Laspistol', type: 'weapon', system: { gridX: 1, gridY: 2, gridWidth: 3, gridHeight: 2 } })];
            const [item] = categorizeCarryItems(items).carryGridItems;
            assert.strictEqual(item.id, 'w1');
            assert.strictEqual(item.name, 'Laspistol');
            assert.strictEqual(item.type, 'weapon');
            assert.strictEqual(item.gridWidth, 3);
            assert.strictEqual(item.gridHeight, 2);
        });
    });

    describe('unplacedItems', () => {
        it('includes a physical item with no grid position and not stashed', () => {
            const items = [makeItem()];
            const { unplacedItems } = categorizeCarryItems(items);
            assert.strictEqual(unplacedItems.length, 1);
        });

        it('excludes a stashed item even with no grid position', () => {
            const items = [makeItem({ system: { stashed: true } })];
            const { unplacedItems } = categorizeCarryItems(items);
            assert.strictEqual(unplacedItems.length, 0);
        });

        it('excludes a non-physical item', () => {
            const items = [makeItem({ isPhysical: false })];
            const { unplacedItems } = categorizeCarryItems(items);
            assert.strictEqual(unplacedItems.length, 0);
        });

        it('excludes an item that is placed on the grid', () => {
            const items = [makeItem({ system: { gridX: 0, gridY: 0 } })];
            const { unplacedItems } = categorizeCarryItems(items);
            assert.strictEqual(unplacedItems.length, 0);
        });

        it('maps id, name, type, gridWidth, gridHeight correctly', () => {
            const items = [makeItem({ id: 'g1', name: 'Torch', type: 'gear', system: { gridWidth: 1, gridHeight: 1 } })];
            const [item] = categorizeCarryItems(items).unplacedItems;
            assert.strictEqual(item.id, 'g1');
            assert.strictEqual(item.name, 'Torch');
            assert.strictEqual(item.type, 'gear');
            assert.strictEqual(item.gridWidth, 1);
            assert.strictEqual(item.gridHeight, 1);
        });
    });

    describe('stashedItems', () => {
        it('includes a physical stashed item', () => {
            const items = [makeItem({ system: { stashed: true } })];
            const { stashedItems } = categorizeCarryItems(items);
            assert.strictEqual(stashedItems.length, 1);
        });

        it('excludes a non-physical stashed item', () => {
            const items = [makeItem({ isPhysical: false, system: { stashed: true } })];
            const { stashedItems } = categorizeCarryItems(items);
            assert.strictEqual(stashedItems.length, 0);
        });

        it('excludes an item that is not stashed', () => {
            const items = [makeItem()];
            const { stashedItems } = categorizeCarryItems(items);
            assert.strictEqual(stashedItems.length, 0);
        });

        it('maps only id, name, type (no grid fields)', () => {
            const items = [makeItem({ id: 's1', name: 'Backpack', type: 'gear', system: { stashed: true } })];
            const [item] = categorizeCarryItems(items).stashedItems;
            assert.strictEqual(item.id, 's1');
            assert.strictEqual(item.name, 'Backpack');
            assert.strictEqual(item.type, 'gear');
            assert.strictEqual(item.gridWidth, undefined);
        });
    });

    describe('mutual exclusivity', () => {
        it('each item appears in exactly one bucket', () => {
            const items = [
                makeItem({ id: 'a', system: { gridX: 0, gridY: 0 } }),         // on grid
                makeItem({ id: 'b' }),                                           // unplaced
                makeItem({ id: 'c', system: { stashed: true } }),                // stashed
            ];
            const { carryGridItems, unplacedItems, stashedItems } = categorizeCarryItems(items);
            const allIds = [
                ...carryGridItems.map(i => i.id),
                ...unplacedItems.map(i => i.id),
                ...stashedItems.map(i => i.id),
            ];
            assert.strictEqual(allIds.length, 3);
            assert.deepStrictEqual(new Set(allIds), new Set(['a', 'b', 'c']));
        });

        it('a stashed item with a grid position is stashed, not on the grid', () => {
            // gridX is set but stashed wins — stashed items always have gridX cleared
            // in practice, but the filter should handle this case defensively.
            const items = [makeItem({ id: 'x', system: { gridX: 2, gridY: 1, stashed: true } })];
            const { carryGridItems, stashedItems } = categorizeCarryItems(items);
            assert.strictEqual(carryGridItems.length, 0);
            assert.strictEqual(stashedItems.length, 1);
        });

        it('returns empty arrays for an empty item list', () => {
            const { carryGridItems, unplacedItems, stashedItems } = categorizeCarryItems([]);
            assert.strictEqual(carryGridItems.length, 0);
            assert.strictEqual(unplacedItems.length, 0);
            assert.strictEqual(stashedItems.length, 0);
        });
    });
});

// ─── State transition helpers ────────────────────────────────────────────────

describe('stashUpdateData', () => {
    it('sets stashed to true', () => {
        assert.strictEqual(stashUpdateData()['system.stashed'], true);
    });

    it('clears gridX and gridY to null', () => {
        const data = stashUpdateData();
        assert.strictEqual(data['system.gridX'], null);
        assert.strictEqual(data['system.gridY'], null);
    });
});

describe('gridPlaceUpdateData', () => {
    it('sets the correct gridX and gridY', () => {
        const data = gridPlaceUpdateData(3, 7);
        assert.strictEqual(data['system.gridX'], 3);
        assert.strictEqual(data['system.gridY'], 7);
    });

    it('sets stashed to false', () => {
        assert.strictEqual(gridPlaceUpdateData(0, 0)['system.stashed'], false);
    });

    it('works with position (0, 0)', () => {
        const data = gridPlaceUpdateData(0, 0);
        assert.strictEqual(data['system.gridX'], 0);
        assert.strictEqual(data['system.gridY'], 0);
    });
});

describe('unstashUpdateData', () => {
    it('sets stashed to false', () => {
        assert.strictEqual(unstashUpdateData()['system.stashed'], false);
    });

    it('does not set gridX or gridY (item stays unplaced)', () => {
        const data = unstashUpdateData();
        assert.strictEqual('system.gridX' in data, false);
        assert.strictEqual('system.gridY' in data, false);
    });
});
