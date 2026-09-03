// Every foreign key here was ON DELETE CASCADE, which made a single click in
// the admin console destroy records nobody meant to touch:
//
//   users -> bookings -> payments
//   destinations -> tours -> bookings -> payments
//   destinations -> hotels
//
// Deleting one destination would have taken 2 tours, 7 hotels and 6 bookings
// with it. Financial history should outlive the catalogue entry it points at,
// so these become RESTRICT: the delete is refused while anything depends on it.
//
// bookings.hotel_id was ON DELETE SET NULL, which additionally fought the
// bookings_tour_xor_hotel check — nulling it left a row that is neither a tour
// nor a stay, so deleting a booked hotel failed with a raw constraint error.
//
// reviews stay CASCADE on purpose: they are content, not money, and a review
// with no author left behind is worse than losing it.
const PROTECT = [
    { table: 'payments', column: 'booking_id', target: 'bookings' },
    { table: 'bookings', column: 'user_id', target: 'users' },
    { table: 'bookings', column: 'tour_id', target: 'tours' },
    { table: 'bookings', column: 'hotel_id', target: 'hotels' },
    { table: 'tours', column: 'destination_id', target: 'destinations' },
    { table: 'hotels', column: 'destination_id', target: 'destinations' },
];

const findConstraint = async (queryInterface, table, column, options) => {
    const [rows] = await queryInterface.sequelize.query(
        `SELECT tc.constraint_name AS name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = '${table}'
            AND kcu.column_name = '${column}'`,
        options
    );
    return rows.map((r) => r.name);
};

const rebuild = async (queryInterface, { table, column, target }, rule, options) => {
    const names = await findConstraint(queryInterface, table, column, options);
    for (const name of names) {
        await queryInterface.sequelize.query(
            `ALTER TABLE "${table}" DROP CONSTRAINT "${name}"`,
            options
        );
    }
    await queryInterface.sequelize.query(
        `ALTER TABLE "${table}"
           ADD CONSTRAINT "${table}_${column}_fkey"
           FOREIGN KEY ("${column}") REFERENCES "${target}"(id)
           ON UPDATE CASCADE ON DELETE ${rule}`,
        options
    );
};

export async function up(queryInterface, options = {}) {
    for (const fk of PROTECT) {
        await rebuild(queryInterface, fk, 'RESTRICT', options);
    }
}

export async function down(queryInterface, options = {}) {
    // Restores the original rules, including the SET NULL that conflicted with
    // the check constraint — kept faithful so the revert is a true revert.
    const ORIGINAL = {
        'bookings.hotel_id': 'SET NULL',
    };
    for (const fk of PROTECT) {
        const rule = ORIGINAL[`${fk.table}.${fk.column}`] || 'CASCADE';
        await rebuild(queryInterface, fk, rule, options);
    }
}
