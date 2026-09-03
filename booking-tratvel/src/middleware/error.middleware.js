import { QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Turns a database refusal into something an admin can act on.
//
// With the delete rules set to RESTRICT, removing a record that still has
// dependants fails deep inside Postgres. Left alone the console would show
// `update or delete on table "tours" violates foreign key constraint
// "bookings_tour_id_fkey" on table "bookings"` — accurate, and useless to the
// person who clicked Delete.

const DEPENDENT_LABEL = {
    bookings: 'booking',
    payments: 'payment',
    tours: 'tour',
    hotels: 'hotel',
    reviews: 'review',
};

const plural = (word, n) => (n === 1 ? word : `${word}s`);

// Postgres says: Key (id)=(4) is still referenced from table "bookings".
const REFERENCED_FROM = /still referenced from table "([^"]+)"/;
const KEY_VALUE = /Key \(([^)]+)\)=\(([^)]+)\)/;

/**
 * How many rows are actually in the way, so the message can say so.
 * Returns null when it cannot be worked out — the caller still has a message.
 */
const countBlockers = async (dependentTable, constraint, keyValue) => {
    // Constraints are named `<table>_<column>_fkey`, which gives the column on
    // the dependent side without another round trip to the catalogue.
    const column = constraint
        ?.replace(new RegExp(`^${dependentTable}_`), '')
        ?.replace(/_fkey\d*$/, '');
    if (!column || !/^[a-z_]+$/.test(column) || !/^[a-z_]+$/.test(dependentTable)) return null;

    try {
        const [row] = await sequelize.query(
            `SELECT COUNT(*)::int AS count FROM "${dependentTable}" WHERE "${column}" = :value`,
            { replacements: { value: keyValue }, type: QueryTypes.SELECT }
        );
        return row?.count ?? null;
    } catch {
        return null;
    }
};

/**
 * @param {Error}  error    the caught Sequelize error
 * @param {string} subject  what the caller tried to delete, e.g. 'This customer'
 * @returns {Promise<string|null>} a message to show, or null for other errors
 */
export const deleteConflict = async (error, subject = 'This record') => {
    if (error?.name !== 'SequelizeForeignKeyConstraintError') return null;

    // `error.table` is the table being deleted FROM; the blocking rows live in
    // `error.parent.table`. Reading the wrong one produced sentences like
    // "This tour still has tours attached".
    const detail = error.parent?.detail || '';
    const dependent = detail.match(REFERENCED_FROM)?.[1] || error.parent?.table;
    const constraint = error.parent?.constraint || error.index;
    const keyValue = detail.match(KEY_VALUE)?.[2];

    const count = dependent && constraint && keyValue
        ? await countBlockers(dependent, constraint, keyValue)
        : null;

    const noun = DEPENDENT_LABEL[dependent] || 'related record';
    const what = count != null
        ? `${count} ${plural(noun, count)}`
        : `${noun}s`;

    return `${subject} still has ${what} attached and cannot be deleted. ` +
        `Those records are kept on purpose — remove or reassign them first.`;
};
