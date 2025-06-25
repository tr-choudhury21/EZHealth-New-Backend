import express from "express";
import {
  getAllDoctors,
  loginDoctor,
  logoutDoctor,
  registerDoctor,
  uploadPrescription,
  verifyDoctor,
} from "../controllers/docController.js";
import {
  isAdminAuthenticated,
  isDoctorAuthenticated,
} from "../middlewares/auth.js";
import { upload, uploadPdf } from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", upload.single("profileImage"), registerDoctor);
router.post("/login", loginDoctor);
router.put("/admin/verify-doctor/:id", isAdminAuthenticated, verifyDoctor);
router.get("/all", getAllDoctors);
router.post(
  "/upload-prescription",
  isDoctorAuthenticated,
  uploadPdf.single("prescription"),
  uploadPrescription
);
router.post("/logout", isDoctorAuthenticated, logoutDoctor);

export default router;
