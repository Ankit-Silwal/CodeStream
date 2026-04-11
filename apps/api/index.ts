import "dotenv/config";
import http from "node:http";
import app from "./app.js";
import { initializeSocket } from "./socket.js";
import { initDb } from "@repo/shared";

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  return res.json({
    success: true
  });
});

const server = http.createServer(app);

initializeSocket(server);

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Backend server has begun at port ${PORT}`);
  });
});
