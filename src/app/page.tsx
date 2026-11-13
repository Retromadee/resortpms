import { redirect } from "next/navigation";

import { Workspace } from "@/components/workspace/workspace";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import {
  demoAmenities,
  demoAuditEvents,
  demoFacilities,
  demoNotifications,
  demoReservations,
  demoStays,
  demoTickets,
  demoTeamMembers,
  demoUnits,
  demoProfile,
} from "@/lib/demo-data";

type HomePageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { view } = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <Workspace
        mode="preview"
        initialRole="management"
        initialView={view}
        profile={demoProfile}
        teamMembers={demoTeamMembers}
        units={demoUnits}
        tickets={demoTickets}
        facilities={demoFacilities}
        amenities={demoAmenities}
        reservations={demoReservations}
        stays={demoStays}
        notifications={demoNotifications}
        auditEvents={demoAuditEvents}
        dataWarning={null}
      />
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Supabase session verification failed:", authError.message);
  }
  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, unit_id, lang, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error("Could not load signed-in user's profile:", profileError?.message ?? "Profile not found");
    return (
      <main className="config-screen">
        <section className="config-card">
          <p className="eyebrow">ACCOUNT SETUP</p>
          <h1>Your profile is not ready yet</h1>
          <p>The authenticated account has no Resort Platform profile. Ask an administrator to check the development database setup.</p>
          <form action="/login" method="get"><button className="button button-secondary">Return to sign in</button></form>
        </section>
      </main>
    );
  }

  const [ticketsResult, unitsResult, facilitiesResult, amenitiesResult, reservationsResult, staysResult, notificationsResult, auditResult, teamMembersResult] =
    await Promise.all([
      supabase.from("tickets").select("id, title, description, location, unit_id, facility_id, priority, status, created_by, assigned_to, photo_path, created_at, updated_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("units").select("id, code, unit_type, status, created_at").order("code").limit(100),
      supabase.from("facilities").select("id, name, status, last_checked_at, last_checked_by").order("name"),
      supabase.from("amenities").select("id, name, capacity_per_slot, price_guest, price_resident, currency").order("name"),
      supabase.from("reservations").select("id, amenity_id, party_id, starts_at, party_size, status, created_at").order("starts_at", { ascending: true }).limit(50),
      profile.role === "guest"
        ? supabase.from("stays").select("id, unit_id, guest_id, check_in, check_out, source").eq("guest_id", user.id).limit(10)
        : supabase.from("stays").select("id, unit_id, guest_id, check_in, check_out, source").limit(50),
      supabase.from("notifications").select("id, user_id, body, read, created_at").order("created_at", { ascending: false }).limit(20),
      profile.role === "admin"
        ? supabase.from("audit_events").select("id, actor_id, action, entity, entity_id, detail, created_at").order("created_at", { ascending: false }).limit(30)
        : Promise.resolve({ data: [], error: null }),
      profile.role === "admin" || profile.role === "management"
        ? supabase.from("profiles").select("id, full_name, role").eq("role", "worker").order("full_name")
        : Promise.resolve({ data: [], error: null }),
    ]);

  const failures = [
    ticketsResult.error && `tickets: ${ticketsResult.error.message}`,
    unitsResult.error && `units: ${unitsResult.error.message}`,
    facilitiesResult.error && `facilities: ${facilitiesResult.error.message}`,
    amenitiesResult.error && `amenities: ${amenitiesResult.error.message}`,
    reservationsResult.error && `reservations: ${reservationsResult.error.message}`,
    staysResult.error && `stays: ${staysResult.error.message}`,
    notificationsResult.error && `notifications: ${notificationsResult.error.message}`,
    auditResult.error && `audit: ${auditResult.error.message}`,
    teamMembersResult.error && `team members: ${teamMembersResult.error.message}`,
  ].filter(Boolean);

  return (
    <Workspace
      mode="live"
      initialRole={profile.role}
      initialView={view}
      profile={profile}
      teamMembers={teamMembersResult.data ?? []}
      units={unitsResult.data ?? []}
      tickets={ticketsResult.data ?? []}
      facilities={facilitiesResult.data ?? []}
      amenities={amenitiesResult.data ?? []}
      reservations={reservationsResult.data ?? []}
      stays={staysResult.data ?? []}
      notifications={notificationsResult.data ?? []}
      auditEvents={auditResult.data ?? []}
      dataWarning={failures.length ? `Some workspace data could not be loaded: ${failures.join(" · ")}` : null}
    />
  );
}
