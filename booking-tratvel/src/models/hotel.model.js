import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Hotel = sequelize.define('Hotel', {
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
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
            max: 5,
        },
    },
}, {
    tableName: 'hotels',
    timestamps: true,
});

export default Hotel;
