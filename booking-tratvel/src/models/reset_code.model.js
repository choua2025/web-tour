import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ResetCode = sequelize.define('ResetCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'reset_codes',
    timestamps: true,
});

export default ResetCode;
