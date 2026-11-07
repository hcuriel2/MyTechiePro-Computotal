/*
 * Tests for the commission bracket calculation (utils/commission.ts).
 *
 * Run from the Backend folder with:  npm run test:commission
 *
 * These only test the calculation itself. They don't connect to MongoDB,
 * Stripe or anything else, so they're safe to run any time.
 */

import * as assert from "assert";
import {
    calculatePlatformFee,
    validateBrackets,
    DEFAULT_COMMISSION_BRACKETS,
    CommissionBracket,
} from "./commission";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
    try {
        fn();
        passed++;
        console.log(`PASS  ${name}`);
    } catch (error) {
        failed++;
        console.log(`FAIL  ${name}`);
        console.log(`      ${(error as Error).message}`);
    }
}

function expectFee(amount: number, expectedRate: number, expectedFee: number): void {
    const result = calculatePlatformFee(amount);
    assert.strictEqual(result.rate, expectedRate, `rate for $${amount}`);
    assert.strictEqual(result.fee, expectedFee, `fee for $${amount}`);
}

console.log("=== COMMISSION BRACKET TESTS ===\n");

// --- Default brackets (sponsor's example) ---
test("$800 is charged 15% ($120.00)", () => expectFee(800, 15, 120));
test("$999.99 is still in the 15% bracket ($150.00)", () => expectFee(999.99, 15, 150));
test("exactly $1,000 moves to the 10% bracket ($100.00)", () => expectFee(1000, 10, 100));
test("$4,000 is charged 10% ($400.00)", () => expectFee(4000, 10, 400));
test("exactly $5,000 moves to the 5% bracket ($250.00)", () => expectFee(5000, 5, 250));
test("$9,999.99 is charged 5% ($500.00)", () => expectFee(9999.99, 5, 500));
test("$10,000 and above uses the last bracket ($500.00)", () => expectFee(10000, 5, 500));
test("$25,000 is charged 5% ($1,250.00)", () => expectFee(25000, 5, 1250));
test("$0 gives a $0 fee", () => expectFee(0, 15, 0));
test("fee is rounded to the nearest cent ($123.45 -> $18.52)", () => expectFee(123.45, 15, 18.52));

// --- Custom brackets (what an admin might set later) ---
test("custom brackets are used when passed in", () => {
    const custom: CommissionBracket[] = [
        { upTo: 500, rate: 20 },
        { upTo: null, rate: 8 },
    ];
    assert.deepStrictEqual(calculatePlatformFee(400, custom), { rate: 20, fee: 80 });
    assert.deepStrictEqual(calculatePlatformFee(600, custom), { rate: 8, fee: 48 });
});

test("a single open-ended bracket charges one rate for everything", () => {
    const flat: CommissionBracket[] = [{ upTo: null, rate: 12 }];
    assert.deepStrictEqual(calculatePlatformFee(2500, flat), { rate: 12, fee: 300 });
});

// --- Invalid amounts ---
test("negative amounts are rejected", () => {
    assert.throws(() => calculatePlatformFee(-1));
});
test("NaN is rejected", () => {
    assert.throws(() => calculatePlatformFee(NaN));
});

// --- Bracket validation ---
test("the default brackets are valid", () => {
    assert.deepStrictEqual(validateBrackets(DEFAULT_COMMISSION_BRACKETS), []);
});
test("an empty bracket list is invalid", () => {
    assert.strictEqual(validateBrackets([]).length, 1);
});
test("the last bracket must have no upper limit", () => {
    const errors = validateBrackets([{ upTo: 1000, rate: 10 }]);
    assert.ok(errors.length > 0);
});
test("only the last bracket can have no upper limit", () => {
    const errors = validateBrackets([
        { upTo: null, rate: 10 },
        { upTo: null, rate: 5 },
    ]);
    assert.ok(errors.length > 0);
});
test("upper limits must go up", () => {
    const errors = validateBrackets([
        { upTo: 5000, rate: 10 },
        { upTo: 1000, rate: 15 },
        { upTo: null, rate: 5 },
    ]);
    assert.ok(errors.length > 0);
});
test("rates above 100% are invalid", () => {
    const errors = validateBrackets([{ upTo: null, rate: 150 }]);
    assert.ok(errors.length > 0);
});
test("calculatePlatformFee refuses invalid brackets", () => {
    assert.throws(() => calculatePlatformFee(100, [{ upTo: 1000, rate: 10 }]));
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
    process.exit(1);
}
