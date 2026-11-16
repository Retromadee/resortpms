-- Synthetic development fixtures only. No real resort inventory or prices.
insert into public.units (code, unit_type, status) values
  ('DEMO-A-101', 'apartment', 'for_rent'),
  ('DEMO-A-204', 'apartment', 'bnb'),
  ('DEMO-B-105', 'apartment', 'owner_occupied'),
  ('DEMO-C-102', 'villa', 'maintenance')
on conflict (code) do update
  set unit_type = excluded.unit_type, status = excluded.status;

insert into public.amenities (name, capacity_per_slot, price_guest, price_resident, currency) values
  ('Spa', 3, 0, 0, 'EUR'),
  ('Hamam', 4, 0, 0, 'EUR'),
  ('Gym', 12, 0, 0, 'EUR'),
  ('Paddle court', 4, 0, 0, 'EUR'),
  ('Restaurant', 20, 0, 0, 'EUR')
on conflict (name) do update
  set capacity_per_slot = excluded.capacity_per_slot,
      price_guest = excluded.price_guest,
      price_resident = excluded.price_resident,
      currency = excluded.currency;

insert into public.facilities (name) values
  ('Outdoor pool'),
  ('Indoor pool'),
  ('Paddle court'),
  ('Main lawn'),
  ('Gardens and paths')
on conflict (name) do nothing;
