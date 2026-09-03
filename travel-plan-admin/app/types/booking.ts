export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled'
}

export enum PaymentStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    REFUNDED = 'refunded'
}

export interface Booking {
    id: string | number
    user_id: string | number
    tour_id: string | number
    booking_date: string
    total_price: number
    status: BookingStatus
    payment_status: PaymentStatus
}
