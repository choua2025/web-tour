export enum TourStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export interface Tour {
    id: string | number
    destination_id: string | number
    title: string
    description: string
    price: number
    duration_days: number
    max_people: number
    start_date: string
    end_date: string
    status: TourStatus
}
