
const { spawn } = require("child_process");
const express = require("express");
const app = express();
const logger = require("./utils/log.js");

const getRandomPort = () => Math.floor(Math.random() * (65535 - 1024) + 1024);


const PORT = process.env.PORT || getRandomPort() || 9999;

 app.get("/", (req, res) => {
      res.sendFile('home.html', {root : __dirname});
    });

app.listen(PORT, () => {
  logger.loader(`Bot is running on port: ${PORT}`);
  startBot(0);
});

async function startBot(index) {
  logger.loader(`Starting child process ${index}`);
  const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "Asuna.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      CHILD_INDEX: index,
    },
  });

  child.on("close", async (codeExit) => {
    if (codeExit !== 0 || global.countRestart && global.countRestart < 5) {
      await startBot(index);
      return;
    }
    return;
  });
    
    
  child.on("error", (error) => {
    logger(`An error occurred: ${JSON.stringify(error)}`, "[ Starting ]");
  });
}

