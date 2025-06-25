import express from "express";
import {
  isAdminAuthenticated,
  isDoctorAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";
import {
  bookAppointment,
  cancelAppointment,
  getAllAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/book", isPatientAuthenticated, bookAppointment);
router.get("/all", isAdminAuthenticated, getAllAppointments);
router.get("/", isDoctorAuthenticated, getDoctorAppointments);
router.put("/:id/cancel", isPatientAuthenticated, cancelAppointment);
router.put("/:id/status", isDoctorAuthenticated, updateAppointmentStatus);

export default router;
