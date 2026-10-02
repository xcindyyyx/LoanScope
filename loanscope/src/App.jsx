import {calc_loan} from "./loan_calculations"
import {useState} from "react";
import './App.css';

function App() {

  // Allows values to be changed
  const [principal, setPrincipal] = useState(25000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [monthlyPayment, setMonthlyPayment] = useState(500);

  // Calculate loan results
  const loan_results = calc_loan(
      Number(principal),
      Number(interestRate),
      Number(monthlyPayment)
  ); 

  // Convert total months into years and remaining months
  const years = Math.floor(loan_results.months / 12);
  const remaining_months = loan_results.months % 12;


  // Calculate estimated payoff date
  const payoff_date = new Date();
  payoff_date.setMonth(payoff_date.getMonth() + loan_results.months);

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
            onChange={(e) => setPrincipal(e.target.value)}
        />

      </div>

      {/* Container for annual interest rate */}
      <div className="loan-input">

        <label>Annual Interest Rate</label>

        <input
          type="number"
          min="0"
          max="40"
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
            onChange={(e) => setInterestRate(e.target.value)}
        />
        
      </div>

      {/* Container for monthly payment */}
      <div className="loan-input">

         <label>Monthly Payment</label>

          <input
            type="number"
            min="1"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
          />

          <input
            type="range"
            min="1"
            max="1000000"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(e.target.value)}
          />
        
      </div>

      {/* Display loan results */}
      <div className="loan-results">

        <h2>Loan Results</h2>

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

      </div>


    </div>
  )
}

export default App;
