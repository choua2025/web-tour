// Two clean-ups on bookings:
//
// 1. A duplicate foreign key on tour_id, left behind by an earlier
//    changeColumn attempt. Two identical constraints do no harm but every
//    write checks both.
// 2. The "a booking is a tour OR a hotel" rule lived only in the controller.
//    Anything writing straight to the database — a script, psql, a future
//    endpoint — could still store a row that is neither or both. A CHECK
//    makes the rule the table's own.
const DUPLICATE_FK = 'bookings_tour_id_fkey1';
const CHECK_NAME = 'bookings_tour_xor_hotel';

export async function up(queryInterface, options = {}) {
    const [dupes] = await queryInterface.sequelize.query(
        `SELECT 1 FROM pg_constraint WHERE conname = '${DUPLICATE_FK}'`,
        options
    );
    if (dupes.length) {
        await queryInterface.sequelize.query(
            `ALTER TABLE bookings DROP CONSTRAINT "${DUPLICATE_FK}"`,
            options
        );
    }

    const [existing] = await queryInterface.sequelize.query(
        `SELECT 1 FROM pg_constraint WHERE conname = '${CHECK_NAME}'`,
        options
    );
    if (!existing.length) {
        // NOT VALID would let old rows slide; there are none that break it, so
        // validate immediately and find out here rather than in production.
        await queryInterface.sequelize.query(
            `ALTER TABLE bookings ADD CONSTRAINT "${CHECK_NAME}"
             CHECK (
               (tour_id IS NOT NULL AND hotel_id IS NULL)
               OR
               (tour_id IS NULL AND hotel_id IS NOT NULL)
             )`,
            options
        );
    }
}

export async function down(queryInterface, options = {}) {
    await queryInterface.sequelize.query(
        `ALTER TABLE bookings DROP CONSTRAINT IF EXISTS "${CHECK_NAME}"`,
        options
    );
    // The duplicate foreign key is not recreated on purpose — it was a mistake.
}
