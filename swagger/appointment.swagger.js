export default {
  schemas: {
    AppointmentRequest: {
      type: 'object',
      required: [
        'doctorId',
        'appointmentDate',
        'appointmentTime',
        'department',
      ],
      properties: {
        doctorId: { type: 'string', example: '507f1f77bcf86cd799439013' },
        appointmentDate: {
          type: 'string',
          format: 'date',
          example: '2025-06-01',
        },
        appointmentTime: { type: 'string', example: '10:00 AM' },
        department: { type: 'string', example: 'Cardiology' },
      },
    },
    Appointment: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        patientId: { type: 'string', example: '507f1f77bcf86cd799439012' },
        doctorId: { type: 'string', example: '507f1f77bcf86cd799439013' },
        appointmentDate: { type: 'string', format: 'date-time' },
        appointmentTime: { type: 'string', example: '10:00 AM' },
        department: { type: 'string', example: 'Cardiology' },
        status: {
          type: 'string',
          enum: ['Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'],
          example: 'Pending',
        },
        meetingLink: {
          type: 'string',
          example: 'https://meet.jit.si/Room-abc123',
        },
        paymentStatus: { type: 'string', enum: ['Pending', 'Paid', 'Failed'] },
        amount: { type: 'number', example: 500 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },
  paths: {
    '/appointment/slots': {
      get: {
        summary: 'Get available slots for a doctor on a date',
        tags: ['Appointments'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'doctorId',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'date',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: { description: 'List of available time slots' },
          400: { description: 'doctorId and date are required' },
          500: { description: 'Server error' },
        },
      },
    },
    '/appointment/book': {
      post: {
        summary: 'Book a new appointment',
        tags: ['Appointments'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Appointment booked successfully' },
          400: { description: 'Validation error or slot already booked' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/appointment/{id}/cancel': {
      put: {
        summary: 'Cancel an appointment',
        tags: ['Appointments'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Appointment cancelled successfully' },
          400: { description: 'Cannot cancel this appointment' },
          403: { description: 'Not authorized' },
          404: { description: 'Appointment not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/appointment/{id}/status': {
      put: {
        summary: 'Update appointment status (Doctor only)',
        tags: ['Appointments'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['Accepted', 'Rejected', 'Completed'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated successfully' },
          400: { description: 'Invalid status' },
          403: { description: 'Unauthorized to update this appointment' },
          404: { description: 'Appointment not found' },
          500: { description: 'Server error' },
        },
      },
    },
    '/appointment/doctor': {
      get: {
        summary: 'Get all appointments for logged-in doctor',
        tags: ['Appointments'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'List of doctor appointments' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/appointment/all': {
      get: {
        summary: 'Get all appointments (Admin only)',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'List of all appointments' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
