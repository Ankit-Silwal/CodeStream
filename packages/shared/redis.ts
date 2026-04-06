import {Redis} from "ioredis"

export const redis=new Redis(process.env.REDIS_URL!)

export const bullmqRedis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
})

redis.on("connect",()=>{
  console.log("Connected to the redis")
})

bullmqRedis.on("connect",()=>{
  console.log("Connected to the redis for BullMQ")
})

redis.on("error",(err:any)=>{
  console.error(`Error connecting to the redis`,err);
})

bullmqRedis.on("error",(err:any)=>{
  console.error(`Error connecting to the redis for BullMQ`,err);
})