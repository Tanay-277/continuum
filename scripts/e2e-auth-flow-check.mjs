const baseUrl = process.env.BASE_URL || "http://localhost:3000";

const cookieJar = new Map();

function readSetCookies(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const raw = headers.get("set-cookie");
  if (!raw) return [];

  // Best-effort split for combined set-cookie header values.
  return raw.split(/,(?=[^;]+=[^;]+)/g);
}

function mergeSetCookies(headers) {
  const setCookies = readSetCookies(headers);
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(";");
    const eq = nameValue.indexOf("=");
    if (eq <= 0) continue;
    const name = nameValue.slice(0, eq).trim();
    const value = nameValue.slice(eq + 1).trim();
    cookieJar.set(name, value);
  }
}

function cookieHeader() {
  return Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function main() {
  const suffix = Date.now();
  const email = `e2e_${suffix}@example.com`;
  const password = "Password123!";
  const name = `E2E User ${suffix}`;

  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  mergeSetCookies(csrfRes.headers);
  const csrfJson = await csrfRes.json();

  if (!csrfJson?.csrfToken) {
    throw new Error("No CSRF token returned from /api/auth/csrf");
  }

  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: cookieHeader(),
    },
    body: JSON.stringify({ name, email, password }),
  });

  const signInBody = new URLSearchParams({
    csrfToken: csrfJson.csrfToken,
    email,
    password,
    callbackUrl: `${baseUrl}/`,
    json: "true",
  });

  const signInRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(),
    },
    body: signInBody,
  });
  mergeSetCookies(signInRes.headers);

  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: {
      cookie: cookieHeader(),
    },
  });

  const sessionJson = await sessionRes.json();

  const libraryRes = await fetch(`${baseUrl}/api/library`, {
    headers: {
      cookie: cookieHeader(),
    },
  });

  const statsRes = await fetch(`${baseUrl}/api/library/stats`, {
    headers: {
      cookie: cookieHeader(),
    },
  });

  const result = {
    email,
    registerStatus: registerRes.status,
    signInStatus: signInRes.status,
    sessionStatus: sessionRes.status,
    sessionUserId: sessionJson?.user?.id || null,
    libraryStatus: libraryRes.status,
    libraryStatsStatus: statsRes.status,
    cookies: Array.from(cookieJar.keys()),
  };

  console.log(JSON.stringify(result, null, 2));

  if (registerRes.status !== 201) {
    throw new Error(`Expected registerStatus 201, got ${registerRes.status}`);
  }

  if (![200, 302].includes(signInRes.status)) {
    throw new Error(`Expected signInStatus 200/302, got ${signInRes.status}`);
  }

  if (sessionRes.status !== 200 || !sessionJson?.user?.id) {
    throw new Error("Session is not established correctly");
  }

  if (libraryRes.status !== 200 || statsRes.status !== 200) {
    throw new Error("Protected library API routes are not authorized for signed-in user");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
