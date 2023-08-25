import dotenv from "dotenv";
import path from "path";

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

if (!process.env.SESSION_SECRET_KEY) {
  throw new Error("Can`t find .env config varibles for work app");
}

export default {
  secretKey: process.env.SESSION_SECRET_KEY,
  maxAge: parseFloat(process.env.SESSION_MAX_AGE) || 6.048e+8, // default: 1 month
  reapInterval: parseFloat(process.env.REAP_INTERVAL) || 604800, // default: 7 days
};
