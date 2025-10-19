import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config";

const router = express.Router();

// api for the user to register for an account
router.post("/register", async (req, res) => {
    try{
        // get data from req body
        const {email, password, displayName } = req.body;
        // if there is no email or password received, error
        if (!email || !password) return res.status(400).json({ message: "Missing fields"});

        // check if the email already exists
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already in use" });

        // hash the password that the new user provided using 10 salt and put it into database
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ email, passwordHash, displayName });
        await user.save();

        // set the jwt parameters and send back the token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {expiresIn: "7d" });
        res.json({ token, user: { id: user._id, email: user.email, displayName } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// api for the user to login to the account
router.post("/login", async (req, res) => {
    try{
        // get the email and password from request body
        const { email, password } = req.body;
        // check if the email exists in db
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // bycrpt to hash the password sent in and compare that hash to the one stored in db
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ message: "Invalid credentials" });

        // jwt token is created for authenticated user and sent back to client along with small safe user object
        /**
         * JWT: sign takes payload { id: user._id }, a secret key from .env, and options { expiresIn: "7d" }
         * and returns a compact token string. Token encodes 3 parts - header (algo/type), payload (claims like user id),
         * & signature - separated by dots (header.payload.signature). Signature is created by hashing the header+payload
         * with the secret (def algo HS256) so server can later verify the token's integrity and authenticity.
         */
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" }); 
        /**
         * Responds w/JSON obj containing token and minimal user obj (id, email, displayName). Client stores token
         * and uses it for subsequent authenticated requests.
         */
        res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } });

    } catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * How token is used on later reqeuests - client typically sends token in an authorization header as a "Bearer <token> "
 * On the server you call jwt.verify(token, JWT_SECRET) to 
 * check signature & expiry and
 * decode payload to get payload.id, which you use to look up user in db
 */

export default router;