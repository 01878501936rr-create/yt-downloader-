const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/stream", (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";

  if (!videoURL) return res.status(400).send("URL নেই");

  // temp filename
  const tempFile = path.join(__dirname, `temp_${Date.now()}.mp4`);

  let format;
  if (quality === "720") format = "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]";
  else if (quality === "1080") format = "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]";
  else format = "bv*[ext=mp4][height<=360]+ba[ext=m4a]/b[ext=mp4][height<=360]";

  // download video to temp file
  const yt = spawn("yt-dlp", [
    "-f", format,
    "--merge-output-format", "mp4",
    "-o", tempFile,
    videoURL
  ]);

  yt.stderr.on("data", d => console.log(d.toString()));

  yt.on("close", (code) => {
    if (code !== 0) return res.status(500).send("ভিডিও ডাউনলোড করতে সমস্যা হয়েছে");

    res.sendFile(tempFile, (err) => {
      if (err) console.error(err);
      fs.unlink(tempFile, () => {}); // delete temp file
    });
  });
});

app.get("/download", (req, res) => {
  // same as before, just force download
});

app.listen(3000, () => console.log("সার্ভার চলছে: 3000"));
