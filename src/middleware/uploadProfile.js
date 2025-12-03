// src/middleware/uploadProfile.js - VERSIÓN CORREGIDA
import multer from "multer";
import path from "path";
import fs from "fs";

// Diferente storage para desarrollo vs producción
let storage;

if (process.env.NODE_ENV === 'production') {
  // ⚠️ EN VERCEL/PRODUCCIÓN: No podemos escribir en filesystem
  console.log('🔄 Usando memoryStorage para Vercel');
  storage = multer.memoryStorage(); // Almacena en memoria
} else {
  // ✅ EN DESARROLLO: Usar disk storage normal
  console.log('💾 Usando diskStorage para desarrollo');
  
  const profilesDir = "public/uploads/profile";
  
  // Solo crear directorios en desarrollo
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
    console.log('📁 Carpeta creada:', profilesDir);
  }
  
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, profilesDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

export default upload;