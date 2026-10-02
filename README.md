# LoanScope

LoanScope is a web-based loan calculator that allows users to explore how the starting principal, annual interest rate, and monthly payment affect the life of a loan.

## Technologies Used

- JavaScript
- React
- Vite
- Node.js
- Express
- Recharts
- HTML
- CSS

## How to Run LoanScope

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 2. Start the Backend

In the first terminal, run:

```bash
node server/server.js
```

The backend will run on port `3000`.

### 3. Start the Frontend

Open a second terminal and run:

```bash
npm run dev
```

Vite will display the local URL for the application, typically:

```text
http://localhost:5173
```

Open the URL in your browser to use LoanScope.

> Both the frontend and backend must be running at the same time for LoanScope to perform calculations.

## Running Tests

To run the automated calculation tests:

```bash
npx vitest run
```

## Features

- Interactive loan calculations using principal, interest rate, and monthly payment
- Loan payoff and interest estimates
- Interactive balance and interest chart
- Amortization schedule with filtering and CSV export
- Shareable loan scenarios

## Notes / Known Limitations

- This project focuses on implementing the logic and requirements defined in the LoanScope SRS. The SRS did not require an advanced visual design, so the interface was kept simple and functional.

- Automated tests currently focus on the loan calculation engine. Frontend and backend integration testing is performed manually.

- The calculation engine includes automated tests for loan payoff calculations, interest calculations, cumulative values, zero balance, invalid payments, and the 100-year payoff limit.

- Accessibility was tested using keyboard navigation and Chrome Lighthouse. The application received a Lighthouse Accessibility score of 100 during testing.

- LoanScope uses a React frontend and an Express backend. Both must be running for the application to perform calculations.

- LoanScope is intended as an educational loan estimation tool rather than a production financial application.

- The financial disclaimer included in the application is not final production language. The SRS marks the exact disclaimer wording as TBD pending legal review.