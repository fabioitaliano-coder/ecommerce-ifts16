const express = require('express');
const router = express.Router();
const controller = require('../controllers/checkoutController');

router.post('/', controller.create);

module.exports = router;
