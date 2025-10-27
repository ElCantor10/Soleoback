// src/app.js - VERSIÓN SIMPLIFICADA
import express from "express";
import morgan from "morgan";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { connectToDB } from "./db/connect.js";

const app = express();

// CORS PERMISIVO para desarrollo/producción
app.use(cors({
  origin: true, // Permite cualquier origen (o usa "*" si hay problemas)
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

// Conexión a Mongo
app.use(async (_req, _res, next) => {
  try { 
    await connectToDB(); 
    next(); 
  } catch (e) { 
    next(e); 
  }
});

app.get("/", (_req, res) => res.json({ ok: true, name: "todo-pwa-api" }));
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

export default app;