import { Router } from "express";
import { addMember, changeOwner, createRoom, leaveRoom } from "./room.controller.js";

const router=Router()

router.post("/",createRoom);
router.delete("/",leaveRoom);
router.post('/add',addMember);
router.post('/changeOwner',changeOwner);

export default router;