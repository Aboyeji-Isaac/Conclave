const { Router } = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const { getMe, updateProfile, listUsers, deleteMe } = require('../controllers/users.controller');

const router = Router();

router.use(requireAuth);
router.get('/me', getMe);
router.patch('/me', updateProfile);
router.delete('/me', deleteMe);
router.get('/', listUsers);

module.exports = router;
