import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transport = sequelize.define('Transport', {
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
}, {
    tableName: 'transports',
    timestamps: true,
});

export default Transport;
