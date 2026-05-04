const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads/proof-photos',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
            && allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only JPEG/PNG/WebP images are allowed'), ok);
  },
});

router.post('/proof-photo', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
  res.json({ url: `/uploads/proof-photos/${req.file.filename}` });
});

module.exports = router;
