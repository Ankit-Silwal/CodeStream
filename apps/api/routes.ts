import type { Application } from "express";
import authRouter from "./src/modules/auth/auth.routes.js";
import roomRouter from "./src/modules/room/room.routes.js";
import examRouter from "./src/modules/exam/exam.routes.js";
import { requireAuth } from "./src/middleware/auth.middleware.js";


export function setUpRoutes(app:Application){
  app.use("/auth",authRouter);
  app.use("/room",requireAuth,roomRouter);
  app.use("/exams",requireAuth,examRouter);
}
