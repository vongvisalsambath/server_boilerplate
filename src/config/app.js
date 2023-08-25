import dotenv from "dotenv";
import path from "path";

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

if (!process.env.PORT) {
  throw new Error("Can`t find .env config varibles for work app");
}

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

export default {
  port: process.env.PORT,
  host: process.env.HOST,
  adminTokenSecretKey: process.env.ADMIN_TOKEN_SECRET_KEY,
  adminWebsiteHosts: [
    "http://localhost:3000/",
    "http://127.0.0.1:3000/",
  ],
  saltRounds: 6,
  saltLength: 6,
  padWidth: 6,
  isDev,
  isProd
};
