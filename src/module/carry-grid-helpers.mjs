/**
 * Pure helper functions for carry-grid item categorisation and stash state transitions.
 * No Foundry globals — safe to import in unit tests.
 */

/**
 * Split a list of actor items into the three carry-grid buckets.
 *
 * @param {object[]} items - Raw item documents (or plain objects with the same shape).
 * @returns {{ carryGridItems, unplacedItems, stashedItems }}
 */
export function categorizeCarryItems(items) {
    const carryGridItems = items
        .filter(i => i.system.gridX != null && !i.system.stashed)
        .map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            gridColStart: i.system.gridX + 1,
            gridRowStart: i.system.gridY + 1,
            gridWidth: i.system.gridWidth,
            gridHeight: i.system.gridHeight,
        }));

    const unplacedItems = items
        .filter(i => i.isPhysical && i.system.gridX == null && !i.system.stashed)
        .map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
            gridWidth: i.system.gridWidth,
            gridHeight: i.system.gridHeight,
        }));

    const stashedItems = items
        .filter(i => i.isPhysical && i.system.stashed)
        .map(i => ({
            id: i.id,
            name: i.name,
            type: i.type,
        }));

    return { carryGridItems, unplacedItems, stashedItems };
}

/** Update data that moves an item into the stash. */
export function stashUpdateData() {
    return { 'system.stashed': true, 'system.gridX': null, 'system.gridY': null };
}

/** Update data that places an item on the carry grid (and removes stash flag). */
export function gridPlaceUpdateData(x, y) {
    return { 'system.gridX': x, 'system.gridY': y, 'system.stashed': false };
}

/** Update data that moves a stashed item back to unplaced (not on grid, not stashed). */
export function unstashUpdateData() {
    return { 'system.stashed': false };
}
