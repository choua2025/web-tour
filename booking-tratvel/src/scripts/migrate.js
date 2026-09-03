import { DataTypes, QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';
import {
    META_TABLE,
    appliedMigrations,
    loadMigration,
    readMigrationFiles,
    metaTableExists,
} from '../utils/migrations.js';

async function ensureMetaTable(queryInterface) {
    if (await metaTableExists()) return;

    await queryInterface.createTable(META_TABLE, {
        name: { type: DataTypes.STRING, primaryKey: true },
        batch: { type: DataTypes.INTEGER, allowNull: false },
        run_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    console.log(`📒 Created tracking table "${META_TABLE}"`);
}

const nextBatch = async () => {
    const [row] = await sequelize.query(
        `SELECT COALESCE(MAX(batch), 0) AS max FROM "${META_TABLE}"`,
        { type: QueryTypes.SELECT }
    );
    return Number(row.max) + 1;
};

// ── up ──────────────────────────────────────────────────────────────
async function up() {
    const done = new Set((await appliedMigrations()).map((r) => r.name));
    const pending = readMigrationFiles().filter((f) => !done.has(f));

    if (!pending.length) {
        console.log('✅ Nothing to migrate — the schema is up to date.');
        return;
    }

    // A half-applied migration is the worst outcome, so each file runs in its
    // own transaction with its bookkeeping row written inside it.
    const batch = await nextBatch();
    console.log(`\n🚀 Applying ${pending.length} migration(s), batch ${batch}\n`);

    for (const file of pending) {
        const migration = await loadMigration(file);
        const transaction = await sequelize.transaction();
        try {
            console.log(`  ▶ ${file}`);
            await migration.up(sequelize.getQueryInterface(), { transaction });
            await sequelize.query(
                `INSERT INTO "${META_TABLE}" (name, batch, run_at) VALUES (:name, :batch, NOW())`,
                { replacements: { name: file, batch }, transaction }
            );
            await transaction.commit();
            console.log(`  ✅ ${file}`);
        } catch (error) {
            await transaction.rollback();
            console.error(`  ❌ ${file} — rolled back, no partial schema left behind`);
            throw error;
        }
    }
    console.log('\n✅ Done.');
}

// ── down ────────────────────────────────────────────────────────────
// Reverts only the most recent batch. The old runner reverted *every*
// migration, i.e. dropped all nine tables — one typo from an empty database.
async function down({ all = false, confirmed = false } = {}) {
    const rows = await appliedMigrations();
    if (!rows.length) {
        console.log('Nothing to revert.');
        return;
    }

    if (all && !confirmed) {
        console.error('⛔ `down --all` reverts every migration and DROPS EVERY TABLE.');
        console.error('   Re-run with --yes if that is genuinely what you want.');
        process.exitCode = 1;
        return;
    }

    const lastBatch = Math.max(...rows.map((r) => Number(r.batch)));
    const target = all ? rows : rows.filter((r) => Number(r.batch) === lastBatch);
    const names = target.map((r) => r.name).sort().reverse();

    console.log(`\n🔄 Reverting ${names.length} migration(s)${all ? ' (ALL)' : ` from batch ${lastBatch}`}\n`);

    for (const file of names) {
        const migration = await loadMigration(file);
        const transaction = await sequelize.transaction();
        try {
            console.log(`  ▶ ${file}`);
            await migration.down(sequelize.getQueryInterface(), { transaction });
            await sequelize.query(`DELETE FROM "${META_TABLE}" WHERE name = :name`, {
                replacements: { name: file },
                transaction,
            });
            await transaction.commit();
            console.log(`  ✅ ${file} reverted`);
        } catch (error) {
            await transaction.rollback();
            console.error(`  ❌ ${file} — rolled back`);
            throw error;
        }
    }
}

// ── status ──────────────────────────────────────────────────────────
async function status(queryInterface) {
    const rows = await appliedMigrations();
    const done = new Map(rows.map((r) => [r.name, r.batch]));

    console.log('\n  migration                            state');
    console.log('  ' + '-'.repeat(54));
    for (const file of readMigrationFiles()) {
        console.log(`  ${file.padEnd(36)} ${done.has(file) ? `applied (batch ${done.get(file)})` : 'PENDING'}`);
    }

    const tables = await queryInterface.showAllTables();
    if (!rows.length && tables.includes('users')) {
        console.log('\n⚠️  This database already has tables but no migration history.');
        console.log('   Run `npm run migrate:baseline` once to record them as applied,');
        console.log('   otherwise `migrate:up` will try to create tables that exist.');
    }
}

// ── baseline ────────────────────────────────────────────────────────
// For a database whose schema predates this tracking: record the current files
// as applied without executing them. Touches no tables.
async function baseline() {
    const done = new Set((await appliedMigrations()).map((r) => r.name));
    const pending = readMigrationFiles().filter((f) => !done.has(f));

    if (!pending.length) {
        console.log('✅ Already baselined — nothing to record.');
        return;
    }

    for (const file of pending) {
        await sequelize.query(
            `INSERT INTO "${META_TABLE}" (name, batch, run_at) VALUES (:name, 0, NOW())`,
            { replacements: { name: file } }
        );
        console.log(`  📌 ${file} marked as already applied`);
    }
    console.log(`\n✅ Baselined ${pending.length} migration(s). No tables were touched.`);
}

// ── entry point ─────────────────────────────────────────────────────
async function run() {
    const [action = 'status', ...flags] = process.argv.slice(2);

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const queryInterface = sequelize.getQueryInterface();
        await ensureMetaTable(queryInterface);

        switch (action) {
            case 'up':
                await up();
                break;
            case 'down':
                await down({ all: flags.includes('--all'), confirmed: flags.includes('--yes') });
                break;
            case 'baseline':
                await baseline();
                break;
            case 'status':
                await status(queryInterface);
                break;
            default:
                console.log('Usage: node src/scripts/migrate.js [status|up|down|baseline]');
                console.log('  status            show applied and pending migrations');
                console.log('  up                apply pending migrations only');
                console.log('  down              revert the most recent batch');
                console.log('  down --all --yes  revert everything (DROPS ALL TABLES)');
                console.log('  baseline          record existing files as applied, run nothing');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

run();
