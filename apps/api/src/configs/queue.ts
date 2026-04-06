import { Queue } from "bullmq";
import { bullmqRedis } from "@repo/shared";

export const codeQueue=new Queue("code-save",{
  connection:bullmqRedis
})