/**
 * Adds gridWidth and gridHeight to all physical items in the compendium YAML files.
 * Run with: node tools/add-grid-sizes.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packsDir = join(__dirname, '../src/packs');

// Default sizes by weapon class
function weaponSize(entry) {
    const cls = (entry.data?.class || '').toLowerCase();
    const name = (entry.name || '').toLowerCase();

    if (cls === 'pistol') return { gridWidth: 1, gridHeight: 2 };
    if (cls === 'basic')  return { gridWidth: 1, gridHeight: 4 };
    if (cls === 'heavy')  return { gridWidth: 2, gridHeight: 5 };
    if (cls === 'melee' || cls === 'thrown') {
        // Longer weapons (2-handed feel from name)
        if (name.includes('great') || name.includes('sword') || name.includes('axe') ||
            name.includes('staff') || name.includes('spear') || name.includes('lance') ||
            name.includes('halberd') || name.includes('flail') || name.includes('mace')) {
            return { gridWidth: 2, gridHeight: 4 };
        }
        return { gridWidth: 1, gridHeight: 3 };
    }
    // Fallback
    return { gridWidth: 1, gridHeight: 3 };
}

// Map of pack name → default grid size generator
const packDefaults = {
    weapons:      (entry) => weaponSize(entry),
    ammo:         ()      => ({ gridWidth: 1, gridHeight: 1 }),
    armour:       (entry) => {
        const name = (entry.name || '').toLowerCase();
        if (name.includes('helmet') || name.includes('mask') || name.includes('visor') ||
            name.includes('hood') || name.includes('headgear') || name.includes('cap')) {
            return { gridWidth: 2, gridHeight: 2 };
        }
        if (name.includes('glove') || name.includes('gauntlet') || name.includes('boot') ||
            name.includes('leg') || name.includes('arm ') || name.includes(' arm') ||
            name.includes('greave') || name.includes('vambrace') || name.includes('pauldron')) {
            return { gridWidth: 2, gridHeight: 2 };
        }
        // Default: body/full armour
        return { gridWidth: 3, gridHeight: 3 };
    },
    consumables:  ()      => ({ gridWidth: 1, gridHeight: 1 }),
    cybernetics:  ()      => ({ gridWidth: 1, gridHeight: 1 }),
    'weapon-mods':()      => ({ gridWidth: 1, gridHeight: 1 }),
    tools:        (entry) => {
        const name = (entry.name || '').toLowerCase();
        if (name.includes('kit') || name.includes('set') || name.includes('auspex') ||
            name.includes('scanner') || name.includes('medikit') || name.includes('vox')) {
            return { gridWidth: 1, gridHeight: 2 };
        }
        return { gridWidth: 1, gridHeight: 1 };
    },
};

function addGridSizesToYaml(yamlText, defaultFn) {
    // Split into documents
    const docs = yamlText.split(/^---$/m);
    const result = [];

    for (const doc of docs) {
        if (!doc.trim()) {
            result.push(doc);
            continue;
        }

        // Parse the entry loosely to get class/name for size calculation
        const nameMatch  = doc.match(/^name:\s*(.+)$/m);
        const classMatch = doc.match(/^\s{4}class:\s*(.+)$/m);
        const entry = {
            name: nameMatch  ? nameMatch[1].trim() : '',
            data: { class: classMatch ? classMatch[1].trim() : '' },
        };

        // Skip if already has gridWidth
        if (/^\s+gridWidth:/m.test(doc)) {
            result.push(doc);
            continue;
        }

        const { gridWidth, gridHeight } = defaultFn(entry);

        // Insert gridWidth/gridHeight into the data block, after the last data field
        // Find a good insertion point: after 'equipped:' line, or before 'img:' line
        let modified = doc;

        // Try inserting after 'equipped:' in the data block
        if (/^\s{4}equipped:/m.test(modified)) {
            modified = modified.replace(
                /^(\s{4}equipped:.*)$/m,
                `$1\n    gridHeight: ${gridHeight}\n    gridWidth: ${gridWidth}`
            );
        } else {
            // Insert before 'img:' (which is at root level)
            modified = modified.replace(
                /^(img:)/m,
                `    gridHeight: ${gridHeight}\n    gridWidth: ${gridWidth}\n$1`
            );
        }

        result.push(modified);
    }

    return result.join('---');
}

const packs = Object.keys(packDefaults);

for (const pack of packs) {
    const filePath = join(packsDir, pack, `${pack}.yml`);
    let content;
    try {
        content = readFileSync(filePath, 'utf8');
    } catch {
        console.log(`Skipping ${pack} — file not found`);
        continue;
    }

    const updated = addGridSizesToYaml(content, packDefaults[pack]);
    writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated: ${pack}`);
}

console.log('Done.');
