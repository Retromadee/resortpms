"use client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  DoorOpen,
  Droplets,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Waves,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { LanguageSwitcher, useI18n } from "@/components/language-switcher";
import { demoTickets } from "@/lib/demo-data";
import type { Dictionary } from "@/lib/i18n";
import type {
  Amenity,
  AuditEvent,
  Facility,
  FacilityStatus,
  Notification,
  Profile,
  Reservation,
  Stay,
  Ticket as ResortTicket,
  TicketPriority,
  TicketStatus,
  Unit,
  UnitStatus,
  UserRole,
} from "@/lib/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type View =
  | "overview"
  | "tickets"
  | "tasks"
  | "units"
  | "facilities"
  | "bookings"
  | "notifications"
  | "activity";

type WorkspaceProps = {
  mode: "preview" | "live";
  initialRole: UserRole;
  initialView?: string;
  profile: Profile;
  teamMembers: Pick<Profile, "id" | "full_name" | "role">[];
  units: Unit[];
  tickets: ResortTicket[];
  facilities: Facility[];
  amenities: Amenity[];
  reservations: Reservation[];
  stays: Stay[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  dataWarning: string | null;
};

function getRoleTitles(t: Dictionary): Record<UserRole, string> {
  return {
    guest: t.guest,
    resident: t.resident,
    worker: t.worker,
    management: t.management,
    admin: t.admin,
  };
}

function getViewTitles(t: Dictionary): Record<View, string> {
  return {
    overview: t.overview,
    tickets: t.serviceDesk,
    tasks: t.myTasks,
    units: t.unitRegistry,
    facilities: t.facilities,
    bookings: t.amenityBookings,
    notifications: t.notifications,
    activity: t.auditActivity,
  };
}

function getUnitStatusTitles(t: Dictionary): Record<UnitStatus, string> {
  return {
    for_sale: t.statusForSale,
    for_rent: t.statusForRent,
    bnb: t.statusBnb,
    owner_occupied: t.statusOwnerOccupied,
    maintenance: t.statusMaintenance,
  };
}

function getTicketStatusTitles(t: Dictionary): Record<TicketStatus, string> {
  return {
    open: t.statusOpen,
    assigned: t.statusAssigned,
    in_progress: t.statusInProgress,
    done: t.statusDone,
  };
}

function getFacilityStatusTitles(t: Dictionary): Record<FacilityStatus, string> {
  return {
    ok: t.statusOk,
    attention: t.statusAttention,
    closed: t.statusClosed,
  };
}

const navViewsByRole: Record<UserRole, { view: View; icon: typeof Home }[]> = {
  guest: [
    { view: "overview", icon: Home },
    { view: "bookings", icon: CalendarDays },
    { view: "tickets", icon: Ticket },
    { view: "notifications", icon: Bell },
  ],
  resident: [
    { view: "overview", icon: Home },
    { view: "tickets", icon: Ticket },
    { view: "bookings", icon: CalendarDays },
    { view: "facilities", icon: Waves },
    { view: "notifications", icon: Bell },
  ],
  worker: [
    { view: "tasks", icon: ClipboardList },
    { view: "facilities", icon: ClipboardCheck },
    { view: "tickets", icon: Ticket },
    { view: "notifications", icon: Bell },
  ],
  management: [
    { view: "overview", icon: LayoutDashboard },
    { view: "tickets", icon: Ticket },
    { view: "units", icon: DoorOpen },
    { view: "facilities", icon: Waves },
    { view: "bookings", icon: CalendarDays },
    { view: "notifications", icon: Bell },
  ],
  admin: [
    { view: "overview", icon: LayoutDashboard },
    { view: "tickets", icon: Ticket },
    { view: "units", icon: DoorOpen },
    { view: "facilities", icon: Waves },
    { view: "bookings", icon: CalendarDays },
    { view: "activity", icon: Activity },
    { view: "notifications", icon: Bell },
  ],
};

function getNavLabel(view: View, role: UserRole, t: Dictionary): string {
  if (view === "overview") {
    return role === "guest" ? t.myCurrentStay : role === "resident" ? t.myHome : t.overview;
  }
  if (view === "tickets") {
    return role === "guest" || role === "resident" ? t.myRequests : t.serviceDesk;
  }
  if (view === "tasks") return t.myTasks;
  if (view === "units") return t.unitRegistry;
  if (view === "facilities") return role === "worker" ? t.facilityChecks : t.facilities;
  if (view === "bookings") return t.amenityBookings;
  if (view === "notifications") return t.notifications;
  if (view === "activity") return t.auditActivity;
  return view;
}

const amenityEmojis: Record<string, string> = {
  Spa: "✦",
  Hamam: "♨",
  Gym: "⌁",
  "Paddle court": "◉",
  Restaurant: "🍽️",
  "Restaurant table": "🍽️",
};

function getDefaultView(role: UserRole): View {
  if (role === "guest") return "overview";
  if (role === "worker") return "tasks";
  return "overview";
}

function getInitialView(value: string | undefined, role: UserRole): View {
  const allowedViews = navViewsByRole[role].map((item) => item.view);
  return value && allowedViews.includes(value as View) ? (value as View) : getDefaultView(role);
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "TR";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTicketRecord(value: unknown): value is ResortTicket {
  if (!isRecord(value)) return false;
  return typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.location === "string" &&
    ["open", "assigned", "in_progress", "done"].includes(String(value.status)) &&
    ["low", "medium", "high"].includes(String(value.priority)) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string";
}

function isFacilityRecord(value: unknown): value is Facility {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    ["ok", "attention", "closed"].includes(String(value.status));
}

function isNotificationRecord(value: unknown): value is Notification {
  return isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.user_id === "string" &&
    typeof value.body === "string" &&
    typeof value.read === "boolean" &&
    typeof value.created_at === "string";
}

function dateLabel(value: string | null | undefined, lang: string = "en", notCheckedText: string = "Not checked yet") {
  if (!value) return notCheckedText;
  const locale = lang === "tr" ? "tr-TR" : "en-GB";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function relativeTime(value: string, t: Dictionary) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return `${minutes}${t.mAgo}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t.hAgo}`;
  return `${Math.floor(hours / 24)}${t.dAgo}`;
}

function StatusPill({ value, label }: { value: string; label: string }) {
  return <span className={`status-pill status-${value}`}>{label}</span>;
}

function PageHeading({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow?: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </div>
  );
}

function PanelHeader({
  title,
  detail,
  link,
}: {
  title: string;
  detail?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {link && <Link className="text-link" href={link.href}>{link.label} <ArrowRight size={13} /></Link>}
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  caption,
  icon,
  tone,
}: {
  label: string;
  value: string;
  trend?: string;
  caption: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div>
      <div className="stat-value"><strong>{value}</strong>{trend && <span>{trend}</span>}</div>
      <div className="stat-caption">{caption}</div>
    </article>
  );
}

function WorkspaceLink({ view, currentView, label, icon: Icon, count }: {
  view: View;
  currentView: View;
  label: string;
  icon: typeof Home;
  count?: number;
}) {
  return (
    <Link href={`/?view=${view}`} className={`nav-link ${currentView === view ? "active" : ""}`}>
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
      {count ? <span className="nav-count">{count}</span> : null}
    </Link>
  );
}

function WorkspaceShell({
  children,
  mode,
  role,
  profile,
  currentView,
  unreadCount,
}: {
  children: ReactNode;
  mode: "preview" | "live";
  role: UserRole;
  profile: Profile;
  currentView: View;
  unreadCount: number;
}) {
  const { t } = useI18n();
  const roleTitles = getRoleTitles(t);
  const viewTitles = getViewTitles(t);
  const navItems = navViewsByRole[role];

  const mobileViews: View[] = role === "admin"
    ? ["overview", "tickets", "units", "activity", "facilities"]
    : role === "management"
      ? ["overview", "tickets", "units", "facilities", "bookings"]
      : navItems.slice(0, 5).map((item) => item.view);

  const mobileNav = mobileViews
    .map((view) => navItems.find((item) => item.view === view))
    .filter((item): item is { view: View; icon: typeof Home } => item !== undefined);

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark"><Waves size={21} aria-hidden="true" /></span>
          <span>{t.resortTitle}<small>{t.resortLocation}</small></span>
        </Link>
        <p className="workspace-label">{t.workspaceLabel}</p>
        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <WorkspaceLink
              key={item.view}
              view={item.view}
              currentView={currentView}
              label={getNavLabel(item.view, role, t)}
              icon={item.icon}
              count={item.view === "tickets" ? 3 : item.view === "notifications" && unreadCount ? unreadCount : undefined}
            />
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-icon"><CircleHelp size={16} /></span>
            <strong>{t.needAHand}</strong>
            <p>{t.supportBody}</p>
          </div>
          <div className="profile-mini">
            <span className="avatar">{initials(profile.full_name || roleTitles[role])}</span>
            <span><strong>{profile.full_name || roleTitles[role]}</strong><small>{roleTitles[role]}</small></span>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">{t.breadcrumbPrefix} <span aria-hidden="true">/</span> <strong>{viewTitles[currentView]}</strong></div>
          <div className="top-actions">
            <LanguageSwitcher compact />
            {mode === "preview" ? (
              <span className="role-pill">{t.preview} · {roleTitles[role]}</span>
            ) : (
              <span className="role-pill">{roleTitles[role]}</span>
            )}
            <Link href="/?view=notifications" className="icon-button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}>
              <Bell size={17} />
              {unreadCount > 0 && <span className="notification-dot" />}
            </Link>
            {mode === "live" && (
              <form action="/logout" method="post">
                <button className="icon-button" type="submit" aria-label={t.signOut} title={t.signOut}><LogOut size={17} /></button>
              </form>
            )}
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileNav.map((item) => (
          <Link key={item.view} href={`/?view=${item.view}`} className={`mobile-nav-link ${currentView === item.view ? "active" : ""}`}>
            <item.icon />
            <span>{getNavLabel(item.view, role, t)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function OverviewView({
  role,
  tickets,
  units,
  facilities,
  reservations,
  onCreateTicket,
}: {
  role: UserRole;
  tickets: ResortTicket[];
  units: Unit[];
  facilities: Facility[];
  reservations: Reservation[];
  onCreateTicket: () => void;
}) {
  const { t, lang } = useI18n();
  const openCount = tickets.filter((ticket) => ticket.status !== "done").length;
  const readyFacilities = facilities.filter((facility) => facility.status === "ok").length;
  const occupiedUnits = units.filter((unit) => unit.status === "bnb" || unit.status === "owner_occupied").length;

  const greetings: Record<UserRole, { title: string; detail: string }> = {
    guest: { title: t.guestTitle, detail: t.guestDetail },
    resident: { title: t.residentTitle, detail: t.residentDetail },
    worker: { title: t.workerTitle, detail: t.workerDetail },
    management: { title: t.mgmtTitle, detail: t.mgmtDetail },
    admin: { title: t.adminTitle, detail: t.adminDetail },
  };

  const greeting = greetings[role];

  if (role === "guest" || role === "resident") {
    return (
      <>
        <PageHeading eyebrow={t.yourResort} title={greeting.title} detail={greeting.detail} />
        <div className="stats-grid">
          <StatCard label={role === "guest" ? t.myCurrentStay : t.myHome} value={role === "guest" ? "A-204" : "A-101"} caption={role === "guest" ? t.checkOutFriday : t.everythingInOnePlace} icon={<Home size={17} />} tone="green" />
          <StatCard label={t.upcomingBookings} value={String(reservations.length)} caption={t.yourNextMoments} icon={<CalendarDays size={17} />} tone="sand" />
          <StatCard label={t.myRequests} value={String(openCount)} caption={t.weAreOnIt} icon={<Ticket size={17} />} tone="blue" />
          <StatCard label={t.facilitiesLabel} value={`${readyFacilities}/${facilities.length}`} caption={t.openAndReady} icon={<Waves size={17} />} tone="rose" />
        </div>
        <div className="dashboard-grid">
          <section className="panel">
            <PanelHeader title={t.myRecentRequests} detail={t.aLittleUpdate} link={{ label: t.viewAll, href: "/?view=tickets" }} />
            {tickets.length ? <TicketList tickets={tickets.slice(0, 4)} /> : <EmptyState text={t.noRequestsMatch} />}
          </section>
          <section className="panel">
            <PanelHeader title={t.aroundTheResort} detail={t.quickLookFacilities} />
            <FacilityTiles facilities={facilities.slice(0, 4)} />
            <div className="capacity-wrap">
              <div className="capacity-label"><span>{t.nextBooking}</span><strong>{reservations[0] ? dateLabel(reservations[0].starts_at, lang, t.notCheckedYet) : t.noBookingsYet}</strong></div>
              <div className="capacity-foot"><span>{reservations.length} {reservations.length === 1 ? t.upcomingReservation : t.upcomingReservations}</span><span>{t.updatedJustNow}</span></div>
            </div>
          </section>
        </div>
        <div className="section-spacer"><button className="button button-primary" onClick={onCreateTicket}><Plus size={15} /> {t.letUsKnow}</button></div>
      </>
    );
  }

  if (role === "worker") {
    const assigned = tickets.filter((ticket) => ticket.status !== "done");
    return (
      <>
        <PageHeading eyebrow={t.yourShift} title={greeting.title} detail={greeting.detail} action={<Link className="button button-primary" href="/?view=facilities"><ClipboardCheck size={15} /> {t.startFacilityCheck}</Link>} />
        <div className="stats-grid">
          <StatCard label={t.assignedToMe} value={String(assigned.length)} caption={t.tasksInQueue} icon={<ClipboardList size={17} />} tone="green" />
          <StatCard label={t.highPriority} value={String(assigned.filter((ticket) => ticket.priority === "high").length)} caption={t.needsCloserLook} icon={<AlertCircle size={17} />} tone="rose" />
          <StatCard label={t.facilityChecks} value="2 / 4" caption={t.todaysChecklist} icon={<ClipboardCheck size={17} />} tone="blue" />
          <StatCard label={t.completedToday} value="6" caption={t.niceWork} icon={<Check size={17} />} tone="sand" />
        </div>
        <section className="panel">
          <PanelHeader title={t.yourTaskList} detail={t.startWithItem} link={{ label: t.openTaskList, href: "/?view=tasks" }} />
          {assigned.length ? <TicketList tickets={assigned.slice(0, 5)} /> : <EmptyState text={t.allCaughtUp} />}
        </section>
      </>
    );
  }

  const todayLabel = new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase();

  return (
    <>
      <PageHeading
        eyebrow={todayLabel}
        title={greeting.title}
        detail={greeting.detail}
        action={<button className="button button-primary" onClick={onCreateTicket}><Plus size={15} /> {t.newRequest}</button>}
      />
      <div className="stats-grid">
        <StatCard label={t.totalResidences} value={String(units.length)} caption={t.sampleUnits} icon={<Home size={17} />} tone="green" />
        <StatCard label={t.openRequests} value={String(openCount)} caption={t.acrossAllDepts} icon={<Ticket size={17} />} tone="sand" />
        <StatCard label={t.facilitiesReady} value={`${readyFacilities}/${facilities.length}`} caption={t.lastInspection} icon={<Waves size={17} />} tone="blue" />
        <StatCard label={t.upcomingBookings} value={String(reservations.length)} caption={t.sampleReservations} icon={<CalendarDays size={17} />} tone="rose" />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <PanelHeader title={t.serviceDeskPanel} detail={`${openCount} ${t.needAttentionToday}`} link={{ label: t.viewAllTickets, href: "/?view=tickets" }} />
          {tickets.length ? <TicketList tickets={tickets.slice(0, 5)} /> : <EmptyState text={t.noRequestsMatch} />}
        </section>
        <div className="side-stack">
          <section className="panel">
            <PanelHeader title={t.facilityStatus} detail={`${readyFacilities} / ${facilities.length} ${t.ofReady}`} link={{ label: t.viewFacilities, href: "/?view=facilities" }} />
            <FacilityTiles facilities={facilities.slice(0, 4)} />
          </section>
          <section className="panel section-spacer">
            <PanelHeader title={t.residenceMix} link={{ label: t.unitRegistryLink, href: "/?view=units" }} />
            <div className="capacity-wrap">
              <div className="capacity-label"><span>{t.occupiedOrHosting}</span><strong>{occupiedUnits} / {units.length}</strong></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${units.length ? Math.round((occupiedUnits / units.length) * 100) : 0}%` }} /></div>
              <div className="capacity-foot"><span>{t.bnbAndOwnerOccupied}</span><span>{units.length ? Math.round((occupiedUnits / units.length) * 100) : 0}%</span></div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function TicketList({ tickets }: { tickets: ResortTicket[] }) {
  const { t } = useI18n();
  const ticketStatusTitles = getTicketStatusTitles(t);

  return (
    <div className="ticket-list">
      {tickets.map((ticket) => (
        <article className="ticket-row" key={ticket.id}>
          <div className="ticket-main">
            <span className={`priority-mark ${ticket.priority}`} />
            <div style={{ minWidth: 0 }}>
              <p className="ticket-title">#{ticket.id} · {ticket.title}</p>
              <div className="ticket-meta"><span><MapPin size={11} /> {ticket.location}</span><span>{relativeTime(ticket.created_at, t)}</span></div>
            </div>
          </div>
          <StatusPill value={ticket.status} label={ticketStatusTitles[ticket.status]} />
        </article>
      ))}
    </div>
  );
}

function FacilityTiles({ facilities }: { facilities: Facility[] }) {
  const { t } = useI18n();
  const facilityStatusTitles = getFacilityStatusTitles(t);

  return (
    <div className="facility-grid">
      {facilities.map((facility) => (
        <div className="facility-tile" key={facility.id}>
          <strong>{facility.name}</strong>
          <div className="facility-tile-bottom">
            <StatusPill value={facility.status} label={facilityStatusTitles[facility.status]} />
            <span>{relativeTime(facility.last_checked_at ?? new Date().toISOString(), t)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="view-empty"><p>{text}</p></div>;
}

function TableSearch({ value, onChange, placeholder = "Search" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-field">
      <Search size={15} aria-hidden="true" />
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function TicketsView({
  tickets,
  role,
  units,
  facilities,
  stays,
  mode,
  onCreate,
  onTicketsChange,
  teamMembers,
}: {
  tickets: ResortTicket[];
  role: UserRole;
  units: Unit[];
  facilities: Facility[];
  stays: Stay[];
  mode: "preview" | "live";
  onCreate: () => void;
  onTicketsChange: (tickets: ResortTicket[]) => void;
  teamMembers: Pick<Profile, "id" | "full_name" | "role">[];
}) {
  const { t } = useI18n();
  const ticketStatusTitles = getTicketStatusTitles(t);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const filtered = tickets.filter((ticket) => {
    const matchesSearch = `${ticket.title} ${ticket.location} ${ticket.id}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === "all" || ticket.status === statusFilter);
  });
  const canProgress = role === "worker";
  const canAssign = role === "management" || role === "admin";

  const priorityLabels: Record<TicketPriority, string> = {
    low: t.low,
    medium: t.medium,
    high: t.high,
  };

  async function advanceTicket(ticket: ResortTicket) {
    const nextStatus: TicketStatus | null =
      ticket.status === "assigned" ? "in_progress" : ticket.status === "in_progress" ? "done" : null;
    if (!nextStatus) return;
    setErrorMessage(null);

    if (mode === "preview") {
      onTicketsChange(tickets.map((item) => item.id === ticket.id ? { ...item, status: nextStatus, updated_at: new Date().toISOString() } : item));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("tickets").update({ status: nextStatus }).eq("id", ticket.id);
    if (error) {
      setErrorMessage(`Ticket could not be updated: ${error.message}`);
      return;
    }
    onTicketsChange(tickets.map((item) => item.id === ticket.id ? { ...item, status: nextStatus, updated_at: new Date().toISOString() } : item));
  }

  async function assignTicket(ticket: ResortTicket, workerId: string) {
    setErrorMessage(null);
    const update = {
      assigned_to: workerId || null,
      status: workerId ? "assigned" as const : "open" as const,
    };

    if (mode === "preview") {
      onTicketsChange(tickets.map((item) => item.id === ticket.id ? { ...item, ...update, updated_at: new Date().toISOString() } : item));
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("tickets").update(update).eq("id", ticket.id);
    if (error) {
      setErrorMessage(`Ticket assignment could not be saved: ${error.message}`);
      return;
    }
    onTicketsChange(tickets.map((item) => item.id === ticket.id ? { ...item, ...update, updated_at: new Date().toISOString() } : item));
  }

  return (
    <section className="table-panel">
      <div className="table-toolbar">
        <TableSearch value={search} onChange={setSearch} placeholder={t.searchPlaceholder} />
        <div className="heading-actions">
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={t.filterByStatus}>
            <option value="all">{t.filterAll}</option>
            {Object.entries(ticketStatusTitles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button className="button button-primary" onClick={onCreate}><Plus size={14} /> {t.newRequest}</button>
        </div>
      </div>
      {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
      {filtered.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>{t.request}</th><th>{t.location}</th><th>{t.priority}</th><th>{t.status}</th>{canAssign && <th>{t.assignedTo}</th>}<th>{t.date}</th>{canProgress && <th>{t.actions}</th>}</tr></thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id}>
                  <td><strong>#{ticket.id} · {ticket.title}</strong></td>
                  <td>{ticket.location}</td>
                  <td><StatusPill value={`priority-${ticket.priority}`} label={priorityLabels[ticket.priority] ?? ticket.priority} /></td>
                  <td><StatusPill value={ticket.status} label={ticketStatusTitles[ticket.status]} /></td>
                  {canAssign && <td><select className="filter-select" aria-label={`Assign ticket ${ticket.id}`} value={ticket.assigned_to ?? ""} disabled={ticket.status === "done"} onChange={(event) => void assignTicket(ticket, event.target.value)}><option value="">{t.unassigned}</option>{teamMembers.map((worker) => <option key={worker.id} value={worker.id}>{worker.full_name || "Worker"}</option>)}</select></td>}
                  <td>{relativeTime(ticket.created_at, t)}</td>
                  {canProgress && <td>{ticket.status !== "done" && ticket.assigned_to && <button className="text-link" onClick={() => void advanceTicket(ticket)}>{ticket.status === "assigned" ? t.start : t.resolve} <ArrowRight size={12} /></button>}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState text={t.noRequestsMatch} />}
      <span className="sr-only">{units.length} units and {facilities.length} facilities available; {stays.length} stays.</span>
    </section>
  );
}

function UnitsView({ units, mode, onUnitsChange }: {
  units: Unit[];
  mode: "preview" | "live";
  onUnitsChange: (units: Unit[]) => void;
}) {
  const { t, lang } = useI18n();
  const unitStatusTitles = getUnitStatusTitles(t);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const results = units.filter((unit) =>
    `${unit.code} ${unit.unit_type}`.toLowerCase().includes(search.toLowerCase()) &&
    (status === "all" || unit.status === status),
  );

  async function changeStatus(unit: Unit, nextStatus: UnitStatus) {
    setErrorMessage(null);
    if (mode === "preview") {
      onUnitsChange(units.map((item) => item.id === unit.id ? { ...item, status: nextStatus } : item));
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("units").update({ status: nextStatus }).eq("id", unit.id);
    if (error) {
      setErrorMessage(`Unit status could not be changed: ${error.message}`);
      return;
    }
    onUnitsChange(units.map((item) => item.id === unit.id ? { ...item, status: nextStatus } : item));
  }

  return (
    <section className="table-panel">
      <div className="table-toolbar">
        <TableSearch value={search} onChange={setSearch} placeholder={t.searchPlaceholder} />
        <select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label={t.filterByStatus}>
          <option value="all">{t.filterAll}</option>
          {Object.entries(unitStatusTitles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
      {results.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>{t.unit}</th><th>{t.type}</th><th>{t.status}</th><th>{t.lastUpdated}</th><th>{t.changeStatus}</th></tr></thead>
            <tbody>{results.map((unit) => (
              <tr key={unit.id}>
                <td><strong>{unit.code}</strong></td><td>{unit.unit_type}</td>
                <td><StatusPill value={`unit-${unit.status}`} label={unitStatusTitles[unit.status]} /></td>
                <td>{dateLabel(unit.created_at, lang, t.notCheckedYet)}</td>
                <td>
                  <select className="filter-select" aria-label={`Change status for ${unit.code}`} value={unit.status} onChange={(event) => void changeStatus(unit, event.target.value as UnitStatus)}>
                    {Object.entries(unitStatusTitles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState text={t.noUnitsMatch} />}
    </section>
  );
}

function FacilitiesView({ facilities, role, mode, onFacilitiesChange }: {
  facilities: Facility[];
  role: UserRole;
  mode: "preview" | "live";
  onFacilitiesChange: (facilities: Facility[]) => void;
}) {
  const { t, lang } = useI18n();
  const facilityStatusTitles = getFacilityStatusTitles(t);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canCheck = role === "worker" || role === "management" || role === "admin";

  async function recordCheck(facility: Facility, result: FacilityStatus) {
    setErrorMessage(null);
    if (mode === "preview") {
      onFacilitiesChange(facilities.map((item) => item.id === facility.id ? { ...item, status: result, last_checked_at: new Date().toISOString() } : item));
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("inspections").insert({
      facility_id: facility.id,
      result,
      note: "Routine mobile inspection",
    });
    if (error) {
      setErrorMessage(`Inspection could not be saved: ${error.message}`);
      return;
    }
    onFacilitiesChange(facilities.map((item) => item.id === facility.id ? { ...item, status: result, last_checked_at: new Date().toISOString() } : item));
  }

  return (
    <>
      <div className="facility-list">
        {facilities.map((facility) => (
          <article className="facility-card" key={facility.id}>
            <div className="facility-card-head">
              <div><h3>{facility.name}</h3><p>{t.lastChecked} {dateLabel(facility.last_checked_at, lang, t.notCheckedYet)}</p></div>
              <StatusPill value={facility.status} label={facilityStatusTitles[facility.status]} />
            </div>
            <div className="facility-card-foot">
              <span><Droplets size={12} /> {t.routineFacilityLog}</span>
              {canCheck && (
                <select className="filter-select" value="" aria-label={`Record check for ${facility.name}`} onChange={(event) => {
                  if (event.target.value) void recordCheck(facility, event.target.value as FacilityStatus);
                }}>
                  <option value="">{t.recordCheck}</option>
                  <option value="ok">{t.allClear}</option>
                  <option value="attention">{t.needsAttention}</option>
                  <option value="closed">{t.closed}</option>
                </select>
              )}
            </div>
          </article>
        ))}
      </div>
      {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
    </>
  );
}

function BookingsView({ amenities, reservations, role, mode, onReservationsChange }: {
  amenities: Amenity[];
  reservations: Reservation[];
  role: UserRole;
  mode: "preview" | "live";
  onReservationsChange: (reservations: Reservation[]) => void;
}) {
  const { t } = useI18n();
  const [amenityId, setAmenityId] = useState(amenities[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [partySize, setPartySize] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const canBook = role === "guest" || role === "resident";

  async function createReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!amenityId || !selectedDate || !selectedTime) {
      setErrorMessage(t.chooseAnAmenity);
      return;
    }
    const startsAt = `${selectedDate}T${selectedTime}`;
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime()) || start <= new Date()) {
      setErrorMessage(t.chooseFutureTime);
      return;
    }
    if (mode === "preview") {
      onReservationsChange([
        { id: `preview-${Date.now()}`, amenity_id: amenityId, party_id: `demo-${role}`, starts_at: start.toISOString(), party_size: partySize, status: "confirmed", created_at: new Date().toISOString() },
        ...reservations,
      ]);
      setSuccessMessage(t.sampleBookingAdded);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setErrorMessage(t.sessionExpiredBooking);
      return;
    }
    const { data, error } = await supabase.from("reservations").insert({
      amenity_id: amenityId,
      party_id: user.id,
      starts_at: start.toISOString(),
      party_size: partySize,
    }).select("id, amenity_id, party_id, starts_at, party_size, status, created_at").single();
    if (error) {
      setErrorMessage(`Booking could not be saved: ${error.message}`);
      return;
    }
    onReservationsChange([data, ...reservations]);
    setSuccessMessage(t.reservationConfirmed);
  }

  return (
    <>
      <div className="booking-grid">
        {amenities.map((amenity) => (
          <article className="booking-card" key={amenity.id}>
            <div className="booking-card-top"><span className="booking-emoji">{amenityEmojis[amenity.name] ?? "✦"}</span><span className="status-pill status-ok">{t.available}</span></div>
            <h3>{amenity.name}</h3><p>{t.chooseATime}</p>
            <div className="booking-capacity">{t.upToGuests.replace("{n}", String(amenity.capacity_per_slot))}</div>
          </article>
        ))}
      </div>
      {canBook ? (
        <section className="table-panel section-spacer">
          <PanelHeader title={t.makeAReservation} detail={t.bookingCapacityCheck} />
          <form className="booking-form" onSubmit={(event) => void createReservation(event)}>
            <div className="form-field"><label htmlFor="booking-amenity">{t.amenity}</label><select id="booking-amenity" value={amenityId} onChange={(event) => setAmenityId(event.target.value)} required>{amenities.map((amenity) => <option key={amenity.id} value={amenity.id}>{amenity.name}</option>)}</select></div>
            <DateAvailabilityPicker amenityId={amenityId} reservations={reservations} value={selectedDate} onChange={setSelectedDate} />
            <div className="form-field"><label htmlFor="booking-time">{t.timeLabel}</label><select id="booking-time" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} required>{bookingTimes.map((time) => <option key={time} value={time}>{time}</option>)}</select></div>
            <div className="form-field"><label htmlFor="booking-party">{t.guests}</label><input id="booking-party" type="number" min={1} max={12} value={partySize} onChange={(event) => setPartySize(Number(event.target.value))} required /></div>
            <button className="button button-primary"><CalendarDays size={14} /> {t.requestASpot}</button>
          </form>
          {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
          {successMessage && <div className="notice notice-warn" role="status">{successMessage}</div>}
        </section>
      ) : (
        <section className="panel section-spacer">
          <PanelHeader title={t.upcomingReservationsTitle} detail={t.bookingsProtected} />
          {reservations.length ? <ReservationList reservations={reservations} amenities={amenities} /> : <EmptyState text={t.noReservationsScheduled} />}
        </section>
      )}
      {canBook && (
        <section className="panel section-spacer">
          <PanelHeader title={t.yourUpcomingReservations} detail={t.onlyYourBookings} />
          {reservations.length ? <ReservationList reservations={reservations} amenities={amenities} /> : <EmptyState text={t.noUpcomingBookings} />}
        </section>
      )}
    </>
  );
}

const bookingTimes = ["09:00", "11:00", "13:00", "15:00", "17:00"];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function DateAvailabilityPicker({ amenityId, reservations, value, onChange }: {
  amenityId: string;
  reservations: Reservation[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const locale = lang === "tr" ? "tr-TR" : "en-GB";
  const days = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() + index);
    return day;
  }), []);
  const unavailable = useMemo(() => new Set(
    reservations
      .filter((reservation) => reservation.amenity_id === amenityId && reservation.status === "confirmed")
      .map((reservation) => dateKey(new Date(reservation.starts_at))),
  ), [amenityId, reservations]);
  const selectedLabel = value
    ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`))
    : t.chooseADate;

  return (
    <div className="form-field date-picker-field">
      <label htmlFor="booking-date">{t.dateLabel}</label>
      <div className="date-picker">
        <button id="booking-date" type="button" className="date-picker-trigger" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
          <CalendarDays size={15} /> <span>{selectedLabel}</span><span className="date-picker-chevron">⌄</span>
        </button>
        {open && (
          <div className="date-picker-menu" role="listbox" aria-label={t.chooseADate}>
            {days.map((day) => {
              const key = dateKey(day);
              const isUnavailable = unavailable.has(key);
              return <button key={key} type="button" role="option" aria-selected={value === key} disabled={isUnavailable} className={`date-option ${value === key ? "selected" : ""}`} onClick={() => { onChange(key); setOpen(false); }}>
                <span>{new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day)}</span>
                <strong>{day.getDate()}</strong>
                <span className={`availability-marker ${isUnavailable ? "unavailable" : "available"}`} aria-label={isUnavailable ? t.notAvailable : t.availableLabel} />
              </button>;
            })}
            <div className="date-picker-legend"><span><i className="availability-marker available" /> {t.availableLabel}</span><span><i className="availability-marker unavailable" /> {t.notAvailable}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationList({ reservations, amenities }: { reservations: Reservation[]; amenities: Amenity[] }) {
  const { t, lang } = useI18n();

  return (
    <div className="ticket-list">{reservations.map((reservation) => {
      const amenity = amenities.find((item) => item.id === reservation.amenity_id);
      return (
        <div className="ticket-row" key={reservation.id}>
          <div className="ticket-main">
            <span className="stat-icon sand"><CalendarDays size={15} /></span>
            <div><p className="ticket-title">{amenity?.name ?? "Resort amenity"}</p><div className="ticket-meta"><span>{dateLabel(reservation.starts_at, lang, t.notCheckedYet)}</span><span>{reservation.party_size} {t.guests.toLowerCase()}</span></div></div>
          </div>
          <StatusPill value={reservation.status === "confirmed" ? "ok" : "closed"} label={reservation.status === "confirmed" ? t.statusOk : t.statusClosed} />
        </div>
      );
    })}</div>
  );
}

function NotificationsView({ notifications, mode, onNotificationsChange }: {
  notifications: Notification[];
  mode: "preview" | "live";
  onNotificationsChange: (notifications: Notification[]) => void;
}) {
  const { t } = useI18n();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function markAllRead() {
    setErrorMessage(null);
    const unread = notifications.filter((notification) => !notification.read);
    if (mode === "preview") {
      onNotificationsChange(notifications.map((notification) => ({ ...notification, read: true })));
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setErrorMessage(t.sessionExpired);
      return;
    }
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    if (error) {
      setErrorMessage(`Notifications could not be updated: ${error.message}`);
      return;
    }
    onNotificationsChange(notifications.map((notification) => ({ ...notification, read: true })));
    if (unread.length === 0) return;
  }

  return (
    <section className="panel">
      <PanelHeader title={t.recentUpdates} detail={t.clearView} />
      {errorMessage && <div className="notice notice-error" role="alert">{errorMessage}</div>}
      {notifications.length ? (
        <>
          <div className="ticket-list">{notifications.map((notification) => (
            <article className="ticket-row" key={notification.id}>
              <div className="ticket-main">
                <span className={`stat-icon ${notification.read ? "blue" : "green"}`}><Bell size={15} /></span>
                <div><p className="ticket-title">{notification.body}</p><div className="ticket-meta"><span>{relativeTime(notification.created_at, t)}</span>{!notification.read && <span>{t.newLabel}</span>}</div></div>
              </div>
              <StatusPill value={notification.read ? "done" : "assigned"} label={notification.read ? t.read : t.unread} />
            </article>
          ))}</div>
          <div className="table-toolbar"><span className="stat-caption">{notifications.filter((notification) => !notification.read).length} {t.unreadUpdates}</span><button className="text-link" onClick={() => void markAllRead()}>{t.markAllRead} <Check size={13} /></button></div>
        </>
      ) : <EmptyState text={t.allCaughtUp} />}
    </section>
  );
}

function ActivityView({ auditEvents }: { auditEvents: AuditEvent[] }) {
  const { t } = useI18n();

  return (
    <section className="table-panel">
      <PanelHeader title={t.auditActivityTitle} detail={t.adminViewChanges} />
      {auditEvents.length ? (
        <div className="table-scroll"><table className="data-table">
          <thead><tr><th>{t.action}</th><th>{t.area}</th><th>{t.record}</th><th>{t.details}</th><th>{t.when}</th></tr></thead>
          <tbody>{auditEvents.map((event) => (
            <tr key={event.id}><td><strong>{event.action}</strong></td><td>{event.entity}</td><td>{event.entity_id ?? "—"}</td><td>{Object.entries(event.detail).map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value)}`).join(" · ") || "—"}</td><td>{relativeTime(event.created_at, t)}</td></tr>
          ))}</tbody>
        </table></div>
      ) : <EmptyState text={t.noAuditEvents} />}
    </section>
  );
}

function TicketModal({
  role,
  mode,
  profileUnitId,
  units,
  facilities,
  stays,
  onClose,
  onCreated,
}: {
  role: UserRole;
  mode: "preview" | "live";
  profileUnitId: string | null;
  units: Unit[];
  facilities: Facility[];
  stays: Stay[];
  onClose: () => void;
  onCreated: (ticket: ResortTicket) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [locationId, setLocationId] = useState("");
  const [locationKind, setLocationKind] = useState<"unit" | "facility">(() => role === "worker" ? "facility" : "unit");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentStayUnitIds = new Set(stays.map((stay) => stay.unit_id));
  const allowedUnits = role === "guest" ? units.filter((unit) => currentStayUnitIds.has(unit.id)) :
    role === "resident" ? units.filter((unit) => unit.id === (mode === "preview" ? "unit-2" : profileUnitId)) : units;
  const canChooseUnit = role !== "worker";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    const unitId = locationKind === "unit" ? locationId : null;
    const facilityId = locationKind === "facility" ? locationId : null;
    const selectedUnit = units.find((unit) => unit.id === unitId);
    const selectedFacility = facilities.find((facility) => facility.id === facilityId);
    if (!title.trim() || !locationId) {
      setErrorMessage(t.addDescAndLocation);
      setSaving(false);
      return;
    }
    const ticketLocation = selectedUnit?.code ?? selectedFacility?.name ?? "";
    if (!ticketLocation) {
      setErrorMessage(t.chooseValidLocation);
      setSaving(false);
      return;
    }
    if (mode === "preview") {
      onCreated({
        id: Math.max(0, ...demoTickets.map((ticket) => ticket.id), Date.now() % 100_000) + 1,
        title: title.trim(),
        description: description.trim() || null,
        location: ticketLocation,
        unit_id: unitId,
        facility_id: facilityId,
        priority,
        status: "open",
        created_by: `preview-${role}`,
        assigned_to: null,
        photo_path: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setSaving(false);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from("tickets").insert({
      title: title.trim(),
      description: description.trim() || null,
      location: ticketLocation,
      unit_id: unitId,
      facility_id: facilityId,
      priority,
    }).select("id, title, description, location, unit_id, facility_id, priority, status, created_by, assigned_to, photo_path, created_at, updated_at").single();
    if (error) {
      setErrorMessage(`${t.requestCouldNotBeSubmitted}: ${error.message}`);
      setSaving(false);
      return;
    }
    onCreated(data);
    setSaving(false);
  }

  const facilityOptions = facilities;
  const showUnits = canChooseUnit && allowedUnits.length > 0;
  const showFacilities = facilityOptions.length > 0;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
        <div className="modal-head">
          <div><h2 id="ticket-modal-title">{t.raiseServiceRequest}</h2><p>{t.tellUsWhatNeedsAttention}</p></div>
          <button className="icon-button" onClick={onClose} aria-label={t.closeDialog}><X size={17} /></button>
        </div>
        <form onSubmit={(event) => void submit(event)}>
          <div className="modal-body">
            {mode === "preview" && <div className="notice notice-warn" style={{ margin: 0 }}>{t.samplePreviewOnly}</div>}
            <div className="form-field"><label htmlFor="ticket-title">{t.whatDoYouNeedHelp}</label><input autoFocus id="ticket-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.egAirConditioning} required maxLength={120} /></div>
            <div className="form-field"><label htmlFor="ticket-description">{t.fewMoreDetails} <span style={{ fontWeight: 400 }}>({t.optional})</span></label><textarea id="ticket-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.addAnyDetail} maxLength={2000} /></div>
            <div className="form-field"><label htmlFor="ticket-location-kind">{t.whereShouldWeLook}</label>
              <select id="ticket-location-kind" value={locationKind} onChange={(event) => { setLocationKind(event.target.value as "unit" | "facility"); setLocationId(""); }}>
                {showUnits && <option value="unit">{t.myUnitOrResidence}</option>}
                {showFacilities && <option value="facility">{t.aSharedFacility}</option>}
              </select>
            </div>
            <div className="form-field"><label htmlFor="ticket-location">{t.location}</label>
              <select id="ticket-location" value={locationId} onChange={(event) => setLocationId(event.target.value)} required>
                <option value="">{t.chooseALocation}</option>
                {locationKind === "unit" ? allowedUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.code}</option>) :
                  facilityOptions.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
              </select>
            </div>
            <div className="form-field"><label htmlFor="ticket-priority">{t.priority}</label>
              <select id="ticket-priority" value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority)}>
                <option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option>
              </select>
            </div>
            {errorMessage && <div className="notice notice-error" style={{ margin: 0 }} role="alert">{errorMessage}</div>}
          </div>
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>{t.cancel}</button><button className="button button-primary" disabled={saving}>{saving ? t.submitting : t.submitRequest} <ArrowRight size={14} /></button></div>
        </form>
      </section>
    </div>
  );
}

export function Workspace(props: WorkspaceProps) {
  const {
    mode,
    initialRole,
    initialView,
    profile,
    dataWarning,
  } = props;
  const { t } = useI18n();
  const roleTitles = getRoleTitles(t);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(initialRole);
  const view = getInitialView(searchParams.get("view") ?? initialView, role);
  const [tickets, setTickets] = useState(props.tickets);
  const [units, setUnits] = useState(props.units);
  const [facilities, setFacilities] = useState(props.facilities);
  const [reservations, setReservations] = useState(props.reservations);
  const [notifications, setNotifications] = useState(props.notifications);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const previewNames: Record<UserRole, string> = {
    guest: "Jamie Taylor",
    resident: "Casey Reed",
    worker: "Sam Rivera",
    management: "Alex Morgan",
    admin: "Taylor Chen",
  };
  const activeProfile = mode === "preview"
    ? { ...profile, full_name: previewNames[role], role, unit_id: role === "resident" ? "unit-2" : null }
    : profile;

  useEffect(() => {
    if (mode !== "live") return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`workspace:${profile.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, (payload) => {
        if (payload.eventType === "DELETE") {
          if (typeof payload.old.id === "number") setTickets((current) => current.filter((ticket) => ticket.id !== payload.old.id));
          return;
        }
        const ticket = payload.new;
        if (!isTicketRecord(ticket)) {
          console.error("Ignoring malformed realtime ticket update.");
          return;
        }
        setTickets((current) => payload.eventType === "INSERT"
          ? [ticket, ...current.filter((item) => item.id !== ticket.id)]
          : current.map((item) => item.id === ticket.id ? ticket : item));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "facilities" }, (payload) => {
        if (payload.eventType === "DELETE") {
          if (typeof payload.old.id === "string") setFacilities((current) => current.filter((facility) => facility.id !== payload.old.id));
          return;
        }
        const facility = payload.new;
        if (!isFacilityRecord(facility)) {
          console.error("Ignoring malformed realtime facility update.");
          return;
        }
        setFacilities((current) => payload.eventType === "INSERT"
          ? [...current.filter((item) => item.id !== facility.id), facility]
          : current.map((item) => item.id === facility.id ? facility : item));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${profile.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          if (typeof payload.old.id === "number") setNotifications((current) => current.filter((notification) => notification.id !== payload.old.id));
          return;
        }
        const notification = payload.new;
        if (!isNotificationRecord(notification) || notification.user_id !== profile.id) {
          console.error("Ignoring malformed or out-of-scope realtime notification.");
          return;
        }
        setNotifications((current) => payload.eventType === "INSERT"
          ? [notification, ...current.filter((item) => item.id !== notification.id)]
          : current.map((item) => item.id === notification.id ? notification : item));
      })
      .subscribe((status, error) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Workspace realtime subscription failed:", error?.message ?? status);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mode, profile.id, router]);

  const visibleTickets = useMemo(() => {
    if (role === "worker") return tickets.filter((ticket) => ticket.assigned_to === profile.id || mode === "preview" && ticket.assigned_to);
    if (role === "guest" || role === "resident") return tickets.filter((ticket) => ticket.created_by === profile.id || mode === "preview");
    return tickets;
  }, [tickets, role, profile.id, mode]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function changeRole(nextRole: UserRole) {
    setRole(nextRole);
    const nextView = getDefaultView(nextRole);
    router.replace(`/?view=${nextView}`);
  }

  function updateVisibleTickets(changedTickets: ResortTicket[]) {
    setTickets((current) => current.map((ticket) => changedTickets.find((changed) => changed.id === ticket.id) ?? ticket));
  }

  function ticketCreated(ticket: ResortTicket) {
    setTickets((current) => [ticket, ...current]);
    setShowTicketModal(false);
    router.refresh();
  }

  function pageContent() {
    if (view === "overview") {
      return <OverviewView role={role} tickets={visibleTickets} units={units} facilities={facilities} reservations={reservations} onCreateTicket={() => setShowTicketModal(true)} />;
    }
    if (view === "tickets" || view === "tasks") {
      return (
        <>
          <PageHeading
            eyebrow={view === "tasks" ? t.yourShift : t.serviceDesk.toUpperCase()}
            title={view === "tasks" ? t.myTasks : role === "guest" || role === "resident" ? t.myRequests : t.serviceDesk}
            detail={view === "tasks" ? t.tasksInQueue : t.aLittleUpdate}
            action={<button className="button button-primary" onClick={() => setShowTicketModal(true)}><Plus size={14} /> {t.newRequest}</button>}
          />
          <TicketsView tickets={view === "tasks" ? visibleTickets.filter((ticket) => ticket.status !== "done") : visibleTickets} role={role} units={units} facilities={facilities} stays={props.stays} mode={mode} onCreate={() => setShowTicketModal(true)} onTicketsChange={updateVisibleTickets} teamMembers={props.teamMembers} />
        </>
      );
    }
    if (view === "units") {
      return <><PageHeading eyebrow={t.resortOperations} title={t.unitRegistry} detail={t.sampleUnits} /><UnitsView units={units} mode={mode} onUnitsChange={setUnits} /></>;
    }
    if (view === "facilities") {
      return <><PageHeading eyebrow={t.onSiteOperations} title={role === "worker" ? t.facilityChecks : t.facilities} detail={t.openAndReady} /><FacilitiesView facilities={facilities} role={role} mode={mode} onFacilitiesChange={setFacilities} /></>;
    }
    if (view === "bookings") {
      return <><PageHeading eyebrow={t.makeTimeForYourself} title={t.amenityBookings} detail={t.chooseATime} /><BookingsView amenities={props.amenities} reservations={reservations} role={role} mode={mode} onReservationsChange={setReservations} /></>;
    }
    if (view === "notifications") {
      return <><PageHeading eyebrow={t.stayInTheLoop} title={t.notifications} detail={t.clearView} /><NotificationsView notifications={notifications} mode={mode} onNotificationsChange={setNotifications} /></>;
    }
    if (view === "activity") {
      return <><PageHeading eyebrow={t.administration} title={t.auditActivity} detail={t.adminViewChanges} /><ActivityView auditEvents={props.auditEvents} /></>;
    }
    return <EmptyState text={t.viewNotAvailable} />;
  }

  return (
    <>
      <WorkspaceShell mode={mode} role={role} profile={activeProfile} currentView={view} unreadCount={unreadCount}>
        {mode === "preview" && (
          <div className="preview-banner">
            <Sparkles size={14} aria-hidden="true" />
            <span><strong>{t.interactivePreview}</strong> · {t.previewBannerDetail}</span>
            <label className="sr-only" htmlFor="preview-role">{t.preview}</label>
            <select id="preview-role" className="filter-select" value={role} onChange={(event) => changeRole(event.target.value as UserRole)}>
              {Object.entries(roleTitles).map(([value, label]) => <option key={value} value={value}>{label} {t.previewSuffix}</option>)}
            </select>
          </div>
        )}
        {dataWarning && <div className="notice notice-error" role="alert">{dataWarning}</div>}
        {pageContent()}
      </WorkspaceShell>
      {showTicketModal && <TicketModal role={role} mode={mode} profileUnitId={activeProfile.unit_id} units={units} facilities={facilities} stays={props.stays} onClose={() => setShowTicketModal(false)} onCreated={ticketCreated} />}
    </>
  );
}
