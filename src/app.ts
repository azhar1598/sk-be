import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import routes from "./routes";

// Load environment variables
dotenv.config();

// Configuration
const PORT = parseInt(process.env.PORT || "5500", 10);
const DB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://storekodebe:Azhar@1998@@sk-cluster.cnrej.mongodb.net/skbe-db";

// Middleware setup
const initializeMiddleware = (app: express.Application) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.json());
};

// Routes setup
const setupRoutes = (app: express.Application) => {
  // Health check route
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // Placeholder for additional routes
  // You can uncomment and add routes like:
  app.use("/", routes);
  // app.use('/users', userRoutes);
};

// Database connection
const connectDatabase = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    // Setup error and disconnection handling
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Lost MongoDB connection");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

// Server startup and graceful shutdown
const startServer = () => {
  const app = express();

  // Initialize middleware
  initializeMiddleware(app);

  // Setup routes
  setupRoutes(app);

  // Connect to database
  connectDatabase();

  // const userSchema = new mongoose.Schema({ name: String, age: Number });

  // const UserModel = mongoose.model("emp", userSchema);

  // const emp1 = new UserModel({ name: "azhar", age: 26 });
  // emp1.save();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });
  });

  return app;
};

const app = startServer();

export default app;
