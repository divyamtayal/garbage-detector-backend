const express = require('express');
const authController = require('./../controllers/authController');
const reportController = require('./../controllers/reportController');

const router = express.Router();

router.post(
  '/createReport',
  authController.protect,
  reportController.createReport
);

router.post(
  '/supportReport',
  authController.protect,
  reportController.supportReport
);

router.post(
  '/unSupportReport',
  authController.protect,
  reportController.unSupportReport
);

router
  .route('/getAllReports')
  .get(authController.protect, reportController.getAllReports);

router
  .route('/reportsCreated')
  .get(authController.protect, reportController.getReportsCreatedByUser);

// ADMIN
// router
//   .route('/assignReportToCleaner')
//   .post(
//     authController.protect,
//     authController.restrictTo('admin'),
//     reportController.assignReportToCleaner
//   );

router
  .route('/approveReportRequest')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.approveReportRequest
  );

router
  .route('/approveReportCompletedRequest')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.approveCompletedRequest
  );

router
  .route('/reportRequestedUsers')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    reportController.reportRequestedUsers
  );

// CLEANER
router
  .route('/requestReport')
  .post(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.requestReport
  );

router
  .route('/requestCompletedReport')
  .post(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.requestCompletedReport
  );

router
  .route('/reportsAssigned')
  .get(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.getReportsAssignedToUser
  );

router
  .route('/reportsRequested')
  .get(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.getReportsRequestedToUser
  );

router
  .route('/reportsResolved')
  .get(
    authController.protect,
    authController.restrictTo('cleaner'),
    reportController.getReportsResolvedByUser
  );

module.exports = router;
