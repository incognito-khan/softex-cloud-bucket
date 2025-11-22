import express from "express";
import cors from "cors"; 
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(cors()); 
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

// Test route
app.get("/", async (req, res) => {
  res.send("Server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
