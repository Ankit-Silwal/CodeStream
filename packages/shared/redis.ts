import "./env.js";
import {Redis} from "ioredis"

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis=new Redis(redisUrl)

export const bullmqRedis = new Redis(redisUrl, {
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
