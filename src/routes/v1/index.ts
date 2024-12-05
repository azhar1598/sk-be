// src/routes/v1/auth.routes.ts
import express from "express";
import AuthController from "../../controllers/auth.controller";
import StoreController from "../../controllers/store.controller";
import AuthMiddleware from "../../../middlewares/auth.middleware";

const router = express.Router();

router.post("/auth/signup", AuthController.signUp);
router.post("/auth/signin", AuthController.signIn);

router.use(AuthMiddleware.authenticateUser);

router.post("/stores", StoreController.createStore);
router.get("/stores", StoreController.getAllStores);
router.get("/stores/:id", StoreController.getStoreById);
router.patch("/stores/:id", StoreController.updateStore);
router.delete("/stores/:id", StoreController.deleteStore);

export default router;
