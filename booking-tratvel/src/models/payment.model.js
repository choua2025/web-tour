import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'bookings',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('card', 'paypal', 'bank'),
        allowNull: false,
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('success', 'failed'),
        defaultValue: 'success',
    },
}, {
    tableName: 'payments',
    timestamps: true,
});

export default Payment;
