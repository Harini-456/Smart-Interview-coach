import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected");
    } catch (err) {
        console.log("DB connection error:", err);
        process.exit(1); 
    }
};

export default connectDB;