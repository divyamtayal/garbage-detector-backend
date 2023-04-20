const express = require('express');
const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router
  .route('/getAllUsers')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );

router
  .route('/getUser')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUser
  );

router.route('/').get(authController.protect, userController.myProfile);

module.exports = router;
