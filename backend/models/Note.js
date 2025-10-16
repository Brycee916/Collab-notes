import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    title: { type: String, default: "Untitled" },
    content: { type: Object, default: { ops: [{ insert: "" }] } }, //default value structured for compatibility with Quill rich text editor, starts with empty insert operation
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //stores a reference to a User document using its ObjectId, indicating who created or owns the note
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //an array of ObjectIds, each referencing a User, multiple collaborators for single note
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Note", NoteSchema);