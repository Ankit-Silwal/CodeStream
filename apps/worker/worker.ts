import {Worker} from "bullmq"
import {bullmqRedis,pool,redis} from "@repo/shared"

const worker=new Worker("code-save",async(job)=>{
  const {roomId}=job.data
  const data=await redis.get(`doc:${roomId}`)
  if(!data)return

  const {code,version}=JSON.parse(data)

  const dbRes=await pool.query(`
    SELECT version FROM room_snapshots
    WHERE room_id=$1
    ORDER BY created_at DESC
    LIMIT 1
  `,[roomId])

  const lastSavedVersion=dbRes.rows[0]?.version??-1

  if(version<=lastSavedVersion)return

  await pool.query(`
    INSERT INTO room_snapshots (room_id,content,version)
    VALUES ($1,$2,$3)
  `,[roomId,code,version])

  console.log("Saved",roomId,version)
},{
  connection:bullmqRedis
})

worker.on("completed",(job)=>{
  console.log("Done",job.id)
})

worker.on("failed",(job,err)=>{
  console.error("Fail",job?.id,err)
})