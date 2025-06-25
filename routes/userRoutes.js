import express from "express";
import {
  addNewAdmin,
  getUserProfile,
  login,
  logoutAdmin,
  logoutPatient,
  registerPatient,
} from "../controllers/userControllers.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", registerPatient);
router.post("/login", login);
router.get("/patient/profile", isPatientAuthenticated, getUserProfile);
router.post("/patient/logout", isPatientAuthenticated, logoutPatient);

router.post("/admin/new", addNewAdmin);
router.post("/admin/logout", isAdminAuthenticated, logoutAdmin);

export default router;
