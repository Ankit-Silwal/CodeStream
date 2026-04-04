import type { Profile, VerifyCallback } from "passport-google-oauth20";
import passport, { configurePassport } from "../../configs/passport.js";
import { findOrCreateUser } from "./auth.service.js";

configurePassport(async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try{
    const user=await findOrCreateUser(profile);
    done(null,user);
  }catch(err){
    done(err as Error);
  }
})
export default passport