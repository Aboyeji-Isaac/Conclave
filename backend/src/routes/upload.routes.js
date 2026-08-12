const { Router } = require('express');
const multer = require('multer');
const requireAuth = require('../middlewares/auth.middleware');
const { uploadFile } = require('../controllers/upload.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);
router.post('/', upload.single('file'), uploadFile);

module.exports = router;
