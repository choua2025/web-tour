import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Tour = sequelize.define('Tour', {
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
}, {
    tableName: 'tours',
    timestamps: true,
});

export default Tour;
