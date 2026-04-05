import { Queue } from "bullmq";
import { redis } from "@repo/shared";

export const codeQueue=new Queue("code-save",{
  connection:redis
})