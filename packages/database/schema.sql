-- Database schema for ROAVER campervan booking system

-- Travel agencies using the white-label widget
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    theme_primary_color VARCHAR(7) DEFAULT '#3B82F6',
    theme_secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campervan rental operators
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pickup/dropoff locations
CREATE TABLE depots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campervan vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'campervan' or 'motorhome'
    transmission VARCHAR(20) NOT NULL, -- 'automatic' or 'manual'
    sleeps INTEGER NOT NULL,
    has_toilet BOOLEAN DEFAULT false,
    has_shower BOOLEAN DEFAULT false,
    has_kitchen BOOLEAN DEFAULT true,
    price_per_day DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    vehicle_id UUID REFERENCES vehicles(id),
    operator_id UUID REFERENCES operators(id),
    pickup_depot_id UUID REFERENCES depots(id),
    dropoff_depot_id UUID REFERENCES depots(id),
    pickup_date DATE NOT NULL,
    dropoff_date DATE NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    number_of_people INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search quotes (tracks search activity)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    pickup_date DATE NOT NULL,
    dropoff_date DATE NOT NULL,
    number_of_people INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_vehicles_operator ON vehicles(operator_id);
CREATE INDEX idx_depots_operator ON depots(operator_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_dates ON bookings(pickup_date, dropoff_date);
CREATE INDEX idx_quotes_client ON quotes(client_id);