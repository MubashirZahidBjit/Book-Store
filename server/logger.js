const fs = require("fs").promises;
const path = require("path");

const logFilePath = path.join(__dirname, "log.json");

const logAction = async (action) => {
  const currentTime = new Date().toISOString();
  const logEntry = `${currentTime}: ${action}\n`;

  try {
    const existingLog = await fs.readFile(logFilePath, "utf-8");
    const updatedLog = existingLog + logEntry;
    await fs.writeFile(logFilePath, updatedLog);
  } catch (err) {
    console.error("Error writing to log:", err);
  }
};

module.exports = { logAction };
