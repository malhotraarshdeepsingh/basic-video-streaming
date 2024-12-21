// importing libraries
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { stdout, stderr } from "process";

// creating express app
const app = express();

// setting up multer middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + uuid() + "-" + path.extname(file.originalname)
    );
  },
});

// multer configuration
const upload = multer({
  storage: storage,
});

// setting up cors
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// where to keep all static files
app.use("/uploads", express.static("uploads"));

// basic code to check initial state
app.get("/", function (req, res) {
  res.json({
    message: "Welcome",
  });
});

// endpoint to upload a file to the server
app.post("/upload", upload.single("file"), function (req, res) {
  const lessonId = uuid();
  const videoPath = req.file.path;
  const outputPath = `./uploads/courses/${lessonId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // ffmpeg command to convert video to hls
  const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  // execute ffmpeg command
  // not to be used in production
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error.message}`);
      res.status(500).send({ message: "Error processing video" });
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);

    const videoUrl = `http://localhost:8000/courses/${lessonId}/index.m3u8`;

    res.json({
        message: `Video ${videoUrl} processed successfully`,
        videoUrl: videoUrl,
        lessonId: lessonId,
    })
  });
});

app.listen(8000, function () {
  console.log("Server is running on port 3000");
});
