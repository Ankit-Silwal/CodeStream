import express from "express";
import cors from "cors"
import { setUpRoutes } from "./routes.js";
import passport from "passport";
import { rateLimit, requireJson, securityHeaders } from "./src/middleware/security.middleware.js";
const app=express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(rateLimit(Number(process.env.API_RATE_LIMIT_PER_MINUTE ?? 120)));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "256kb" }));
app.use(requireJson);
app.use(passport.initialize())
setUpRoutes(app);


export default app;
