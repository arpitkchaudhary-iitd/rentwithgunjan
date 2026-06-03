export type Vehicle = {
  id: string;
  name: string;
  type: string;
  dailyRate: number;
  deposit: number;
  imageUrl?: string;
};

export type BookingWindow = {
  pickupDate: string;
  returnDate: string;
};

export type BookingRecord = {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
};

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'cybertruck-1',
    name: 'CyberTruck1',
    type: 'Electric Pickup',
    dailyRate: 140,
    deposit: 500,
    imageUrl: '/cars/CyberTruck1/cover.svg',
  },
  {
    id: 'cybertruck-2',
    name: 'CyberTruck2',
    type: 'Electric Pickup',
    dailyRate: 145,
    deposit: 550,
    imageUrl: '/cars/CyberTruck2/cover.svg',
  },
  {
    id: 'model-x-1',
    name: 'Model X1',
    type: 'Luxury SUV',
    dailyRate: 160,
    deposit: 600,
    imageUrl: '/cars/Model X1/cover.svg',
  },
];

export const SAMPLE_BOOKINGS: BookingRecord[] = [
  { vehicleId: 'cybertruck-1', pickupDate: '2026-06-10', returnDate: '2026-06-12' },
  { vehicleId: 'cybertruck-2', pickupDate: '2026-06-13', returnDate: '2026-06-15' },
];

function toUtcDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function daysBetween(start: string, end: string) {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return toUtcDate(aStart) < toUtcDate(bEnd) && toUtcDate(bStart) < toUtcDate(aEnd);
}

export function calculateEstimate(vehicle: Vehicle, pickupDate: string, returnDate: string) {
  const rentalDays = daysBetween(pickupDate, returnDate);
  const subtotal = rentalDays * vehicle.dailyRate;
  const tax = Math.round(subtotal * 0.08875);
  const total = subtotal + tax;

  return {
    rentalDays,
    subtotal,
    tax,
    total,
    deposit: vehicle.deposit,
  };
}

export function getAvailableVehicles(pickupDate: string, returnDate: string) {
  return SAMPLE_VEHICLES.filter((vehicle) =>
    !SAMPLE_BOOKINGS.some((booking) =>
      booking.vehicleId === vehicle.id && overlaps(pickupDate, returnDate, booking.pickupDate, booking.returnDate),
    ),
  ).map((vehicle) => ({
    ...vehicle,
    estimate: calculateEstimate(vehicle, pickupDate, returnDate),
  }));
}
