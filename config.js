import dotenv from "dotenv";
dotenv.config();

// Configuration file to store sensitive data

const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN, // Token is now retrieved from environment variables
};

export default CONFIG;