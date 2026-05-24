export const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  PATIENT: 'Patient',
};

export const PERMISSIONS = {
  // Appointment
  BOOK_APPOINTMENT: 'book:appointment',
  CANCEL_APPOINTMENT: 'cancel:appointment',
  VIEW_OWN_APPOINTMENTS: 'view:own:appointments',
  VIEW_ALL_APPOINTMENTS: 'view:all:appointments',
  UPDATE_APPOINTMENT_STATUS: 'update:appointment:status',

  // Doctor
  VIEW_ALL_DOCTORS: 'view:all:doctors',
  VIEW_UNVERIFIED_DOCTORS: 'view:unverified:doctors',
  VERIFY_DOCTOR: 'verify:doctor',
  UPDATE_DOCTOR_PROFILE: 'update:doctor:profile',
  SET_AVAILABILITY: 'set:availability',
  UPLOAD_PRESCRIPTION: 'upload:prescription',

  // Patient
  VIEW_OWN_PROFILE: 'view:own:profile',
  VIEW_OWN_PRESCRIPTIONS: 'view:own:prescriptions',

  // Admin
  ADD_ADMIN: 'add:admin',
  VIEW_ADMIN_PROFILE: 'view:admin:profile',
  VIEW_AUDIT_LOGS: 'view:audit:logs',

  // Payment
  CREATE_PAYMENT_ORDER: 'create:payment:order',
  VERIFY_PAYMENT: 'verify:payment',
};

// ─── Role → Permissions Map ───────────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_DOCTORS,
    PERMISSIONS.VIEW_UNVERIFIED_DOCTORS,
    PERMISSIONS.VERIFY_DOCTOR,
    PERMISSIONS.ADD_ADMIN,
    PERMISSIONS.VIEW_ADMIN_PROFILE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.CANCEL_APPOINTMENT,
  ],

  [ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.UPDATE_APPOINTMENT_STATUS,
    PERMISSIONS.UPDATE_DOCTOR_PROFILE,
    PERMISSIONS.SET_AVAILABILITY,
    PERMISSIONS.UPLOAD_PRESCRIPTION,
  ],

  [ROLES.PATIENT]: [
    PERMISSIONS.BOOK_APPOINTMENT,
    PERMISSIONS.CANCEL_APPOINTMENT,
    PERMISSIONS.VIEW_OWN_APPOINTMENTS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.VIEW_OWN_PRESCRIPTIONS,
    PERMISSIONS.CREATE_PAYMENT_ORDER,
    PERMISSIONS.VERIFY_PAYMENT,
    PERMISSIONS.VIEW_ALL_DOCTORS,
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};
