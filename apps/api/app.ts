import express from "express";
import cors from "cors"
import { setUpRoutes } from "./routes.js";
const app=express();

app.use(cors({ origin: "*" }));
app.use(express.json());
setUpRoutes(app);


export default app;