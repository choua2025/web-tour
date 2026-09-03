import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('transports', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.ENUM('bus', 'flight', 'car', 'boat'),
            allowNull: false,
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
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
    await queryInterface.dropTable('transports');
}
