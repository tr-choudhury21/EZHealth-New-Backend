import mongoose from "mongoose";

export const dbConnect = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "EZHealth",
    })
    .then(() => {
      console.log("MongoDB connected successfully.");
    })
    .catch((err) => {
      console.log(`Some error occurred while connecting to database: ${err}`);
    });
};
