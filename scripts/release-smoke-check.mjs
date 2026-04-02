const baseUrlRaw = process.env.BASE_URL || "http://localhost:3000";
const baseUrl = baseUrlRaw.replace(/\/$/, "");

const checks = [
  { path: "/api/health", expectedStatus: 200, label: "health" },
  { path: "/", expectedStatus: 200, label: "homepage" },
  { path: "/api/auth/session", expectedStatus: 200, label: "auth-session" },
];

async function request(path, expectedStatus) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { redirect: "manual" });

  if (response.status !== expectedStatus) {
    throw new Error(`${url} returned ${response.status}; expected ${expectedStatus}`);
  }

  return response;
}

async function run() {
  console.log(`Running smoke checks against ${baseUrl}`);

  for (const check of checks) {
    const response = await request(check.path, check.expectedStatus);

    if (check.path === "/api/health") {
      const payload = await response.json();
      if (payload?.status !== "ok") {
        throw new Error(`Health payload did not report status=ok: ${JSON.stringify(payload)}`);
      }
    }

    console.log(`PASS ${check.label}: ${check.path} (${response.status})`);
  }

  console.log("Smoke checks completed successfully.");
}

run().catch((error) => {
  console.error("Smoke check failed.");
  console.error(error);
  process.exitCode = 1;
});
