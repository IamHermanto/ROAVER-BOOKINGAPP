-- Seed data for ROAVER campervan booking system

-- Insert travel agency clients (white-label partners)
INSERT INTO clients (name, domain, theme_primary_color, theme_secondary_color) VALUES
('Demo Travel Agency 1', 'demo1.roaver.com', '#3B82F6', '#1E40AF'),
('Demo Travel Agency 2', 'demo2.roaver.com', '#10B981', '#059669'),
('Adventure Seekers Travel', 'adventure.roaver.com', '#F59E0B', '#D97706');

-- Insert campervan operators
INSERT INTO operators (name, code) VALUES
('Cruisin Motorhomes', 'CRUISIN'),
('Go Cheap Rentals', 'GOCHEAP'),
('Lucky Rentals', 'LUCKY'),
('Happy Campers', 'HAPPY'),
('Star RV', 'STARRV');

-- Insert depots (pickup/dropoff locations)
INSERT INTO depots (operator_id, name, city, country, latitude, longitude)
SELECT 
    o.id,
    depot_data.name,
    depot_data.city,
    depot_data.country,
    depot_data.latitude,
    depot_data.longitude
FROM operators o
CROSS JOIN (
    VALUES
        ('Auckland Airport Depot', 'Auckland', 'New Zealand', -37.0082, 174.7850),
        ('Melbourne City Depot', 'Melbourne', 'Australia', -37.8136, 144.9631),
        ('Sydney Airport Depot', 'Sydney', 'Australia', -33.9461, 151.1772),
        ('Christchurch Depot', 'Christchurch', 'New Zealand', -43.5321, 172.6362),
        ('Cairns Depot', 'Cairns', 'Australia', -16.9186, 145.7781)
) AS depot_data(name, city, country, latitude, longitude);

-- Insert vehicles (campervans and motorhomes)
INSERT INTO vehicles (operator_id, name, type, transmission, sleeps, has_toilet, has_shower, price_per_day, image_url)
SELECT 
    o.id,
    v.name,
    v.type,
    v.transmission,
    v.sleeps,
    v.has_toilet,
    v.has_shower,
    v.price_per_day,
    v.image_url
FROM operators o
CROSS JOIN (
    VALUES
        ('Cruisin Sandpiper', 'campervan', 'automatic', 2, true, true, 89.00, 'https://example.com/sandpiper.jpg'),
        ('Budget Sleeper', 'campervan', 'manual', 2, false, false, 65.00, 'https://example.com/budget.jpg'),
        ('Family Explorer', 'motorhome', 'automatic', 4, true, true, 135.00, 'https://example.com/explorer.jpg'),
        ('Luxury Cruiser', 'motorhome', 'automatic', 6, true, true, 189.00, 'https://example.com/luxury.jpg'),
        ('Compact Wanderer', 'campervan', 'automatic', 2, true, false, 75.00, 'https://example.com/wanderer.jpg'),
        ('Go Cheap 4 Berth Henty', 'motorhome', 'automatic', 4, true, true, 95.00, 'https://example.com/henty.jpg'),
        ('Go Cheap Derwent', 'motorhome', 'automatic', 4, true, true, 105.00, 'https://example.com/derwent.jpg')
) AS v(name, type, transmission, sleeps, has_toilet, has_shower, price_per_day, image_url)
WHERE o.code IN ('CRUISIN', 'GOCHEAP', 'LUCKY', 'HAPPY', 'STARRV');

-- Insert sample bookings
INSERT INTO bookings (
    client_id, 
    vehicle_id, 
    operator_id, 
    pickup_depot_id, 
    dropoff_depot_id,
    pickup_date, 
    dropoff_date, 
    guest_name, 
    guest_email, 
    guest_phone,
    number_of_people, 
    total_price, 
    status
)
SELECT 
    (SELECT id FROM clients LIMIT 1),
    v.id,
    v.operator_id,
    (SELECT id FROM depots WHERE city = 'Auckland' LIMIT 1),
    (SELECT id FROM depots WHERE city = 'Christchurch' LIMIT 1),
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '20 days',
    'Customer Name',
    'customer@test.com',
    '+61 41 234 567',
    2,
    v.price_per_day * 10,
    'confirmed'
FROM vehicles v
LIMIT 5;

-- Insert sample quotes (search activity)
INSERT INTO quotes (client_id, pickup_location, dropoff_location, pickup_date, dropoff_date, number_of_people)
SELECT 
    c.id,
    'Auckland',
    'Melbourne',
    CURRENT_DATE + (random() * 30)::integer,
    CURRENT_DATE + (random() * 60)::integer,
    (random() * 5 + 1)::integer
FROM clients c
CROSS JOIN generate_series(1, 20);