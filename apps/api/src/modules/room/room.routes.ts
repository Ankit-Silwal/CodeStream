import { Router } from "express";
import { addMember, changeOwner, createRoom, leaveRoom, getAllRooms } from "./room.controller.js";

const router=Router()

router.get("/all", getAllRooms);
router.post("/",createRoom);
router.delete("/",leaveRoom);
router.post('/add',addMember);
router.post('/changeOwner',changeOwner);

export default router;