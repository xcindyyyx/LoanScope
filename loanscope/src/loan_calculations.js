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

    let balance = principal;
    let total_interest = 0;
    let month = 0;
    let schedule = [];

    // Calculate the interest for the first month
    const starting_interest =
        calc_monthly_interest(principal, monthly_rate);

    // Check if the payment is too low
    if (monthly_payment <= starting_interest) {
        return {
            error: "Monthly payment is too low. This loan would never be paid off."
        };
    }

    // Keep calculating until the loan is paid off
    // Stop after 1200 months (100 years)
    while (balance > 0 && month < 1200) {

        const monthly_interest =
            calc_monthly_interest(balance, monthly_rate);

        // Prevent the final payment from being larger than necessary
        const payment = Math.min(
            monthly_payment,
            balance + monthly_interest
        );

        // Find how much of the payment goes toward principal
        const principal_paid =
            payment - monthly_interest;

        // Reduce the loan balance
        balance -= principal_paid;

        // Keep track of total interest
        total_interest += monthly_interest;

        month++;

        // Prevent extremely tiny leftover balances
        if (balance < 0.01) {
            balance = 0;
        }

        // Save this month's information
        schedule.push({
            month: month,
            payment: payment,
            principal: principal_paid,
            interest: monthly_interest,
            balance: balance
        });
    }

    // Send the results back
    return {
        months: month,
        total_interest: total_interest,
        schedule: schedule
    };
}