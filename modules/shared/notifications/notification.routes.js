import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteOneNotification,
} from './notification.controller.js';
// import {
//   isPatientAuthenticated,
//   isDoctorAuthenticated,
//   isAdminAuthenticated,
// } from '../../middlewares/auth.js';

import { isAnyAuthenticated } from './notification.middleware.js';

const router = express.Router();

// Works for all roles — middleware picks correct cookie
// router.get(
//   '/',
//   isPatientAuthenticated || isDoctorAuthenticated,
//   getMyNotifications,
// );
// router.put(
//   '/:id/read',
//   isPatientAuthenticated || isDoctorAuthenticated,
//   markAsRead,
// );
// router.put(
//   '/read-all',
//   isPatientAuthenticated || isDoctorAuthenticated,
//   markAllAsRead,
// );
// router.delete(
//   '/:id',
//   isPatientAuthenticated || isDoctorAuthenticated,
//   deleteOneNotification,
// );

router.get('/', isAnyAuthenticated, getMyNotifications);
router.put('/:id/read', isAnyAuthenticated, markAsRead);
router.put('/read-all', isAnyAuthenticated, markAllAsRead);
router.delete('/:id', isAnyAuthenticated, deleteOneNotification);

export default router;
