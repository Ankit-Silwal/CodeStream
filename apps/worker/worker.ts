import {Worker} from "bullmq"
import {pool,redis} from "@repo/shared"

const worker=new Worker("code-save",
  async (job)=>{
    const {roomId}=job.data;
    const key=`doc:${roomId}`
    const content=await redis.get(key);
    if(!content) return;
    await pool.query(`
      insert into pool_snapshots (room_id,content)
      values ($1,$2)`,[
        roomId,
        content
      ]
    )
    console.log("Saved snapshot for room:",roomId)
  },{
    connection:redis
  }
)

worker.on("completed",(job)=>{
  console.log("JOb completed",job.id);
})

worker.on("failed",(job,err)=>{
  console.error(`Job failed ${job?.id} err:`,err)
})