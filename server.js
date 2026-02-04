const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

app.get("/download", (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "mp4";

  if (!videoURL) {
    return res.status(400).send("URL missing");
  }

  let format;

  if (quality === "720") {
    format = "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]";
  } else if (quality === "1080") {
    format = "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]";
  } else {
    format = "mp4";
  }

  // 🔒 FORCE DOWNLOAD
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="video_${quality}.mp4"`
  );
  res.setHeader("Transfer-Encoding", "chunked");

  const yt = spawn("yt-dlp", [
    "-f", format,
    "--merge-output-format", "mp4",
    "-o", "-",
    videoURL
  ]);

  yt.stdout.pipe(res);

  yt.stderr.on("data", d => console.log(d.toString()));
  yt.on("close", () => res.end());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
