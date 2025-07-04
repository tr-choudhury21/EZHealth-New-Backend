import multer from "multer";

const storage = multer.memoryStorage(); // in-memory for Cloudinary
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const pdfFilter = (req, res, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 2MB max
});

export const uploadPdf = multer({
  storage,
  pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});
