export enum PaymentMethod {
    CARD = 'card',
    PAYPAL = 'paypal',
    BANK = 'bank'
}

export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed'
}

export interface Payment {
    id: string | number
    booking_id: string | number
    amount: number
    payment_method: PaymentMethod
    payment_date: string
    status: TransactionStatus
}
