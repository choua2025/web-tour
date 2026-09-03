import 'dotenv/config';

import sequelize from '../config/database.js';
import '../models/index.js';

// Compares what the models declare against what the migrations actually built.
//
// The two drifted once already: the Booking model had `number_of_people` but no
// migration ever created it. Nobody noticed, because the development database
// had been created by sequelize.sync() back when the server still called it —
// so the column was there. Any database built from the migration files alone
// was missing it, and every booking insert failed. A fresh deployment could not
// take a single booking.
//
// Run against the database in DB_*; exits non-zero on any mismatch.

const run = async () => {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    const problems = [];

    for (const model of Object.values(sequelize.models)) {
        const table = model.getTableName();

        let columns;
        try {
            columns = await queryInterface.describeTable(table);
        } catch {
            problems.push(`${table}: no such table — a migration is missing`);
            continue;
        }

        const inDatabase = new Set(Object.keys(columns));
        const declared = Object.values(model.rawAttributes)
            .map((attribute) => attribute.field || attribute.fieldName);

        const missing = declared.filter((column) => !inDatabase.has(column));
        if (missing.length) {
            problems.push(`${table}: model declares ${missing.join(', ')} — no migration creates it`);
        }

        // The reverse is only worth mentioning, not failing on: a column the
        // model no longer reads is dead weight, but nothing breaks.
        const orphaned = [...inDatabase].filter((column) => !declared.includes(column));
        if (orphaned.length) {
            console.log(`ℹ️  ${table}: in the database but not in the model — ${orphaned.join(', ')}`);
        }
    }

    if (problems.length) {
        console.error('\n❌ Models and migrations disagree:\n');
        problems.forEach((problem) => console.error(`   ${problem}`));
        console.error('\n   Add a migration for each, then re-run.\n');
        process.exit(1);
    }

    console.log('✅ Every model column exists in the migrated schema.');
    process.exit(0);
};

run().catch((error) => {
    console.error('❌ Could not check the schema:', error.message);
    process.exit(1);
});
