// Import Express
import express from "express";

// Import CORS
import cors from "cors";

// Import the loan calc
import { calc_loan } from "../src/loan_calculations.js";

// Create the Express server
const app = express();

// Choose the port the backend will run on
const PORT = 3000;

// Allow the frontend to communicate with the backend
app.use(cors());

// Allow the server to read JSON sent from the frontend
app.use(express.json());

// Receive loan information from the frontend
app.post("/api/calculate", (req, res) => {

    // Get the loan values from the request
    const {
        principal,
        annual_rate,
        monthly_payment
    } = req.body;

    // Validate the starting principal
    if (
        typeof principal !== "number" ||
        principal < 1 ||
        principal > 100000000
    ) {
        return res.status(400).json({
            error: "Starting principal must be between $1 and $100,000,000."
        });
    }

    // Validate the annual interest rate
    if (
        typeof annual_rate !== "number" ||
        annual_rate < 0 ||
        annual_rate > 40
    ) {
        return res.status(400).json({
            error: "Annual interest rate must be between 0% and 40%."
        });
    }

    // Validate the monthly payment
    if (
        typeof monthly_payment !== "number" ||
        monthly_payment < 1
    ) {
        return res.status(400).json({
            error: "Monthly payment must be at least $1."
        });
    }

    // Calculate the loan using the validated values
    const loan_results = calc_loan(
        principal,
        annual_rate,
        monthly_payment
    );

// Send the loan results back to the frontend
res.json(loan_results);
});

// Start the backend server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});