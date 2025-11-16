export interface Client {
    id: string;
    name: string;
    domain: string;
    theme_primary_color: string;
    theme_secondary_color: string;
    created_at: Date;
}
export interface Operator {
    id: string;
    name: string;
    code: string;
    created_at: Date;
}
export interface Depot {
    id: string;
    operator_id: string;
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    created_at: Date;
}
export interface Vehicle {
    id: string;
    operator_id: string;
    name: string;
    type: 'campervan' | 'motorhome';
    transmission: 'automatic' | 'manual';
    sleeps: number;
    has_toilet: boolean;
    has_shower: boolean;
    has_kitchen: boolean;
    price_per_day: number;
    image_url: string | null;
    created_at: Date;
}
export interface Booking {
    id: string;
    client_id: string;
    vehicle_id: string;
    operator_id: string;
    pickup_depot_id: string;
    dropoff_depot_id: string;
    pickup_date: Date;
    dropoff_date: Date;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    number_of_people: number;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: Date;
}
export interface Quote {
    id: string;
    client_id: string;
    pickup_location: string;
    dropoff_location: string;
    pickup_date: Date;
    dropoff_date: Date;
    number_of_people: number | null;
    created_at: Date;
}
export interface SearchParams {
    pickup_location: string;
    dropoff_location?: string;
    pickup_date: string;
    dropoff_date: string;
    number_of_people: number;
    driver_age?: number;
}
export interface SearchFilters {
    transmission?: 'automatic' | 'manual';
    min_sleeps?: number;
    has_toilet?: boolean;
    has_shower?: boolean;
    vehicle_type?: 'campervan' | 'motorhome';
    max_price?: number;
}
export interface VehicleSearchResult extends Vehicle {
    operator_name: string;
    operator_code: string;
    total_price: number;
    days: number;
}
export interface BookingRequest {
    client_id: string;
    vehicle_id: string;
    pickup_depot_id: string;
    dropoff_depot_id: string;
    pickup_date: string;
    dropoff_date: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    number_of_people: number;
}
export interface ClientConfig {
    id: string;
    name: string;
    theme: {
        primary_color: string;
        secondary_color: string;
    };
}
//# sourceMappingURL=types.d.ts.map