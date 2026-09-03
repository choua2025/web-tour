import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('payments', {
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });
}

export async function down(queryInterface) {
    await queryInterface.dropTable('payments');
}
