import { Router } from "express"
import passport from "./index.js"
import { googleCallBack } from "./auth.controller.js"

const router=Router()

router.get('/google',passport.authenticate("google",{
  scope:["profile","email"]
}))

router.get("/google/callback",passport.authenticate("google",{
  session:false
}),googleCallBack)

export default router;