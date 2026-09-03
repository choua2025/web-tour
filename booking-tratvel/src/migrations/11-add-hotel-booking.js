import { DataTypes } from 'sequelize';

// A booking used to be a tour booking, full stop: bookings.tour_id was NOT NULL
// and there was no link to hotels at all, so "Book Now" on a hotel could only
// ever fail. This lets one booking be either a tour or a stay.
//
// Guarded with describeTable so a re-run is harmless.
export async function up(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('bookings');

    if (!table.hotel_id) {
        await queryInterface.addColumn('bookings', 'hotel_id', {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'hotels', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        }, options);
    }

    if (!table.check_in) {
        await queryInterface.addColumn('bookings', 'check_in', {
            type: DataTypes.DATEONLY,
            allowNull: true,
        }, options);
    }

    if (!table.check_out) {
        await queryInterface.addColumn('bookings', 'check_out', {
            type: DataTypes.DATEONLY,
            allowNull: true,
        }, options);
    }

    // tour_id has to become optional, or a hotel stay could never be stored.
    // Raw SQL on purpose: changeColumn with `references` re-states the foreign
    // key but does not emit DROP NOT NULL, so the constraint survived.
    // Existing tour bookings keep their value; nothing is rewritten.
    if (table.tour_id && table.tour_id.allowNull === false) {
        await queryInterface.sequelize.query(
            'ALTER TABLE bookings ALTER COLUMN tour_id DROP NOT NULL',
            options
        );
    }
}

export async function down(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('bookings');

    for (const column of ['hotel_id', 'check_in', 'check_out']) {
        if (table[column]) await queryInterface.removeColumn('bookings', column, options);
    }

    // Only restore NOT NULL when no row would violate it.
    const [[{ count }]] = await queryInterface.sequelize.query(
        'SELECT COUNT(*)::int AS count FROM bookings WHERE tour_id IS NULL',
        options
    );
    if (Number(count) === 0) {
        await queryInterface.sequelize.query(
            'ALTER TABLE bookings ALTER COLUMN tour_id SET NOT NULL',
            options
        );
    } else {
        console.warn(`  ⚠ left tour_id nullable: ${count} hotel booking(s) still have no tour`);
    }
}
