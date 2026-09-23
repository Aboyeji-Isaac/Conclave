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
router.get('/', listDecisions);                           // cross-room (optional ?roomId= filter)
router.get('/room/:roomId', (req, res, next) => {         // backward-compatible room-scoped
  req.query.roomId = req.params.roomId;
  return listDecisions(req, res, next);
});
router.get('/room/:roomId/search', searchDecisions);

module.exports = router;
