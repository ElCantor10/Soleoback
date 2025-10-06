import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/me', auth, profile);

router.post('/register', register);


export default router;