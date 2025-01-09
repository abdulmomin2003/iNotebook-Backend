const connectToMongo = require("./db");
connectToMongo();

const express = require("express");
const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
