export interface Review {
    id: string | number
    user_id: string | number
    tour_id: string | number
    rating: number
    comment: string
    created_at?: string
}
