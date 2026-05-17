import cloudinary from '../config/cloudinary.config.js';

export const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'doctors', resource_type: 'image' },
      (error, result) => {
        if (error) reject(new Error('Failed to upload image'));
        else resolve(result.secure_url);
      },
    );
    stream.end(fileBuffer);
  });
};

export const uploadPDFToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'prescriptions', resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error) reject(new Error('Failed to upload PDF'));
        else resolve(result.secure_url);
      },
    );
    stream.end(fileBuffer);
  });
};
