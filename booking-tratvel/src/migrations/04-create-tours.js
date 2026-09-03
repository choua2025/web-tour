import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('tours', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        max_people: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
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
    await queryInterface.dropTable('tours');
}
