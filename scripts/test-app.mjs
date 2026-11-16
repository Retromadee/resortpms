// scripts/test-app.mjs
// Automated test suite for The Resort Platform

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function testEndpoint(name, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { redirect: "manual", ...options });
  return res;
}

async function run() {
  console.log(`\n🧪 Running test suite against ${BASE_URL}...\n`);

  // 1. Unauthenticated / redirects to /login
  console.log("1. Authentication & Route Protection");
  {
    const res = await testEndpoint("Root redirect", "/");
    assert(res.status === 307 || res.status === 302, "Unauthenticated / redirects");
    const loc = res.headers.get("location");
    assert(loc?.includes("/login"), `Redirect location is /login (got ${loc})`);
  }

  // 2. Login Page
  console.log("\n2. Login Page");
  {
    const res = await testEndpoint("Login page", "/login");
    assert(res.status === 200, "GET /login returns 200 OK");
    const html = await res.text();
    assert(html.includes("The Resort"), "Brand name present");
    assert(html.includes("1-TAP DEMO SIGN-IN"), "1-Tap Demo sign-in section present");
    assert(html.includes("Taylor Chen"), "Admin demo role present");
    assert(html.includes("Alex Morgan"), "Management demo role present");
    assert(html.includes("Sam Rivera"), "Worker demo role present");
    assert(html.includes("Casey Reed"), "Resident demo role present");
    assert(html.includes("Jordan Lee"), "Guest demo role present");
  }

  // 3. Signup Mode
  console.log("\n3. Signup Mode");
  {
    const res = await testEndpoint("Signup page", "/login?mode=signup");
    assert(res.status === 200, "GET /login?mode=signup returns 200 OK");
    const html = await res.text();
    assert(html.includes("Full name") || html.includes("fullName"), "Full name field present");
  }

  // 4. Turkish Localization (Login & Workspace)
  console.log("\n4. Localization (EN & TR)");
  {
    const resTr = await testEndpoint("Login TR", "/login", {
      headers: { Cookie: "resort_lang=tr" },
    });
    const htmlTr = await resTr.text();
    assert(htmlTr.includes("1-DOKUNUŞ DEMO GİRİŞİ"), "Turkish login title rendered");
    assert(htmlTr.includes("Çalışma alanınıza giriş yapın"), "Turkish sign-in heading rendered");

    const resEn = await testEndpoint("Login EN", "/login", {
      headers: { Cookie: "resort_lang=en" },
    });
    const htmlEn = await resEn.text();
    assert(htmlEn.includes("1-TAP DEMO SIGN-IN"), "English login title rendered");
  }

  // 5. Test All 5 Roles in Workspace
  console.log("\n5. Role Workspaces");
  const roles = [
    { role: "guest", greeting: "Welcome to The Resort", trGreeting: "The Resort'a Hoş Geldiniz" },
    { role: "resident", greeting: "Good to see you, neighbour", trGreeting: "Hoş geldiniz, komşu" },
    { role: "worker", greeting: "Here's your shift at a glance", trGreeting: "İşte vardiya özetiniz" },
    { role: "management", greeting: "Resort operations, live", trGreeting: "Tesis işletmeleri, canlı" },
    { role: "admin", greeting: "System overview", trGreeting: "Sistem genel bakışı" },
  ];

  for (const { role, greeting, trGreeting } of roles) {
    const res = await testEndpoint(`Workspace: ${role}`, "/", {
      headers: { Cookie: `resort_demo_role=${role}; resort_lang=en` },
    });
    assert(res.status === 200, `Workspace for '${role}' loads with 200 OK`);
    const html = await res.text();
    assert(html.includes(greeting) || html.includes(role), `Workspace '${role}' contains greeting or role`);

    // Also test TR
    const resTr = await testEndpoint(`Workspace TR: ${role}`, "/", {
      headers: { Cookie: `resort_demo_role=${role}; resort_lang=tr` },
    });
    const htmlTr = await resTr.text();
    assert(htmlTr.includes(trGreeting) || htmlTr.includes("Önizleme"), `Workspace '${role}' in TR contains Turkish text`);
  }

  // 6. Test Views
  console.log("\n6. Feature Views");
  const views = [
    { view: "tickets", text: "Priority" },
    { view: "units", text: "Unit" },
    { view: "facilities", text: "Facilities" },
    { view: "bookings", text: "Amenity" },
    { view: "notifications", text: "Recent updates" },
    { view: "activity", text: "Audit activity" },
  ];

  for (const { view, text } of views) {
    const res = await testEndpoint(`View: ${view}`, `/?view=${view}`, {
      headers: { Cookie: "resort_demo_role=admin; resort_lang=en" },
    });
    assert(res.status === 200, `GET /?view=${view} returns 200 OK`);
    const html = await res.text();
    assert(html.includes(text), `View '${view}' contains '${text}'`);
  }

  // 7. Logout Route
  console.log("\n7. Logout Route");
  {
    const res = await testEndpoint("Logout", "/logout", { method: "POST" });
    assert(res.status === 307 || res.status === 302 || res.status === 303, "POST /logout redirects");
    const loc = res.headers.get("location");
    assert(loc?.includes("/login"), `Redirects to /login (got ${loc})`);
    const setCookie = res.headers.get("set-cookie") || "";
    assert(setCookie.includes("resort_demo_role=;"), "Clears demo role cookie");
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
