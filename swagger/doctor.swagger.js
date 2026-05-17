export default {
  schemas: {
    DoctorRegister: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'email',
        'password',
        'phone',
        'gender',
        'specialization',
        'department',
        'experience',
        'consultationFee',
      ],
      properties: {
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Smith' },
        email: { type: 'string', example: 'doctor@example.com' },
        password: { type: 'string', example: 'pass1234' },
        phone: { type: 'string', example: '+91XXXXXXXXXX' },
        gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
        specialization: { type: 'string', example: 'Cardiology' },
        department: { type: 'string', example: 'Heart' },
        experience: { type: 'number', example: 5 },
        consultationFee: { type: 'number', example: 500 },
        profileImage: { type: 'string', format: 'binary' },
      },
    },
  },
  paths: {
    '/doctor/register': {
      post: {
        summary: 'Register a new doctor',
        tags: ['Doctors'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/DoctorRegister' },
            },
          },
        },
        responses: {
          201: { description: 'Doctor registered, awaiting verification' },
          400: { description: 'Validation error or doctor already exists' },
          500: { description: 'Server error' },
        },
      },
    },
    '/doctor/login': {
      post: {
        summary: 'Doctor login',
        tags: ['Doctors'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Doctor not verified' },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
