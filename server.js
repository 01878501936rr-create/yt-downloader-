const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());

/* ================= VIDEO STREAM ================= */
app.get("/stream", (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";

  if (!videoURL) return res.status(400).send("URL নেই");

  let format;
  if (quality === "720") {
    format = "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]";
  } else if (quality === "1080") {
    format = "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]";
  } else {
    format = "bv*[ext=mp4][height<=360]+ba[ext=m4a]/b[ext=mp4][height<=360]";
  }

  res.setHeader("Content-Type", "video/mp4"); // ✅ important for <video> playback
  res.setHeader("Transfer-Encoding", "chunked");

  const yt = spawn("yt-dlp", [
    "-f", format,
    "--merge-output-format", "mp4",
    "--no-progress",
    "-o", "-", // stream to stdout
    videoURL
  ]);

  yt.stdout.pipe(res);
  yt.stderr.on("data", (data) => console.error(data.toString()));
  yt.on("close", () => res.end());
  yt.on("error", (err) => {
    console.error("yt-dlp error:", err);
    res.status(500).end();
  });
});

/* ================= FORCE DOWNLOAD ================= */
app.get("/download", (req, res) => {
  const videoURL = req.query.url;
  const quality = req.query.quality || "720";

  if (!videoURL) return res.status(400).send("URL নেই");

  let format;
  if (quality === "720") {
    format = "bv*[ext=mp4][height<=720]+ba[ext=m4a]/b[ext=mp4][height<=720]";
  } else if (quality === "1080") {
    format = "bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4][height<=1080]";
  } else {
    format = "bv*[ext=mp4][height<=360]+ba[ext=m4a]/b[ext=mp4][height<=360]";
  }

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="video_${quality}.mp4"`
  );
  res.setHeader("Transfer-Encoding", "chunked");

  const yt = spawn("yt-dlp", [
    "-f", format,
    "--merge-output-format", "mp4",
    "--no-progress",
    "-o", "-", // stream to stdout
    videoURL
  ]);

  yt.stdout.pipe(res);
  yt.stderr.on("data", (data) => console.error(data.toString()));
  yt.on("close", () => res.end());
  yt.on("error", (err) => {
    console.error("yt-dlp error:", err);
    res.status(500).end();
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("সার্ভার চলছে:", PORT));
