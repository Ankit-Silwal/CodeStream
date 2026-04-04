import passport from "passport"
import { Strategy } from "passport-google-oauth20"

export const configurePassport=(verifyCallBack:any)=>{
  passport.use(
    new Strategy({
      clientID:process.env.GOOGLE_CLIENT_ID!,
      clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:process.env.GOOGLE_CALLBACK_URL!,
    },verifyCallBack)
  )
}

export default passport;