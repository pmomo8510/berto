const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
});

app.post("/upload", upload.single("video"), (req, res) => {

  const format = req.body.format || "mp3";

  const inputFile = req.file.path;

  const outputFile =
    `uploads/${Date.now()}.${format}`;

  ffmpeg(inputFile)
    .toFormat(format)
    .on("end", () => {

      res.download(outputFile, () => {

        fs.unlink(inputFile, () => {});
        fs.unlink(outputFile, () => {});

      });

    })
    .on("error", (err) => {

      console.error(err);

      res.status(500).send(
        "Erreur lors de la conversion."
      );

    })
    .save(outputFile);

});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});