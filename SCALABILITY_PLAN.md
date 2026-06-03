# Scalability Plan for 5-10 Cars Across 3-4 Cities

## Expansion goal
The system should be ready to grow from 3 cars in Hoboken to 5-10 cars across nearby cities such as:
- Hoboken, NJ
- Jersey City, NJ
- Newark, NJ
- Philadelphia, PA
- Stamford, CT
- New York City, NY

---

## Design choices that support scaling

### 1. Model locations as first-class data
Add a Location table so each vehicle belongs to a city or garage.

### 2. Make availability city-specific
Availability checks should be based on:
- car ID
- pickup date
- return date
- location

### 3. Use normalized booking logic
Store bookings in a central database with clear fields for:
- start time
- end time
- vehicle
- customer
- status
- pricing breakdown

### 4. Build pricing rules centrally
Create reusable pricing rules for:
- base daily rate
- city-based surcharge
- weekend premium
- insurance or deposit rules
- tax calculation

### 5. Use background jobs for non-blocking operations
Examples:
- PDF generation
- payment confirmation email
- reminder emails
- admin notifications

---

## Recommended architecture for multi-city expansion

### Core services
- Booking API
- Availability checker
- Payment service
- Document upload service
- Admin dashboard

### Data model expansion
Add support for:
- multiple vehicle categories
- multiple pickup/dropoff locations
- region-specific rules
- dynamic pricing later

---

## Operational readiness for growth

### Security
- Role-based admin access
- Audit logs for bookings and payments
- Safe storage for document uploads

### Reliability
- Automated backups for the database
- Monitoring for failed payments or booking errors
- Graceful handling for unavailable vehicles

### Performance
- Index the booking table on date ranges and vehicle ID
- Cache location and vehicle metadata where useful
- Keep the availability query optimized for date-range checks

---

## Suggested roadmap for the next 2-3 years

### Phase 1: 3 cars in Hoboken
- Launch the MVP
- Validate booking flow and payment reliability

### Phase 2: 5-10 cars in one metro area
- Add more fleet inventory
- Introduce city-based pricing rules

### Phase 3: 3-4 cities in neighboring states
- Support multiple locations
- Add region-specific tax and insurance logic
- Expand admin tools for fleet control
