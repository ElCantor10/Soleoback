// src/middleware/uploadProfile.js - VERSIÓN QUE FUNCIONA EN VERCEL
import multer from "multer";
import path from "path";

// ⚠️ EN VERCEL: NO podemos usar filesystem, usamos memoryStorage
let storage;

if (process.env.NODE_ENV === 'production') {
  // PRODUCCIÓN (Vercel): Almacenar en memoria
  console.log('🔄 Configurando multer con memoryStorage para Vercel');
  storage = multer.memoryStorage();
} else {
  // DESARROLLO: Usar filesystem local
  import("fs").then(fs => {
    const profilesDir = "public/uploads/profile";
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
      console.log('📁 Carpeta creada:', profilesDir);
    }
  });
  
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/profile");
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