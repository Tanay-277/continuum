const [, , url, timeoutSecondsArg = "120", intervalSecondsArg = "2"] = process.argv;

if (!url) {
  console.error("Usage: node scripts/wait-for-url.mjs <url> [timeoutSeconds] [intervalSeconds]");
  process.exit(1);
}

const timeoutSeconds = Number(timeoutSecondsArg);
const intervalSeconds = Number(intervalSecondsArg);

if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
  console.error(`Invalid timeoutSeconds: ${timeoutSecondsArg}`);
  process.exit(1);
}

if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
  console.error(`Invalid intervalSeconds: ${intervalSecondsArg}`);
  process.exit(1);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const deadline = Date.now() + timeoutSeconds * 1000;
let lastError = "no response";

while (Date.now() < deadline) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    lastError = `status ${response.status}`;

    if (response.ok) {
      console.log(`Ready: ${url} (${response.status})`);
      process.exit(0);
    }
  } catch (error) {
    lastError = error instanceof Error ? error.message : "network error";
  }

  await wait(intervalSeconds * 1000);
}

console.error(`Timed out waiting for ${url}. Last response: ${lastError}`);
process.exit(1);
