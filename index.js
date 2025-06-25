import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnect } from "./database/db.js";
import userRoutes from "./routes/userRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import appoinmentRoutes from "./routes/appointmentRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//connecting to the database
dbConnect();

//importing routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/doctor", docRoutes);
app.use("/api/v1/appointment", appoinmentRoutes);

//start the server
app.listen(process.env.PORT, () => {
  console.log(`Server connected at Port:${process.env.PORT}`);
});
