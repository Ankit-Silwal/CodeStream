import { Router } from "express"
import passport from "./index.js"
import { googleCallBack } from "./auth.controller.js"
import { requireAuth } from "../../middleware/auth.middleware.js"

const router=Router()

router.get('/google',passport.authenticate("google",{
  scope:["profile","email"]
}))

router.get("/google/callback",passport.authenticate("google",{
  session:false
}),googleCallBack)

router.get("/me", requireAuth, (req: any, res: any) =>
{
  res.json({
    message: "You are authenticated ",
    user: req.user,
  });
});

export default router;