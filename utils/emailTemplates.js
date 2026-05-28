export const verificationEmailTemplate = (name, verifyUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">EZHealth</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${name},</h2>
    <p>Thank you for registering with EZHealth. Please verify your email address to activate your account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" 
         style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Verify Email
      </a>
    </div>

    <p style="color: #666;">This link expires in <strong>24 hours</strong>.</p>
    <p style="color: #666;">If you didn't create an account, you can ignore this email.</p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
    © 2025 EZHealth. All rights reserved.
  </div>
</div>
`;

export const passwordResetEmailTemplate = (name, resetUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">EZHealth</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${name},</h2>
    <p>You requested a password reset. Click the button below to set a new password.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">
        Reset Password
      </a>
    </div>

    <p style="color: #666;">This link expires in <strong>15 minutes</strong>.</p>
    <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
    © 2025 EZHealth. All rights reserved.
  </div>
</div>
`;

export const appointmentConfirmationTemplate = (name, details) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">EZHealth</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Hi ${name},</h2>
    <p>Your appointment has been confirmed.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Doctor:</strong> ${details.doctorName}</p>
      <p><strong>Date:</strong> ${details.date}</p>
      <p><strong>Time:</strong> ${details.time}</p>
      <p><strong>Department:</strong> ${details.department}</p>
    </div>
  </div>
  
  <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
    © 2025 EZHealth. All rights reserved.
  </div>
</div>
`;
