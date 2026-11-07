/*
 * Commission brackets (DevLink 2026)
 *
 * Works out the platform's commission on a project based on the project total.
 * This replaces the old hardcoded platform fee of 8.5 in project.controller.ts.
 *
 * How the brackets work:
 *  - Each bracket has an upper limit (`upTo`, in dollars) and a commission
 *    rate (`rate`, as a percentage, e.g. 15 = 15%).
 *  - A project falls into the first bracket where its total is LESS THAN
 *    `upTo`. This matches the sponsor's example ("< $1,000 commission is 15%").
 *  - The last bracket must have `upTo: null`, meaning "everything above the
 *    previous limit". This way every amount always lands in a bracket.
 *  - The rate applies to the whole project total (a flat rate per bracket),
 *    not just the part of the total inside each bracket.
 *
 * Still to confirm with Hector:
 *  - The rate for projects of $10,000 and above (5% is assumed for now).
 *  - That a flat rate per bracket is what he wants, rather than a marginal
 *    (tax-bracket style) calculation.
 *
 * Brackets are kept in code for now. The next step is storing them in the
 * database so admins can edit them from AdminFront.
 */

export interface CommissionBracket {
    /** Upper limit in dollars (exclusive). null = no upper limit (last bracket only). */
    upTo: number | null;
    /** Commission rate as a percentage, from 0 to 100. */
    rate: number;
}

export interface CommissionResult {
    /** The rate that was applied, as a percentage. */
    rate: number;
    /** The commission amount in dollars, rounded to the nearest cent. */
    fee: number;
}

// The sponsor's example brackets. The last one is an assumption (see above).
export const DEFAULT_COMMISSION_BRACKETS: CommissionBracket[] = [
    { upTo: 1000, rate: 15 },
    { upTo: 5000, rate: 10 },
    { upTo: 10000, rate: 5 },
    { upTo: null, rate: 5 },
];

/**
 * Checks that a list of brackets is usable. Returns a list of problems,
 * or an empty list if the brackets are valid.
 *
 * This will also be used to check brackets an admin submits once they can
 * be edited, so it explains each problem instead of just failing.
 */
export function validateBrackets(brackets: CommissionBracket[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(brackets) || brackets.length === 0) {
        return ["At least one commission bracket is required."];
    }

    let previousLimit = 0;

    brackets.forEach((bracket, index) => {
        const position = `Bracket ${index + 1}`;
        const isLast = index === brackets.length - 1;

        if (typeof bracket.rate !== "number" || !isFinite(bracket.rate)
            || bracket.rate < 0 || bracket.rate > 100) {
            errors.push(`${position}: rate must be a number between 0 and 100.`);
        }

        if (bracket.upTo === null) {
            if (!isLast) {
                errors.push(`${position}: only the last bracket can have no upper limit.`);
            }
            return;
        }

        if (isLast) {
            errors.push(`${position}: the last bracket must have no upper limit so every amount is covered.`);
        }

        if (typeof bracket.upTo !== "number" || !isFinite(bracket.upTo) || bracket.upTo <= 0) {
            errors.push(`${position}: upper limit must be a positive number.`);
        } else if (bracket.upTo <= previousLimit) {
            errors.push(`${position}: upper limit must be higher than the previous bracket's.`);
        } else {
            previousLimit = bracket.upTo;
        }
    });

    return errors;
}

/**
 * Calculates the platform commission for a project total.
 * Throws if the amount is invalid or the brackets fail validation.
 */
export function calculatePlatformFee(
    amount: number,
    brackets: CommissionBracket[] = DEFAULT_COMMISSION_BRACKETS
): CommissionResult {
    if (typeof amount !== "number" || !isFinite(amount) || amount < 0) {
        throw new Error("Project amount must be a non-negative number.");
    }

    const errors = validateBrackets(brackets);
    if (errors.length > 0) {
        throw new Error(`Invalid commission brackets: ${errors.join(" ")}`);
    }

    const bracket = brackets.find(
        (b) => b.upTo === null || amount < b.upTo
    ) as CommissionBracket;

    // amount * rate gives the fee in cents (amount * rate / 100 * 100),
    // so rounding it once avoids most floating-point rounding surprises.
    const fee = Math.round(amount * bracket.rate) / 100;

    return { rate: bracket.rate, fee };
}
