import { By, until } from "selenium-webdriver";
import { createDriver } from "./setup";

(async () => {
  const driver = await createDriver();

  try {
    await driver.get("https://humble-carnival-qx9q74rpv7xfx7g7-3000.app.github.dev");

    // Wait for hydration
    await driver.wait(
      until.elementLocated(By.css('[data-testid="name-input"]')),
      10000
    );

    /*
      -------- TEST 1: Open Dialog --------
    */

    const dialogBtn = await driver.findElement(
      By.css('[data-testid="show-dialog-btn"]')
    );

    await dialogBtn.click();

    await driver.wait(
      until.elementLocated(By.css('[data-testid="dialog-allow"]')),
      5000
    );

    console.log("✅ Dialog opened successfully");

    await driver.findElement(
      By.css('[data-testid="dialog-cancel"]')
    ).click();


    /*
      -------- TEST 2: Fill Form --------
    */

    await driver.findElement(
      By.css('[data-testid="name-input"]')
    ).sendKeys("John Doe");

    // Open Role select (Radix select)
    await driver.findElement(
      By.css('[data-testid="role-select"]')
    ).click();

    // Wait for dropdown item (portal content)
    await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Developer']")),
      5000
    );

    await driver.findElement(
      By.xpath("//*[text()='Developer']")
    ).click();

    // Combobox
    const frameworkInput = await driver.findElement(
      By.css('[data-testid="framework-input"]')
    );

    await frameworkInput.sendKeys("Next.js");

    await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Next.js']")),
      5000
    );

    await driver.findElement(
      By.xpath("//*[text()='Next.js']")
    ).click();

    console.log("✅ Form filled successfully");

  } catch (err) {
    console.error("❌ Test Failed:", err);
  } finally {
    await driver.quit();
  }
})();
