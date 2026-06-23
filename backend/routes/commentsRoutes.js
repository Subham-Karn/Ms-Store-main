import { Router } from "express";
import {
  createComment,
  getAllComments,
  deleteComment,
} from "../controllers/CommentsController.js";

const router = Router();

router.post("/", createComment);
router.get("/:pid", getAllComments);
router.delete("/:id/:pid", deleteComment);

export default router;