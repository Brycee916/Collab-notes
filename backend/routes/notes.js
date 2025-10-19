import express from "express";
import Note from "../models/Note.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// create a note
router.post("/", async (req, res) => {
    const { title = "Untitled", content = { ops: [{ insert: "" }] } } = req.body;
    const note = new Note({ title, content, owner: req.user._id });
    await note.save();
    res.json(note);
});
