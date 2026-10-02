import {
  calc_loan, 
  calc_monthly_rate, 
  calc_monthly_interest
} from "./loan_calculations";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {useState, useEffect} from "react";
import './App.css';

// Displays the month, remaining balance, and cumulative interest on hover
function CustomTooltip({ active, payload, label }) {

  if (active && payload && payload.length) {

    const data = payload[0].payload;

    return (
      <div className="custom-tooltip">
        <p>Month: {label}</p>
        <p>Remaining Balance: ${data.balance.toFixed(2)}</p>
        <p>
          Cumulative Interest: ${data.cumulative_interest.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
}

// Default loan values used when URL parameters are missing or invalid
const DEFAULT_PRINCIPAL = 25000;
const DEFAULT_INTEREST_RATE = 6.5;
const DEFAULT_MONTHLY_PAYMENT = 500;

// Read loan values from the URL
function getURLParameters() {

  const params = new URLSearchParams(window.location.search);

  const principalParam = params.get("principal");
  const rateParam = params.get("rate");
  const paymentParam = params.get("payment");

  const principal = principalParam === null
    ? NaN
    : Number(principalParam);

  const interestRate = rateParam === null
    ? NaN
    : Number(rateParam);

  const monthlyPayment = paymentParam === null
    ? NaN
    : Number(paymentParam);

  // Validate URL values and use safe defaults if they are invalid
  const validPrincipal =
    principal >= 1 && principal <= 100000000
      ? principal
      : DEFAULT_PRINCIPAL;

  const validInterestRate =
    interestRate >= 0 && interestRate <= 40
      ? interestRate
      : DEFAULT_INTEREST_RATE;

  const validMonthlyPayment =
    monthlyPayment >= 1
      ? monthlyPayment
      : DEFAULT_MONTHLY_PAYMENT;

  return {
    principal: validPrincipal,
    interestRate: validInterestRate,
    monthlyPayment: validMonthlyPayment
  };
}

function App() {

  // Get validated loan values from the URL
  const urlValues = getURLParameters();

  // Values shown in the input boxes and sliders
  const [principal, setPrincipal] = useState(urlValues.principal);
  const [interestRate, setInterestRate] = useState(urlValues.interestRate);
  const [monthlyPayment, setMonthlyPayment] = useState(urlValues.monthlyPayment);

  // Values actually used for loan calculations
  const [calcPrincipal, setCalcPrincipal] = useState(urlValues.principal);
  const [calcInterestRate, setCalcInterestRate] = useState(urlValues.interestRate);
  const [calcMonthlyPayment, setCalcMonthlyPayment] = useState(urlValues.monthlyPayment);

  // Controls whether cumulative interest is shown on the chart
  const [showInterest, setShowInterest] = useState(false);

  // Controls whether the amortization schedule is visible
  const [showSchedule, setShowSchedule] = useState(false);

  // Controls the current page of the amortization schedule
  const [currentPage, setCurrentPage] = useState(1);

  // Controls which year of the schedule is displayed
  const [selectedYear, setSelectedYear] = useState("all");

  // Check if the principal is outside the allowed range
  const principalError =
    Number(principal) < 1 || Number(principal) > 100000000;

  // Check if the interest rate is outside the allowed range
  const interestRateError =
    Number(interestRate) < 0 || Number(interestRate) > 40;

  // Number of payments shown on each page
  const paymentsPerPage = 12;

  // Wait 300ms after a numeric input changes before recalculating the loan
  // Slider inputs update the calculation immediately
  useEffect(() => {

    const timer = setTimeout(() => {

      if (!principalError) {
        setCalcPrincipal(principal);
      }

      setCalcInterestRate(interestRate);
      setCalcMonthlyPayment(monthlyPayment);
    }, 300);

    return () => clearTimeout(timer);

  }, [principal, interestRate, monthlyPayment]);

  // Calculate the monthly interest rate
  const monthly_rate = calc_monthly_rate(
    Number(calcInterestRate)
  );


  // Calculate the minimum monthly payment
  const minimum_payment = calc_monthly_interest(
    Number(calcPrincipal),
    monthly_rate
  );

  // Monthly payment maximum is the greater of
  // $1,000,000 or 3 times the minimum payment
  const max_monthly_payment = Math.max(
    1000000,
    minimum_payment * 3
  );

  // Check if the monthly payment is outside the allowed range
  const monthlyPaymentError =
    Number(monthlyPayment) < 1 ||
    Number(monthlyPayment) > max_monthly_payment;

  // Check if any loan input is invalid
  const hasInputError =
    principalError ||
    interestRateError ||
    monthlyPaymentError;

  // Calculate loan results only if all inputs are valid
  const loan_results = hasInputError
    ? { error: "Please correct the invalid input values." }
    : calc_loan(
        Number(calcPrincipal),
        Number(calcInterestRate),
        Number(calcMonthlyPayment)
      );

  // Filter the schedule by the selected year
  const filteredSchedule = loan_results.error
    ? []
    : selectedYear === "all"
      ? loan_results.schedule
      : loan_results.schedule.filter((payment) => {
          const year = Number(selectedYear);

          // Find the first and last payment month for the selected year
          const startMonth = (year - 1) * 12 + 1;
          const endMonth = year * 12;

          return (
            payment.month >= startMonth &&
            payment.month <= endMonth
          );
        });

  // Calculate which payments should appear on the current page
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const endIndex = startIndex + paymentsPerPage;

  // Only keep the payments for the current page
  const currentPayments = filteredSchedule.slice(
    startIndex,
    endIndex
  );

  // Calculate total number of pages
  const totalPages = loan_results.error
    ? 0
    : Math.ceil(filteredSchedule.length / paymentsPerPage);

  // Calculate how many years are in the loan schedule
  const totalYears = loan_results.error
    ? 0
    : Math.ceil(loan_results.months / 12);

  // Only calculate the loan term if there is no error
  const years = loan_results.error
    ? 0
    : Math.floor(loan_results.months / 12);

  // Calculate the remaining months after full years
  const remaining_months = loan_results.error
    ? 0
    : loan_results.months % 12;

  // Calculate estimated payoff date
  const payoff_date = new Date();

  if (!loan_results.error) {
    payoff_date.setMonth(
      payoff_date.getMonth() + loan_results.months
    );
  }

  // Export the full amortization schedule as a CSV file
  function exportCSV() {

    // Do not export if the loan calc has an error
    if (loan_results.error) {
      return;
    }

    // Column names for the CSV file
    const headers = [
      "Payment Number",
      "Payment Amount",
      "Principal",
      "Interest",
      "Remaining Balance"
    ];

    // Convert each payment into a row for the CSV
    const rows = loan_results.schedule.map((payment) => [
      payment.month,
      payment.payment.toFixed(2),
      payment.principal.toFixed(2),
      payment.interest.toFixed(2),
      payment.balance.toFixed(2)
    ]);

    // Combine the headings and payment rows into CSV text
    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Create a temporary CSV file in the browser 
    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url = URL.createObjectURL(blob);

    // Create a temp link that downloads the CSV file
    const link = document.createElement("a");

    link.href = url;
    link.download = "loan_schedule.csv";

    link.click();

    // Remove the temp browser URL after the download starts 
    URL.revokeObjectURL(url);

  }

  // Create a shareable link using the current loan values
  function shareScenario() {

    const url = new URL(window.location.href);

    url.searchParams.set("principal", principal);
    url.searchParams.set("rate", interestRate);
    url.searchParams.set("payment", monthlyPayment);

    navigator.clipboard.writeText(url.toString());
  }

  // Will be displayed on webpage
  return (
    <div className="loan-container">
      <h1> LoanScope </h1>
      <p>Explore how your payment affects the life of your loan.</p>

      {/* Copy the current loan scenario as a shareable link */}
      <button onClick={shareScenario}>
        Share
      </button>

      {/* Container for starting principal */}
      <div className="loan-input">

        <label>Starting principal</label>

        <input
          type="number"
          min="1"
          max="100000000"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />

        <input
            type="range"
            min="1"
            max="100000000"
            value={principal}
            onChange={(e) => {
              setPrincipal(e.target.value);
              setCalcPrincipal(e.target.value);
            }}
        />

        {principalError && (
          <p className="error-message">
            Starting principal must be between $1 and $100,000,000.
          </p>
        )}

      </div>

      {/* Container for annual interest rate */}
      <div className="loan-input">

        <label>Annual Interest Rate</label>

        <input
          type="number"
          min="0"
          max="40"
          step="0.01"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />

        {/* Input type range to use a slider */}
        <input
            type="range" 
            min="0"
            max="40"
            step="0.01"
            value={interestRate}
            onChange={(e) => {
              setInterestRate(e.target.value);
              setCalcInterestRate(e.target.value);
            }}
        />

        {interestRateError && (
          <p className="error-message">
            Annual interest rate must be between 0% and 40%.
          </p>
        )}
        
      </div>

      {/* Container for monthly payment */}
      <div className="loan-input">

         <label>Monthly Payment</label>

          <input
            type="number"
            min="1"
            max={max_monthly_payment}
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
          />

          <input
            type="range"
            min="1"
            max={max_monthly_payment}
            value={monthlyPayment}
            onChange={(e) => {
              setMonthlyPayment(e.target.value);
              setCalcMonthlyPayment(e.target.value);
            }}
          />

          {monthlyPaymentError && (
            <p className="error-message">
              Monthly payment must be between $1 and ${max_monthly_payment.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}.
            </p>
          )}
        
      </div>

    <div className="loan-results">

      <h2>Loan Results</h2>

      {loan_results.error ? (
        <p>{loan_results.error}</p>
      ) : (
        <>
          <p>
            Months to Pay Off: {loan_results.months}
          </p>

          <p>
            Loan Term: {years} years {remaining_months} months
          </p>

          <p>
            Payoff Date: {payoff_date.toLocaleDateString()}
          </p>

          <p>
            Total Interest: ${loan_results.total_interest.toFixed(2)}
          </p>
        </>
       )}
    </div>

    <div className="loan-chart">
      <h2>Remaining Loan Balance</h2>

       <label>
        <input
          type="checkbox"
          checked={showInterest}
          onChange={(e) => setShowInterest(e.target.checked)}
        />
        Show Cumulative Interest
       </label>

      {/* Only show the chart if there is NOT an error */}
      {!loan_results.error && (
        <>
          <div className="chart-summary">
            <p>Payoff Date: {payoff_date.toLocaleDateString()}</p>
            <p>Loan Term: {years} years {remaining_months} months</p>
            <p>Total Interest: ${loan_results.total_interest.toFixed(2)}</p>
          </div>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={loan_results.schedule}>
              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="balance"
              />
              
              {showInterest && (
                <Line
                  type="monotone"
                  dataKey="cumulative_interest"
                />
              )}
            </LineChart>

          </ResponsiveContainer>
        </>
      )}

    </div>
     
    <div className="loan-schedule">
      <h2>Amortization Schedule</h2>

      {!loan_results.error && (
        <button onClick={() => setShowSchedule(!showSchedule)}>
          {showSchedule ? "Hide Schedule" : "Show Schedule"}
        </button>
      )}

      {!loan_results.error && showSchedule && (
        <>
          <button onClick={exportCSV}>
            Export CSV
          </button>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Years</option>

            {Array.from({ length: totalYears }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                Year {index + 1}
              </option>
            ))}
          </select>

          <table>
            <thead>
              <tr>
                <th>Payment #</th>
                <th>Payment Amount</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Remaining Balance</th>
              </tr>
            </thead>

            <tbody>
              {currentPayments.map((payment) => (
                <tr key={payment.month}>
                  <td>{payment.month}</td>
                  <td>${payment.payment.toFixed(2)}</td>
                  <td>${payment.principal.toFixed(2)}</td>
                  <td>${payment.interest.toFixed(2)}</td>
                  <td>${payment.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
         
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        </>
    )}
  </div>

   {/* Loan estimate disclaimer */}
      <p className="disclaimer">
        LoanScope provides illustrative loan estimates only and is not financial
        advice. Actual lender terms may differ due to fees, escrow, or different
        compounding methods.
      </p> 
      
</div>
);
}

export default App;
