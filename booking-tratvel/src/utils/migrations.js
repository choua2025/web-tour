import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const migrationsDir = path.join(__dirname, '../migrations');

// Which migrations have already run. Without this the runner replayed every
// file on each `up`, so `createTable` failed the moment a table existed.
export const META_TABLE = 'schema_migrations';

export const readMigrationFiles = () =>
    fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.js')).sort();

// `import()` needs a file:// URL — a bare Windows path ('D:\...') is rejected
// by the ESM loader, which is why `migrate:up` could not run on this machine.
export const loadMigration = (file) =>
    import(pathToFileURL(path.join(migrationsDir, file)).href);

export const metaTableExists = async () => {
    const tables = await sequelize.getQueryInterface().showAllTables();
    return tables.includes(META_TABLE);
};

export const appliedMigrations = async () => {
    if (!(await metaTableExists())) return [];
    return sequelize.query(`SELECT name, batch FROM "${META_TABLE}" ORDER BY name`, {
        type: QueryTypes.SELECT,
    });
};

export const pendingMigrations = async () => {
    const done = new Set((await appliedMigrations()).map((r) => r.name));
    return readMigrationFiles().filter((f) => !done.has(f));
};
