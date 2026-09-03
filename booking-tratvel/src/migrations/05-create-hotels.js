import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('hotels', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        destination_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'destinations',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price_per_night: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: true,
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
    await queryInterface.dropTable('hotels');
}
