import { DataTypes } from 'sequelize';

// The booking form asks the traveller for a contact name, email and phone, but
// those never reached the database — the admin could only ever see whatever was
// on the account that placed the booking. Store what was actually typed.
//
// Guarded with describeTable because the migration runner replays every file on
// each `migrate:up`.
const COLUMNS = {
    contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
};

export async function up(queryInterface) {
    const table = await queryInterface.describeTable('bookings');

    for (const [name, spec] of Object.entries(COLUMNS)) {
        if (!table[name]) {
            await queryInterface.addColumn('bookings', name, spec);
        }
    }
}

export async function down(queryInterface) {
    const table = await queryInterface.describeTable('bookings');

    for (const name of Object.keys(COLUMNS)) {
        if (table[name]) {
            await queryInterface.removeColumn('bookings', name);
        }
    }
}
