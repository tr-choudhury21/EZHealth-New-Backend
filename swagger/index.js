import userSwagger from './user.swagger.js';
import doctorSwagger from './doctor.swagger.js';
import appointmentSwagger from './appointment.swagger.js';
import adminSwagger from './admin.swagger.js';

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hospital Appointment API',
    version: '1.0.0',
    description: 'API documentation for EZHealth Hospital Appointment System',
  },
  servers: [{ url: '/api/v1', description: 'Development server' }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'patientToken',
      },
    },
    schemas: {
      ...userSwagger.schemas,
      ...doctorSwagger.schemas,
      ...appointmentSwagger.schemas,
      ...adminSwagger.schemas,
    },
  },
  paths: {
    ...userSwagger.paths,
    ...doctorSwagger.paths,
    ...appointmentSwagger.paths,
    ...adminSwagger.paths,
  },
};
