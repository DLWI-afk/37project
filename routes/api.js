const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/File");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


router.get("/files", async (req, res) => {
    const files = await File.find({});
    res.json(files);
});

router.get("/files/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
});

router.post("/files", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const newFile = await File.create({
      filename: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadDate: new Date(),
      userId: userId
    });

    res.status(201).json({
      message: "File uploaded",
      file: newFile
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/files/:id", async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: "File deleted" });
});

router.put("/files/:id", async (req, res) => {
    const { filename } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File is not found" });

    if (!filename) return res.status(400).json({ error: "Filename required" });

    file.filename = filename;
    await file.save();

    res.json({
        message: "File is updated",
        file
    });
});


module.exports = router;
