// src/routes/v1/auth.routes.ts
import express from "express";
import AuthController from "../../controllers/auth.controller";

const router = express.Router();

router.post("/auth/signup", AuthController.signUp);
router.post("/auth/signin", AuthController.signIn);

export default router;
