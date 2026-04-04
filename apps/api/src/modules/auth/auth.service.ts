import {pool} from "@repo/shared"

export  const findOrCreateUser=async (profile:any)=>{
  const googleId=profile.id;
  const email=profile.emails[0].value;
  const name=profile.displayName;
  const avatar=profile.photos[0].value;

  let user=await pool.query(`
    select * from users where google_id=$1`,[googleId])
  if(user.rows.length===0){
    user=await pool.query(
      `
      Insert into users (google_id,email,name,avatar)
      values ($1,$2,$3,$4)
      returning *
      `,[googleId,email,name,avatar]
    )
  }
  return user.rows[0];
}