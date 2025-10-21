import express from "express";
import Note from "../models/Note.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
    registers authMiddleware function to run for every request that reaches this router. tells express to
    run authMiddleware(req,res,next) before handling any route defined in this router. basically it'll check that 
    user Token before doing anything. In that process, it'll verify JWT from authorization header, load user from DB,
    and set req.user. If authentication succeeds then it calls next(), and the route handler runs with req.user
    available.
 */
router.use(authMiddleware); 

// create a note
router.post("/", async (req, res) => {
    const { title = "Untitled", content = { ops: [{ insert: "" }] } } = req.body;
    const note = new Note({ title, content, owner: req.user._id });
    await note.save();
    res.json(note);
});

// list notes for a user
router.get("/", async (req, res) => {
    // get all the notes for that user and sort them by the last date updated
    const notes = (await Note.find({ owner: req.user._id })).sort({ updatedAt: -1 });
    res.json(notes);
});

// get single note
router.get("/:id", async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    //access control if owner or collaborator
    const allowed = note.owner.equals(req.user._id) || note.collaborators.inludes(req.user._id);
    if (!allowed) return res.status(403).json({ message: "Forbidden" }); //not owner nor collaborator - no access
    res.json(note);
});

// update note metadata or manual save
router.put("/:id", async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    const allowed = note.owner.equals(req.user._id) || note.collaborators.includes(req.user._id);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    if (req.body.title) note.title = req.body.title;
    if (req.body.content) note.content = req.body.content;
    note.updatedAt = Date.now();
    await note.save();
    res.json(note);
});


