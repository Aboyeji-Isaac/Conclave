const { Router } = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const { createTask, listTasks, updateTaskStatus } = require('../controllers/tasks.controller');

const router = Router();

router.use(requireAuth);
router.post('/', createTask);
router.get('/room/:roomId', listTasks);
router.patch('/:taskId/status', updateTaskStatus);

module.exports = router;
