import { describe, test, expect } from "vitest";

import {
    calc_monthly_rate,
    calc_monthly_interest,
    calc_loan
} from "./loan_calculations";


// Test monthly interest rate calculation
describe("calc_monthly_rate", () => {

    test("converts annual interest rate to monthly interest rate", () => {

        const result = calc_monthly_rate(6);

        expect(result).toBeCloseTo(0.005);
    });

});

// Test monthly interest calculation
describe("calc_monthly_interest", () => {

    test("calculates monthly interest from balance and monthly rate", () => {

        const result = calc_monthly_interest(10000, 0.005);

        expect(result).toBeCloseTo(50);
    });

});

// Test full loan calculation
describe("calc_loan", () => {

    test("calculates a valid loan payoff", () => {

        const result = calc_loan(10000, 6, 500);

        expect(result.error).toBeUndefined();
        expect(result.months).toBeGreaterThan(0);
        expect(result.total_interest).toBeGreaterThan(0);
        expect(result.schedule.length).toBe(result.months);
    });

    // Test a monthly payment that is too low
    test("rejects a monthly payment that is too low", () => {

        const result = calc_loan(10000, 12, 100);

        expect(result.error).toBe(
            "Monthly payment is too low. This loan would never be paid off."
        );

    });

    // Test the 100 year loan limit
    test("rejects a loan that takes longer than 100 years", () => {

        const result = calc_loan(10000, 1, 10);

        expect(result.error).toBe(
            "Loan payoff exceeds 100 years."
        );

    });

    // Test that the final loan balance reaches zero
    test("ends with a zero balance", () => {

        const result = calc_loan(10000, 6, 500);

        const final_month = result.schedule[result.schedule.length - 1];

        expect(final_month.balance).toBe(0);

    });

    // Test cumulative principal and interest
    test("tracks cumulative principal and interest", () => {

        const result = calc_loan(10000, 6, 500);

        const final_month = result.schedule[result.schedule.length - 1];

        expect(final_month.cumulative_principal).toBeCloseTo(10000);
        expect(final_month.cumulative_interest).toBeCloseTo(
            result.total_interest
        );

    });

});