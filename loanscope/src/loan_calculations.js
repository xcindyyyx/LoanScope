// Convert annual interest rate to monthly interest rate
export function calc_monthly_rate(annual_rate) {
    return (annual_rate / 100) / 12;
}

// Calculate the interest for one month
export function calc_monthly_interest(balance, monthly_rate) {
    return balance * monthly_rate;
}

// Calculate the full loan
export function calc_loan(principal, annual_rate, monthly_payment) {

    // Convert annual rate to monthly rate
    const monthly_rate = calc_monthly_rate(annual_rate);

    // Convert currency values to integer cents
    let balance_cents = Math.round(principal * 100);
    const monthly_payment_cents = Math.round(monthly_payment * 100);

    let total_interest_cents = 0;
    let total_principal_cents = 0;
    let month = 0;
    let schedule = [];

    // Calculate the interest for the first month in cents
    const starting_interest_cents = Math.round(
        balance_cents * monthly_rate
    );

    // Check if the payment is too low
    if (monthly_payment_cents <= starting_interest_cents) {
        return {
            error: "Monthly payment is too low. This loan would never be paid off."
        };
    }

    // Keep calculating until the loan is paid off
    // Stop after 1200 months (100 years)
    while (balance_cents > 0 && month < 1200) {

        // Calculate this month's interest in cents
        const monthly_interest_cents = Math.round(
            balance_cents * monthly_rate
        );

        // Prevent the final payment from being larger than necessary
        const payment_cents = Math.min(
            monthly_payment_cents,
            balance_cents + monthly_interest_cents
        );

        // Find how much of the payment goes toward principal
        const principal_paid_cents =
            payment_cents - monthly_interest_cents;

        // Reduce the loan balance
        balance_cents -= principal_paid_cents;

        // Keep track of cumulative interest
        total_interest_cents += monthly_interest_cents;

        // Keep track of cumulative principal
        total_principal_cents += principal_paid_cents;

        month++;

        // Save this month's information
        // Convert cents back into dollars for the rest of the app
        schedule.push({
            month: month,
            payment: payment_cents / 100,
            principal: principal_paid_cents / 100,
            interest: monthly_interest_cents / 100,
            cumulative_principal: total_principal_cents / 100,
            cumulative_interest: total_interest_cents / 100,
            balance: balance_cents / 100
        });
    }
        // Check if the loan would take longer than 100 years
        if (balance_cents > 0) {
            return {
                error: "Loan payoff exceeds 100 years."
            };
        }

    // Send the results back
    return {
        months: month,
        total_interest: total_interest_cents / 100,
        schedule: schedule
    };
}