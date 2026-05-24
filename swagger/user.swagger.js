export default {
  schemas: {
    UserRegister: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'email',
        'password',
        'phone',
        'gender',
        'age',
      ],
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'pass1234' },
        phone: { type: 'string', example: '+91XXXXXXXXXX' },
        gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
        age: { type: 'number', example: 24 },
      },
    },
    LoginCredentials: {
      type: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'pass1234' },
        role: { type: 'string', enum: ['Patient', 'Admin', 'Doctor'] },
      },
    },
  },
  paths: {
    '/patient/register': {
      post: {
        summary: 'Register a new patient',
        tags: ['Patients'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRegister' },
            },
          },
        },
        responses: {
          201: { description: 'Patient registered successfully' },
          400: { description: 'Validation error or user already exists' },
          500: { description: 'Server error' },
        },
      },
    },
    '/login': {
      post: {
        summary: 'Login for patients and admins',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginCredentials' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Role mismatch' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
