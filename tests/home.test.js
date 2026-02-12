"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var selenium_webdriver_1 = require("selenium-webdriver");
var setup_1 = require("./setup");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var driver, dialogBtn, frameworkInput, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, setup_1.createDriver)()];
            case 1:
                driver = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 17, 18, 20]);
                return [4 /*yield*/, driver.get("https://humble-carnival-qx9q74rpv7xfx7g7-3000.app.github.dev")];
            case 3:
                _a.sent();
                // Wait for hydration
                return [4 /*yield*/, driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('[data-testid="name-input"]')), 10000)];
            case 4:
                // Wait for hydration
                _a.sent();
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('[data-testid="show-dialog-btn"]'))];
            case 5:
                dialogBtn = _a.sent();
                return [4 /*yield*/, dialogBtn.click()];
            case 6:
                _a.sent();
                return [4 /*yield*/, driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.css('[data-testid="dialog-allow"]')), 5000)];
            case 7:
                _a.sent();
                console.log("✅ Dialog opened successfully");
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('[data-testid="dialog-cancel"]')).click()];
            case 8:
                _a.sent();
                /*
                  -------- TEST 2: Fill Form --------
                */
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('[data-testid="name-input"]')).sendKeys("John Doe")];
            case 9:
                /*
                  -------- TEST 2: Fill Form --------
                */
                _a.sent();
                // Open Role select (Radix select)
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('[data-testid="role-select"]')).click()];
            case 10:
                // Open Role select (Radix select)
                _a.sent();
                // Wait for dropdown item (portal content)
                return [4 /*yield*/, driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath("//*[text()='Developer']")), 5000)];
            case 11:
                // Wait for dropdown item (portal content)
                _a.sent();
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.xpath("//*[text()='Developer']")).click()];
            case 12:
                _a.sent();
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.css('[data-testid="framework-input"]'))];
            case 13:
                frameworkInput = _a.sent();
                return [4 /*yield*/, frameworkInput.sendKeys("Next.js")];
            case 14:
                _a.sent();
                return [4 /*yield*/, driver.wait(selenium_webdriver_1.until.elementLocated(selenium_webdriver_1.By.xpath("//*[text()='Next.js']")), 5000)];
            case 15:
                _a.sent();
                return [4 /*yield*/, driver.findElement(selenium_webdriver_1.By.xpath("//*[text()='Next.js']")).click()];
            case 16:
                _a.sent();
                console.log("✅ Form filled successfully");
                return [3 /*break*/, 20];
            case 17:
                err_1 = _a.sent();
                console.error("❌ Test Failed:", err_1);
                return [3 /*break*/, 20];
            case 18: return [4 /*yield*/, driver.quit()];
            case 19:
                _a.sent();
                return [7 /*endfinally*/];
            case 20: return [2 /*return*/];
        }
    });
}); })();
