import sequelize from '../config/database.js';
import User from './user.model.js';
import Destination from './destination.model.js';
import Tour from './tour.model.js';
import Hotel from './hotel.model.js';
import Transport from './transport.model.js';
import Booking from './booking.model.js';
import Payment from './payment.model.js';
import Review from './review.model.js';
import ResetCode from './reset_code.model.js';

// =============================================
//  Associations
// =============================================

// Destination ──> Tours (one-to-many)
Destination.hasMany(Tour, { foreignKey: 'destination_id', as: 'tours' });
Tour.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// Destination ──> Hotels (one-to-many)
Destination.hasMany(Hotel, { foreignKey: 'destination_id', as: 'hotels' });
Hotel.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });

// User ──> Bookings (one-to-many)
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Tour ──> Bookings (one-to-many)
Tour.hasMany(Booking, { foreignKey: 'tour_id', as: 'bookings' });
Booking.belongsTo(Tour, { foreignKey: 'tour_id', as: 'tour' });

// Hotel ──> Bookings (one-to-many)
Hotel.hasMany(Booking, { foreignKey: 'hotel_id', as: 'bookings' });
Booking.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });

// Booking ──> Payments (one-to-many)
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User ──> Reviews (one-to-many)
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Tour ──> Reviews (one-to-many)
Tour.hasMany(Review, { foreignKey: 'tour_id', as: 'reviews' });
Review.belongsTo(Tour, { foreignKey: 'tour_id', as: 'tour' });

export {
    sequelize,
    User,
    Destination,
    Tour,
    Hotel,
    Transport,
    Booking,
    Payment,
    Review,
    ResetCode,
};
