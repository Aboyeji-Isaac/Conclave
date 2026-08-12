const { Router } = require('express');
const requireAuth = require('../middlewares/auth.middleware');
const {
  promoteToDecision,
  listDecisions,
  searchDecisions,
} = require('../controllers/decisions.controller');

const router = Router();

router.use(requireAuth);
router.post('/', promoteToDecision);
router.get('/room/:roomId', listDecisions);
router.get('/room/:roomId/search', searchDecisions);

module.exports = router;
