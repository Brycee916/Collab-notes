import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import User from "../models/User.js";
//jwt header(type of token, signing algorithm).payload(claims-statements about entity(user) and addit data).signature
//base64Url encoded after each part

export default async function authMiddleware(req, res, next){
    const auth = req.headers.authorization; // retrieves authorization header from incoming http req
    if (!auth) return res.status(401).json({ message: "Missing auth" });
    const token = auth.split(" ")[1]; // splits the header value (usually "Bearer <token>") and extracts token part
    if (!token) return res.status(401).json({ message: "Invalid auth" });
    try {
        const payload = jwt.verify(token, JWT_SECRET); // verifies token using secret key and decodes the payload
        const user = await User.findById(payload.id).select("-passwordHash"); //finds user in db by ID from token payload, excluding password hash field
        if (!user) return res.status(401).json({ message: "User not found" });
        req.user = user; // attaches user object to the req for use in subsequent middleware or route handlers
        next(); // calls next middleware or route handler in express pipeline. signals authentication was successful and continue to next (api enpoint logic)
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

//extra notes:
//  await pauses execution of function until db query completes
/**
app.get("/notes", authMiddleware, (req, res) => {
    // Your endpoint logic here
});
Here’s what happens:
When a request comes to /notes, Express first executes authMiddleware(req, res, next).
If authentication succeeds, authMiddleware calls next(), which tells Express to move on to the next function in the chain—the route handler (req, res) => { ... }.
If authentication fails, authMiddleware sends a response and does not call next(), so the route handler is never executed.
Express handles the calling of middleware functions and passes the correct parameters automatically. You just need to list your middleware (like authMiddleware) before your route handler in the route definition.
 */
/*
function logRequest(req, res, next) {
    console.log(`Request made by user: ${req.user ? req.user.email : "Unknown"}`);
    next();
}

import authMiddleware from "../middleware/authMiddleware.js";

app.get("/notes", authMiddleware, logRequest, (req, res) => {
    // This is your main route handler
    res.json({ message: "Notes endpoint accessed!" });
});
In this example:
authMiddleware runs first to authenticate the user.
logRequest runs next to log the request.
Finally, your main route handler executes.
You can add as many middleware functions as you need before your main handler.
*/