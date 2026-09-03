import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('bookings', {
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        tour_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tours',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
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
    await queryInterface.dropTable('bookings');
}
