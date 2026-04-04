import type { Application } from "express";
import authRouter from "./src/modules/auth/auth.routes.js";
export function setUpRoutes(app:Application){
  authRouter.use("/auth",authRouter);
}