# rentwithgunjan — Implementation Plan

## 1. Product scope and MVP definition

Goal: launch a small self-hosted car rental website for Hoboken, New Jersey with 3 cars, replacing the current Turo-based flow.

### MVP features
- Public landing page and car catalog
- User sign-up / login
- Availability calendar by date range
- Booking reservation flow for one of 3 cars
- Credit card payment via Stripe
- Driver license upload
- Booking confirmation and receipt/PDF generation
- New Jersey sales tax calculation and display
- Admin dashboard for bookings and fleet status

### Out of scope for the first release
- Fleet insurance marketplace
- Advanced fleet analytics
- Mobile app
- Dynamic pricing engine
- Multi-location expansion

---

## 2. Recommended stack

### Frontend
- Next.js (React) for the website
- Tailwind CSS for UI
- React Hook Form + Zod for forms
- Calendar/date-picker components for availability selection

### Backend
- Next.js API routes or a separate lightweight API service
- PostgreSQL for bookings, users, and fleet data
- Prisma ORM for schema and migrations
- Stripe for payments and possibly identity/document verification
- File storage for driver license uploads (e.g. Supabase Storage, S3, or Vercel Blob)

### Optional admin tools
- Simple dashboard for bookings, availability, and customer records

---

## 3. Core user journeys

### Customer journey
1. Visit homepage and see the 3 cars
2. Select pickup and return dates
3. See real-time availability and price estimate
4. Create account or log in
5. Enter driver details and upload driver license
6. Enter payment details via Stripe
7. Confirm booking
8. Receive booking confirmation PDF and email receipt

### Admin journey
1. View all bookings
2. Confirm vehicle status and availability
3. Review uploaded documents
4. Mark booking as confirmed, canceled, or completed

---

## 4. Data model and business rules

### Core entities
- User
- Vehicle
- Booking
- Payment
- DocumentUpload
- BookingStatus
- PricingRule

### Key rules
- A car is unavailable during reserved periods
- The booking must be validated against vehicle availability
- Taxes must be calculated based on New Jersey rules
- Driver license verification should happen before final booking confirmation
- Payment must be captured only after reservation rules pass

---

## 5. Payment, taxes, and compliance steps

### Payment flow
- Use Stripe Checkout or Payment Intents
- Save only minimal payment metadata in your database
- Never store raw card numbers in your own system

### Tax handling
- Calculate New Jersey state sales tax using the applicable rate for your market
- Display the tax breakdown clearly before checkout
- Confirm the tax logic in the booking receipt and PDF

### Driver license and compliance
- Allow secure upload of the driver license
- Use Stripe Identity or a separate document verification service if needed
- Store document metadata securely, not raw sensitive data unless required
- Add privacy and retention controls for customer records

---

## 6. UX / UI plan

### Main pages
- Home / Landing page
- Login / Sign-up page
- Availability and booking page
- Booking confirmation page
- Customer account / booking history page
- Admin dashboard

### UX requirements
- Clean reservation flow with clear pricing breakdown
- Strong error messages for unavailable dates and failed payments
- Accessible design and mobile-friendly layout
- Clear terms and conditions for rentals

---

## 7. Implementation phases

### Phase 1 — Discovery and setup
- Finalize the booking business rules
- Confirm pricing and tax policy
- Decide on Stripe products and payment flow
- Choose hosting and deployment platform

### Phase 2 — Foundation
- Set up the project structure
- Configure authentication
- Create database schema and models
- Build the base UI shell and layout

### Phase 3 — Availability and reservation engine
- Implement date selection and availability checks
- Block overlapping bookings
- Generate booking total and tax estimate

### Phase 4 — Payments and document handling
- Integrate Stripe Checkout / Payment Intents
- Add driver license upload and storage
- Add verification workflow and booking confirmation

### Phase 5 — PDF and admin tools
- Generate booking confirmation PDF
- Add admin dashboard for bookings and fleet status
- Test cancellations, payments, and tax calculations

### Phase 6 — Launch readiness
- Security review
- Performance and QA testing
- Deploy to production
- Prepare support and operations documentation

---

## 8. Security and operational considerations

- Use HTTPS everywhere
- Store secrets in environment variables only
- Keep authentication secure and session-based or token-based
- Limit who can view uploaded IDs and payment records
- Add logging and audit checks for bookings and payments
- Prepare backup and recovery procedures for bookings and user data

---

## 9. Risks and decisions to confirm before coding

Before development begins, we should confirm:
1. Which Stripe payment model to use (Checkout vs Payment Intents)
2. Whether Stripe Identity is required or if a simpler document review flow is acceptable
3. The exact rental pricing, deposit rules, and tax treatment
4. Insurance and legal requirements for a New Jersey rental business
5. The hosting and deployment environment

---

## 10. Recommended next step

Once the above decisions are approved, the next execution step will be to scaffold the project, create the database schema, and implement the booking flow end to end.
