import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
    await queryInterface.createTable('reviews', {
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
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
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
    await queryInterface.dropTable('reviews');
}
