/**
 * Created by Brisy on 2017/6/2.
 */
'use strict';

const express = require('express');
const router = express.Router();

router.use('/restaurant', require('../api/restaurant'));
router.use('/menu', require('../api/menu'));
router.use('/dish', require('../api/dish'));
router.use('/order', require('../api/order'));
router.use('/user', require('../api/user'));
router.use('/admin', require('../api/admin'));





















module.exports = router;