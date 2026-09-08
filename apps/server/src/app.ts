import express from "express";
import cors from "cors";

import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use("/api", routes);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "INFT AMS API is running",
  });
});

app.use(errorMiddleware);

export default app;