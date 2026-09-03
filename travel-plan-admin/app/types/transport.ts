export enum TransportType {
    BUS = 'bus',
    FLIGHT = 'flight',
    CAR = 'car',
    BOAT = 'boat'
}

export interface Transport {
    id: string | number
    type: TransportType
    company_name: string
    price: number
}
