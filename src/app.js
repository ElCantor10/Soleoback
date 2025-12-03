// src/app.js - VERSIÓN CORREGIDA
import express from "express";
import morgan from "morgan";
import cors from "cors";
import admin from "firebase-admin";
import mongoose from "mongoose"; // ← AÑADE ESTO

import taskRoutes from "./routes/task.routes.js";
import authRoutes from "./routes/auth.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import userRoutes from "./routes/user.routes.js";
import routineRoutes from './routes/routine.routes.js';
import muscleGroupRoutes from "./routes/muscleGroup.routes.js";
import workoutLogRoutes from './routes/workoutLog.routes.js';
import exerciseRoutes from './routes/exercise.routes.js';
import paymentRoutes from './routes/payment.routes.js';

import { connectToDB } from "./db/connect.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando Soleo API...');
console.log(`📁 Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? 'Configurada' : 'No configurada'}`);

const app = express();

// ===== INICIALIZACIÓN FIREBASE =====
try {
  if (process.env.GOOGLE_PRIVATE_KEY) {
    console.log('🔧 Inicializando Firebase para Vercel...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.GOOGLE_PROJECT_ID,
        privateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL
      })
    });
    console.log('✅ Firebase inicializado (Vercel)');
  } else {
    console.log('🔧 Inicializando Firebase local...');
    const serviceAccount = JSON.parse(
      await import('fs/promises').then(fs => 
        fs.readFile(path.join(__dirname, 'config/serviceAccountKey.json'), 'utf8')
      )
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase inicializado (Local)');
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error.message);
}

// CORS PERMISIVO
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('public'));

// Middleware para agregar Firebase
app.use((req, _res, next) => {
  req.firebaseAdmin = admin;
  next();
});

// ===== MIDDLEWARE DE CONEXIÓN SEGURO =====
app.use(async (req, res, next) => {
  try { 
    await connectToDB();
    next(); 
  } catch (error) { 
    // NO propagues el error
    console.log('⚠️  MongoDB no disponible:', error.message);
    console.log('🔄 Continuando en modo limitado...');
    req.dbError = error.message;
    next(); // ← ¡CONTINÚA SIN ERROR!
  }
});

// ===== RUTAS =====
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1,
      firebase: admin.apps.length > 0,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get("/", (_req, res) => {
  res.json({ 
    ok: true, 
    name: "soleo-pwa-api",
    version: "1.0.0",
    firebase: admin.apps.length > 0 ? "connected" : "disconnected",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Rutas API
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/routines", routineRoutes);
app.use("/api/muscle-groups", muscleGroupRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use('/api/workout-logs', workoutLogRoutes);
app.use("/api/payments", paymentRoutes);

// ===== MANEJO DE ERRORES GLOBAL =====
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default app;