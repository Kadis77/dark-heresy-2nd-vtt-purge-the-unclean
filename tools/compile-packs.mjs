/**
 * Compiles YAML source files in src/packs/ into LevelDB compendium packs
 * for Foundry VTT v14 compatibility.
 *
 * Handles multi-document YAML files (entries separated by ---).
 * Renames the legacy `data` key to `system` for Item documents.
 * Generates stable 16-char hex IDs for entries that don't have one.
 */

import { ClassicLevel } from 'classic-level';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'src', 'packs');
const OUT_DIR = path.join(ROOT, 'build', 'dark-heresy-2nd', 'packs');

/**
 * Generate a stable 16-char hex ID from name + type.
 * Deterministic: same inputs always produce the same ID.
 */
function generateId(name, type) {
    return crypto
        .createHash('sha256')
        .update(`${type ?? 'unknown'}|${name}`)
        .digest('hex')
        .substring(0, 16);
}

async function compilePack(packName) {
    const inputDir = path.join(SOURCE_DIR, packName);
    const outputDir = path.join(OUT_DIR, packName);

    // Remove existing LevelDB directory so we get a clean compile
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    const db = new ClassicLevel(outputDir, { valueEncoding: 'json' });

    const files = fs.readdirSync(inputDir)
        .filter(f => f.endsWith('.yml') || f.endsWith('.yaml') || f.endsWith('.json'))
        .sort();

    for (const file of files) {
        const content = fs.readFileSync(path.join(inputDir, file), 'utf-8');
        const entries = file.endsWith('.json')
            ? [JSON.parse(content)]
            : yaml.loadAll(content);

        for (const entry of entries) {
            if (!entry || typeof entry !== 'object') continue;

            // Migrate legacy `data` key to `system` (Item documents)
            if (entry.data !== undefined && entry.system === undefined) {
                entry.system = entry.data;
                delete entry.data;
            }

            // Generate a stable ID if the entry doesn't have one
            if (!entry._id) {
                entry._id = generateId(entry.name, entry.type);
            }

            await db.put(entry._id, entry);
        }
    }

    await db.close();
    console.log(`  compiled: ${packName}`);
}

const packs = fs.readdirSync(SOURCE_DIR)
    .filter(f => fs.statSync(path.join(SOURCE_DIR, f)).isDirectory())
    .sort();

console.log('Compiling compendium packs to LevelDB...');
for (const pack of packs) {
    await compilePack(pack);
}
console.log('Done.');
