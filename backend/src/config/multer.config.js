const multer = require('multer');

// Disk pe save karne ki jagah ab memory mein rakhenge — waha se seedha
// Azure Blob Storage pe upload karenge. File disk pe kabhi save nahi hoti,
// isliye Render/koi bhi host restart ho, image kabhi missing nahi hogi.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});

module.exports = upload;