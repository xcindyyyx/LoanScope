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

function App() {

  // Values shown in the input boxes and sliders
  const [principal, setPrincipal] = useState(25000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [monthlyPayment, setMonthlyPayment] = useState(500);

  // Values actually used for loan calculations
  const [calcPrincipal, setCalcPrincipal] = useState(25000);
  const [calcInterestRate, setCalcInterestRate] = useState(6.5);
  const [calcMonthlyPayment, setCalcMonthlyPayment] = useState(500);

  // Controls whether cumulative interest is shown on the chart
  const [showInterest, setShowInterest] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {
      setCalcPrincipal(principal);
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


  // Calculate loan results
  const loan_results = calc_loan(
      Number(calcPrincipal),
      Number(calcInterestRate),
      Number(calcMonthlyPayment)
  ); 

  // Only calculate the loan term if there is no error
  const years = loan_results.error
    ? 0
    : Math.floor(loan_results.months / 12);

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

  // Will be displayed on webpage
  return (
    <div className="loan-container">
      <h1> LoanScope </h1>
      <p>Explore how your payment affects the life of your loan.</p>

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

    </div>
  );
}

export default App;
