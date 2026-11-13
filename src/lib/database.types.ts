export type UserRole = "guest" | "resident" | "worker" | "management" | "admin";
export type UnitStatus =
  | "for_sale"
  | "for_rent"
  | "bnb"
  | "owner_occupied"
  | "maintenance";
export type TicketStatus = "open" | "assigned" | "in_progress" | "done";
export type TicketPriority = "low" | "medium" | "high";
export type FacilityStatus = "ok" | "attention" | "closed";
export type ReservationStatus = "confirmed" | "cancelled";

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  unit_id: string | null;
  lang: "en" | "tr" | "ru";
  created_at: string;
};

export type Unit = {
  id: string;
  code: string;
  unit_type: string;
  status: UnitStatus;
  created_at: string;
};

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  location: string;
  unit_id: string | null;
  facility_id: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  assigned_to: string | null;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Facility = {
  id: string;
  name: string;
  status: FacilityStatus;
  last_checked_at: string | null;
  last_checked_by: string | null;
};

export type Amenity = {
  id: string;
  name: string;
  capacity_per_slot: number;
  price_guest: number;
  price_resident: number;
  currency: "GBP" | "EUR" | "USD" | "TRY";
};

export type Reservation = {
  id: string;
  amenity_id: string;
  party_id: string;
  starts_at: string;
  party_size: number;
  status: ReservationStatus;
  created_at: string;
};

export type Notification = {
  id: number;
  user_id: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type AuditEvent = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown>;
  created_at: string;
};

export type Stay = {
  id: string;
  unit_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  source: string;
};

export type Inspection = {
  id: string;
  facility_id: string;
  done_by: string;
  readings: Record<string, unknown>;
  result: FacilityStatus;
  note: string | null;
  photo_path: string | null;
  created_at: string;
};

export type TicketComment = {
  id: number;
  ticket_id: number;
  author_id: string;
  body: string;
  created_at: string;
};

export type DemoPayment = {
  id: string;
  user_id: string;
  reservation_id: string | null;
  amount: number;
  currency: string;
  method: string;
  status: "demo_paid";
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }>;
      units: Table<Unit, Partial<Unit> & { code: string }>;
      stays: Table<Stay, Partial<Stay> & { unit_id: string; guest_id: string; check_in: string; check_out: string }>;
      amenities: Table<Amenity, Partial<Amenity> & { name: string }>;
      reservations: Table<Reservation, Partial<Reservation> & { amenity_id: string; starts_at: string }>;
      facilities: Table<Facility, Partial<Facility> & { name: string }>;
      inspections: Table<Inspection, Partial<Inspection> & { facility_id: string }>;
      tickets: Table<Ticket, Partial<Ticket> & { title: string; location: string }>;
      ticket_comments: Table<TicketComment, Partial<TicketComment> & { ticket_id: number; body: string }>;
      notifications: Table<Notification, Partial<Notification> & { user_id: string; body: string }>;
      payments_demo: Table<DemoPayment, Partial<DemoPayment> & { amount: number }>;
      audit_events: Table<AuditEvent, Partial<AuditEvent> & { action: string; entity: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      unit_status: UnitStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      facility_status: FacilityStatus;
      reservation_status: ReservationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
