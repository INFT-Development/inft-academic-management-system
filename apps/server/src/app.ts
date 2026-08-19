import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api", routes);

app.use(errorMiddleware);
  
app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "INFT AMS API is running",
  });
});

export default app;