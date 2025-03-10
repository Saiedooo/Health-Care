const express = require('express');
const router = express.Router();

const {
  getPendingAccounts,
  activeAccount,
} = require('../services/adminActivateServices');

const { protect, allowedTo } = require('../services/authServices');

router.use(protect);
router.use(allowedTo('admin'));

router.get('/pendingAccounts', getPendingAccounts);

router.put('/activateAccount/:id', activeAccount);
module.exports = router;
