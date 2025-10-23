import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import { PORT, MONGO_URI, JWT_SECRET } from "./config.js";
import authRoutes from "./routes/auth.js";