const { Router } = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const { getRoomDigest } = require('../controllers/digest.controller');

const router = Router();

router.use(requireAuth);
router.get('/room/:roomId', getRoomDigest);

module.exports = router;
