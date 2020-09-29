require("dotenv").config();
const express = require("express");
const app = express();
const cron = require("node-cron");

const everyDay = process.env.CRON_DATE || "30 2 * * *";

const { startConnection, handleDump } = require("./dump");

startConnection(process.env.URL, (err, connection) => {
  if (err) {
    return console.log(err);
  }

  connection.once("open", async function () {
    const db = connection.db;

    cron.schedule(everyDay, async function () {
      console.log("Running a task...");
      await handleDump(db);
    });
  });
});

console.log("Running a task each day...");

app.listen(process.env.PORT || 3000);
