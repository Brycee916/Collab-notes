import mongoose from "mongoose";

// schema and model for a user in MongoDB database. Mongoose is a Object Data Modeling (ODM) library
// for MongoDB and Node.js, which helps structure & validate data before it's stored
// UserSchema describes shape of user documents
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema); //exports model named "User"