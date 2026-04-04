import express from "express";
import cors from "cors"
import { setUpRoutes } from "./routes.js";
import passport from "passport";
const app=express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize())
setUpRoutes(app);


export default app;