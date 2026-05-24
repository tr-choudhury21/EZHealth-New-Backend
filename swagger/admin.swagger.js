export default {
  schemas: {},
  paths: {
    '/admin/new': {
      post: {
        summary: 'Register a new admin',
        tags: ['Admin'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRegister' },
            },
          },
        },
        responses: {
          201: { description: 'Admin registered successfully' },
          400: { description: 'Validation error or admin already exists' },
          500: { description: 'Server error' },
        },
      },
    },
    '/admin/me': {
      get: {
        summary: 'Get logged-in admin profile',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Admin profile fetched successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          500: { description: 'Server error' },
        },
      },
    },
    '/admin/logout': {
      post: {
        summary: 'Logout admin',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Admin logged out successfully' },
          401: { description: 'Unauthorized' },
          500: { description: 'Server error' },
        },
      },
    },
    '/admin/verify-doctor/{id}': {
      put: {
        summary: 'Verify a doctor account',
        tags: ['Admin'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Doctor ID to verify',
          },
        ],
        responses: {
          200: { description: 'Doctor verified successfully' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          404: { description: 'Doctor not found' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
