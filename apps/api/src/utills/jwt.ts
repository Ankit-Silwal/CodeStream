import jwt from "jsonwebtoken"
export const generateToken=(user:any)=>{
  return jwt.sign(
    {
      id:user.id,
      email:user.email,
      name:user.name,
      role:user.role
    },
    process.env.JWT_SECRET!,
    {
      expiresIn:"7d"
    }
  )
}
