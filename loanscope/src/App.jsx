import './App.css';

function App() {
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
          placeholder="25000"
        />

        <input
            type="range"
            min="1"
            max="100000000"
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
          placeholder="6.50"
        />
        {/* Input type range to use a slider */}
        <input
            type="range" 
            min="0"
            max="40"
            step="0.01"
        />
        
      </div>

      {/* Container for monthly payment */}
      <div className="loan-input">

         <label>Monthly Payment</label>

          <input
            type="number"
            min="1"
            placeholder="500"
          />

          <input
            type="range"
            min="1"
            max="1000000"
          />
        
      </div>

    </div>
  )
}

export default App;
