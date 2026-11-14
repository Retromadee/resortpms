import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Workspace } from "@/components/workspace/workspace";
import { isSupabaseConfigured, createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/database.types";
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

const demoRoleProfiles: Record<UserRole, { name: string; unitId: string | null }> = {
  admin: { name: "Taylor Chen", unitId: null },
  management: { name: "Alex Morgan", unitId: null },
  worker: { name: "Sam Rivera", unitId: null },
  resident: { name: "Casey Reed", unitId: "unit-2" },
  guest: { name: "Jordan Lee", unitId: "unit-3" },
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { view } = await searchParams;
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("resort_demo_role")?.value as UserRole | undefined;

  // 1. Try real Supabase session if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role, unit_id, lang, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
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
      }
    } catch (e) {
      console.error("Live Supabase check failed:", e);
    }
  }

  // 2. Demo role session active
  if (demoRole && ["guest", "resident", "worker", "management", "admin"].includes(demoRole)) {
    const roleInfo = demoRoleProfiles[demoRole];
    return (
      <Workspace
        mode="preview"
        initialRole={demoRole}
        initialView={view}
        profile={{
          ...demoProfile,
          role: demoRole,
          full_name: roleInfo.name,
          unit_id: roleInfo.unitId,
        }}
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

  // 3. Otherwise redirect to login
  redirect("/login");
}
