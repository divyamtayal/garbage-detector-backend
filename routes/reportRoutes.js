const express = require('express');
const authController = require('./../controllers/authController');
const reportController = require('./../controllers/reportController');

const router = express.Router();

router.post(
  '/createReport',
  authController.protect,
  reportController.createReport
);

router
  .route('/assignReportToCleaner')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.asiignReportToCleaner
  );

router
  .route('/getAllReports')
  .get(authController.protect, reportController.getAllReports);

router
  .route('/reportsCreated')
  .get(authController.protect, reportController.getReportsCreatedByUser);

router
  .route('/reportsAssigned')
  .get(authController.protect, reportController.getReportsAssignedToUser);

module.exports = router;
