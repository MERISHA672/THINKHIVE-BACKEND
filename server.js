
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the frontend ports used by Vite
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
  })
);

app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the THINKHIVE API!",
    status: "running",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    application: "THINKHIVE",
  });
});






// Start server
app.listen(PORT, () => {
  console.log(
    `THINKHIVE server running at http://localhost:${PORT}`
  );
});
