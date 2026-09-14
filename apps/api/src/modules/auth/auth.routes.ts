import { Router } from "express"
import passport from "./index.js"
import {
  adminLogin,
  createTeacherAccount,
  googleCallBack,
  listTeacherAccounts,
  studentLogin,
  teacherLogin,
} from "./auth.controller.js"
import { requireAuth, requireRole } from "../../middleware/auth.middleware.js"

const router=Router()

router.get('/google',passport.authenticate("google",{
  scope:["profile","email"]
}))

router.get("/google/callback",passport.authenticate("google",{
  session:false
}),googleCallBack)

router.post("/admin/login", adminLogin);
router.get("/admin/teachers", requireAuth, requireRole("admin"), listTeacherAccounts);
router.post("/admin/teachers", requireAuth, requireRole("admin"), createTeacherAccount);
router.post("/teacher/login", teacherLogin);
router.post("/student/login", studentLogin);

router.get("/me", requireAuth, (req: any, res: any) =>
{
  res.json({
    message: "You are authenticated ",
    user: req.user,
  });
});

export default router;
