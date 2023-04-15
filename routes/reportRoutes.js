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
    reportController.assignReportToCleaner
  );

router
  .route('/requestReport')
  .post(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.requestReport
  );

router
  .route('/approveReportRequest')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.approveReportRequest
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

router
  .route('/reportsRequested')
  .get(authController.protect, reportController.getReportsRequestedToUser);

module.exports = router;
