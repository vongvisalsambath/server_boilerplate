import fs from "fs";
import appRoot from "app-root-path";

const dirPath = `${appRoot}/logs`;
const exists = fs.existsSync(dirPath);

if (!exists) fs.mkdirSync(dirPath);

export default {
  fileLogLevel: "info",
  consoleLogLevel: "debug",
  logFileName: {
    error: "../logs/error.log",
  },
};
