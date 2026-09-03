import { DataTypes } from 'sequelize';

// The storefront hotel card already reads `hotel.image` and quietly falls back
// to the destination's picture, so every hotel looked like its city rather than
// itself. There was simply no column behind it.
//
// Guarded with describeTable so a re-run is harmless.
export async function up(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('hotels');

    if (!table.image) {
        await queryInterface.addColumn('hotels', 'image', {
            type: DataTypes.STRING,
            allowNull: true,
        }, options);
    }
}

export async function down(queryInterface, options = {}) {
    const table = await queryInterface.describeTable('hotels');

    if (table.image) {
        await queryInterface.removeColumn('hotels', 'image', options);
    }
}
