const { Router } = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const { createRoom, listRooms, getRoom, addMember } = require('../controllers/rooms.controller');

const router = Router();

router.use(requireAuth);
router.post('/', createRoom);
router.get('/', listRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/members', addMember);

module.exports = router;
