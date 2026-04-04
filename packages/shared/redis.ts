import {Redis} from "ioredis"

export const redis=new Redis(process.env.REDIS_URL!)

redis.on("connect",()=>{
  console.log("Connected to the redis")
})

redis.on("error",(err:any)=>{
  console.error(`Error connecting to the redis`,err);
})