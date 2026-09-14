import type { Request,Response } from "express";
import { generateToken } from "../../utills/jwt.js";
import {
  createAdminUser,
  createTeacher,
  findOrCreateStudent,
  findUserByCredentials,
  listTeachers,
  verifyAdminCredentials,
} from "./auth.service.js";

export const googleCallBack=(req:Request,res:Response)=>{
  const user=req.user as any;
  const token=generateToken(user);

  //redirect according to the front end port
  const FPORT=process.env.FPORT||3000;
  res.redirect(`http://localhost:${FPORT}?token=${token}`);
}

export const adminLogin = (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");
  if (!verifyAdminCredentials(email, password)) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }

  const user = createAdminUser(email);
  return res.json({ success: true, data: { token: generateToken(user), user } });
};

export const teacherLogin = async (req: Request, res: Response) => {
  const email = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");
  const user = await findUserByCredentials(email, password, "teacher");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid teacher credentials" });
  }

  return res.json({ success: true, data: { token: generateToken(user), user } });
};

export const studentLogin = async (req: Request, res: Response) => {
  const name = String(req.body?.name ?? "");
  const email = String(req.body?.email ?? "");
  if (!name.trim() || !email.trim()) {
    return res.status(400).json({ success: false, message: "Student name and email are required" });
  }

  const user = await findOrCreateStudent(name, email);
  if (!user) {
    return res.status(409).json({ success: false, message: "That email belongs to another account type" });
  }

  return res.json({ success: true, data: { token: generateToken(user), user } });
};

export const createTeacherAccount = async (req: Request, res: Response) => {
  const name = String(req.body?.name ?? "");
  const email = String(req.body?.email ?? "");
  const password = String(req.body?.password ?? "");

  if (!name.trim() || !email.trim() || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Teacher name, email, and a password of at least 6 characters are required",
    });
  }

  try {
    const teacherInput = {
      name,
      email,
      password,
      ...(req.userId ? { createdBy: req.userId } : {}),
    };
    const teacher = await createTeacher(teacherInput);
    return res.status(201).json({ success: true, data: teacher });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }
    throw error;
  }
};

export const listTeacherAccounts = async (_req: Request, res: Response) => {
  const teachers = await listTeachers();
  return res.json({ success: true, data: teachers });
};
