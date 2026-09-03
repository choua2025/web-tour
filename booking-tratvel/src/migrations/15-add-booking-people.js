import { DataTypes } from 'sequelize';

// The Booking model has always declared number_of_people (NOT NULL, default 1)
// and the controllers read it, but no migration ever created the column. It
// existed only in databases originally built by sequelize.sync(); a database
// built from these migration files alone had no such column, and every insert
// failed with:
//
//   column "number_of_people" of relation "bookings" does not exist
//
// Which meant a fresh deployment could not take a single booking. Found by
// diffing the models against a container database built purely from migrations.
//
// Guarded with describeTable so running it against an older sync()-built
// database — where the column is already there — is harmless.

export async function up(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('bookings');

    if (!table.number_of_people) {
        await queryInterface.addColumn('bookings', 'number_of_people', {
            type: DataTypes.INTEGER,
            allowNull: false,
            // Existing rows need a value the moment the column becomes NOT
            // NULL, and 1 is what the model would have given them anyway.
            defaultValue: 1,
        }, options);
    }
}

export async function down(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('bookings');

    if (table.number_of_people) {
        await queryInterface.removeColumn('bookings', 'number_of_people', options);
    }
}
