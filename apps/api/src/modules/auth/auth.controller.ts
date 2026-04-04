import type { Request,Response } from "express";
import { generateToken } from "../../utills/jwt.js";

export const googleCallBack=(req:Request,res:Response)=>{
  const user=req.user as any;
  const token=generateToken(user);

  //redirect according to the front end port
  const FPORT=process.env.FPORT||3000;
  res.redirect(`http://localhost:${FPORT}?token=${token}`);
}