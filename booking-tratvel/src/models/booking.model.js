import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    // A booking is either a tour or a hotel stay, so both keys are optional
    // and the controller enforces that exactly one is present.
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tours',
            key: 'id',
        },
    },
    hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'hotels',
            key: 'id',
        },
    },
    check_in: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    check_out: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    number_of_people: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    booking_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending',
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'refunded'),
        defaultValue: 'unpaid',
    },
    // Whoever the traveller asked us to contact about THIS booking, which is
    // not necessarily the account holder who placed it.
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
}, {
    tableName: 'bookings',
    timestamps: true,
});

export default Booking;
