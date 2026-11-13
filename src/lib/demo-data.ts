import type {
  Amenity,
  AuditEvent,
  Facility,
  Notification,
  Reservation,
  Stay,
  Ticket,
  Unit,
} from "@/lib/database.types";

const now = new Date();
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();

export const demoProfile = {
  id: "demo-management",
  full_name: "Alex Morgan",
  role: "management" as const,
  unit_id: null,
  lang: "en" as const,
  created_at: now.toISOString(),
};

export const demoTeamMembers = [
  { id: "worker-1", full_name: "Sam Rivera", role: "worker" as const },
  { id: "worker-2", full_name: "Jordan Lee", role: "worker" as const },
];

export const demoUnits: Unit[] = [
  { id: "unit-1", code: "A-204", unit_type: "Apartment", status: "bnb", created_at: now.toISOString() },
  { id: "unit-2", code: "A-101", unit_type: "Apartment", status: "for_rent", created_at: now.toISOString() },
  { id: "unit-3", code: "B-105", unit_type: "Apartment", status: "owner_occupied", created_at: now.toISOString() },
  { id: "unit-4", code: "C-102", unit_type: "Villa", status: "maintenance", created_at: now.toISOString() },
  { id: "unit-5", code: "D-018", unit_type: "Penthouse", status: "for_sale", created_at: now.toISOString() },
  { id: "unit-6", code: "B-212", unit_type: "Apartment", status: "bnb", created_at: now.toISOString() },
];

export const demoTickets: Ticket[] = [
  { id: 1048, title: "Air conditioning not cooling", description: "Bedroom unit needs a check.", location: "A-204 · Bedroom", unit_id: "unit-1", facility_id: null, priority: "high", status: "in_progress", created_by: "resident-1", assigned_to: "worker-1", photo_path: null, created_at: minutesAgo(12), updated_at: minutesAgo(5) },
  { id: 1047, title: "Pool gate latch is loose", description: "The gate does not close smoothly.", location: "Outdoor pool", unit_id: null, facility_id: "facility-1", priority: "medium", status: "assigned", created_by: "worker-2", assigned_to: "worker-1", photo_path: null, created_at: minutesAgo(38), updated_at: minutesAgo(22) },
  { id: 1046, title: "Fresh towels requested", description: "Two additional bath towels, please.", location: "A-204 · Guest stay", unit_id: "unit-1", facility_id: null, priority: "low", status: "open", created_by: "guest-1", assigned_to: null, photo_path: null, created_at: minutesAgo(66), updated_at: minutesAgo(66) },
  { id: 1045, title: "Garden path light is out", description: "Near the west walkway.", location: "Gardens & paths", unit_id: null, facility_id: "facility-5", priority: "medium", status: "assigned", created_by: "resident-2", assigned_to: "worker-2", photo_path: null, created_at: minutesAgo(112), updated_at: minutesAgo(92) },
  { id: 1044, title: "Kitchen tap dripping", description: "Small leak under the sink.", location: "B-105 · Kitchen", unit_id: "unit-3", facility_id: null, priority: "low", status: "done", created_by: "resident-3", assigned_to: "worker-1", photo_path: null, created_at: minutesAgo(220), updated_at: minutesAgo(44) },
];

export const demoFacilities: Facility[] = [
  { id: "facility-1", name: "Outdoor pool", status: "ok", last_checked_at: minutesAgo(50), last_checked_by: "worker-1" },
  { id: "facility-2", name: "Indoor pool", status: "ok", last_checked_at: minutesAgo(92), last_checked_by: "worker-2" },
  { id: "facility-3", name: "Paddle court", status: "attention", last_checked_at: minutesAgo(135), last_checked_by: "worker-1" },
  { id: "facility-4", name: "Main lawn", status: "ok", last_checked_at: minutesAgo(218), last_checked_by: "worker-2" },
  { id: "facility-5", name: "Gardens and paths", status: "ok", last_checked_at: minutesAgo(305), last_checked_by: "worker-1" },
];

export const demoAmenities: Amenity[] = [
  { id: "amenity-1", name: "Spa", capacity_per_slot: 3, price_guest: 0, price_resident: 0, currency: "EUR" },
  { id: "amenity-2", name: "Hamam", capacity_per_slot: 4, price_guest: 0, price_resident: 0, currency: "EUR" },
  { id: "amenity-3", name: "Gym", capacity_per_slot: 12, price_guest: 0, price_resident: 0, currency: "EUR" },
  { id: "amenity-4", name: "Paddle court", capacity_per_slot: 4, price_guest: 0, price_resident: 0, currency: "EUR" },
  { id: "amenity-5", name: "Cafe table", capacity_per_slot: 20, price_guest: 0, price_resident: 0, currency: "EUR" },
];

export const demoReservations: Reservation[] = [
  { id: "booking-1", amenity_id: "amenity-1", party_id: "guest-1", starts_at: new Date(now.getTime() + 2 * 60 * 60_000).toISOString(), party_size: 2, status: "confirmed", created_at: now.toISOString() },
  { id: "booking-2", amenity_id: "amenity-4", party_id: "resident-1", starts_at: new Date(now.getTime() + 4 * 60 * 60_000).toISOString(), party_size: 2, status: "confirmed", created_at: now.toISOString() },
  { id: "booking-3", amenity_id: "amenity-2", party_id: "guest-2", starts_at: new Date(now.getTime() + 25 * 60 * 60_000).toISOString(), party_size: 1, status: "confirmed", created_at: now.toISOString() },
];

export const demoStays: Stay[] = [
  { id: "stay-1", unit_id: "unit-1", guest_id: "guest-1", check_in: now.toISOString().slice(0, 10), check_out: new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10), source: "demo" },
];

export const demoNotifications: Notification[] = [
  { id: 3, user_id: "demo-management", body: "Ticket #1048 has been updated.", read: false, created_at: minutesAgo(5) },
  { id: 2, user_id: "demo-management", body: "Pool inspection completed.", read: false, created_at: minutesAgo(50) },
  { id: 1, user_id: "demo-management", body: "New service request #1046.", read: true, created_at: minutesAgo(66) },
];

export const demoAuditEvents: AuditEvent[] = [
  { id: 3, actor_id: "manager-1", action: "update", entity: "tickets", entity_id: "1048", detail: { status_to: "in_progress" }, created_at: minutesAgo(5) },
  { id: 2, actor_id: "worker-1", action: "insert", entity: "inspections", entity_id: "insp-22", detail: { result: "ok" }, created_at: minutesAgo(50) },
  { id: 1, actor_id: "admin-1", action: "update", entity: "units", entity_id: "unit-6", detail: { from: "for_rent", to: "bnb" }, created_at: minutesAgo(88) },
];
