# Stripe Identity Plan for Driver License Verification

## Overview
Yes — Stripe Identity can be used for driver license verification, secure storage, and real-time document/photo-based verification.

## What Stripe Identity can provide
- Verification of government-issued ID documents
- Real-time image capture and document checks
- Identity confirmation for rental customers
- A secure external verification process instead of relying only on manual uploads

## Recommended flow for this rental website
1. Customer creates an account or starts a booking.
2. Customer uploads or captures a photo of their driver license.
3. Stripe Identity verifies the ID in real time.
4. The system stores only the verification result and related metadata.
5. The booking is allowed to proceed only if the verification passes.

## Good practice for storage
- Store the Stripe verification result (status, ID, timestamps, confidence) in your own database.
- Do not store raw license images in your main app database unless absolutely required.
- Use secure object storage only if you need to keep a copy for operational records.

## Recommended integration approach
- Use Stripe Identity for the verification step.
- Use Stripe Checkout or Payment Intents for payment.
- Use Prisma + PostgreSQL for your booking and customer records.
- Use Supabase Storage or similar only if you need to keep a backup of the uploaded file.

## Why this is a good fit
- It improves compliance and customer trust.
- It reduces manual review effort.
- It supports a scalable rental platform as you grow from 3 cars to more locations.

## Important note
Stripe Identity is best used for identity verification, while your payment flow should continue to use Stripe Payments. The verification result should not replace your legal or insurance review process.
