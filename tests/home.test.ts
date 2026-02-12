import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");


  return await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
}

(async () => {
  const driver = await createDriver();

  try {
    // Go to your Next.js app
    await driver.get("http://localhost:3000/");

    // --- WAIT FOR HYDRATION ---
    await driver.wait(
      until.elementLocated(By.css('[data-testid="name-input"]')),
      10000,
    );

    /*
      -------- TEST 1: Open Dialog --------
    */
    const dialogBtn = await driver.findElement(
      By.css('[data-testid="show-dialog-btn"]'),
    );
    await dialogBtn.click();

    const dialogAllow = await driver.wait(
      until.elementLocated(By.css('[data-testid="dialog-allow"]')),
      5000,
    );
    console.log("✅ Dialog opened successfully");

    // Close dialog
    await driver.findElement(By.css('[data-testid="dialog-cancel"]')).click();

    /*
      -------- TEST 2: Fill Form --------
    */
    // Fill name
    await driver
      .findElement(By.css('[data-testid="name-input"]'))
      .sendKeys("John Doe");

    // Open role select
    const roleTrigger = await driver.findElement(
      By.css('[data-testid="role-trigger"]'),
    );
    await roleTrigger.click();

    // Select "Developer" (dropdown renders in portal; use text or data-testid)
    const developerOption = await driver.wait(
      until.elementLocated(
        By.xpath("//*[@role='option' and contains(., 'Developer')]")
      ),
      10000,
    );
    await developerOption.click();

    // Fill framework combobox
    const frameworkInput = await driver.findElement(
      By.css('[data-testid="framework-input"]'),
    );
    await frameworkInput.sendKeys("Next.js");

    const nextjsOption = await driver.wait(
      until.elementLocated(By.css('[data-testid="framework-option-Next.js"]')),
      10000,
    );
    await nextjsOption.click();

    // Optional: submit the form
    const submitBtn = await driver.findElement(
      By.css('[data-testid="submit-btn"]'),
    );
    await submitBtn.click();

    console.log("✅ Form filled successfully");
  } catch (err) {
    console.error("❌ Test Failed:", err);
  } finally {
    await driver.quit();
  }
})();
