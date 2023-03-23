const Report = require('../models/reportModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.createReport = catchAsync(async (req, res, next) => {
  const createdInfo = {
    createdBy: req.user._id,
    createdAt: Date.now()
  };
  req.body.createdInfo = createdInfo;
  const newReport = await Report.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      report: newReport
    }
  });
});

// Restricted to admin only
exports.getAllReports = catchAsync(async (req, res, next) => {
  const reports = await Report.find();

  res.status(201).json({
    status: 'success',
    result: reports.length,
    data: {
      reports
    }
  });
});

exports.getReportsCreatedByUser = catchAsync(async (req, res, next) => {
  const reports = await Report.find({ 'createdInfo.createdBy': req.user._id });

  res.status(201).json({
    status: 'success',
    result: reports.length,
    data: {
      createdReports: reports
    }
  });
});

exports.getReportsAssignedToUser = catchAsync(async (req, res, next) => {
  const reports = await Report.find({
    'assignedInfo.assignedTo': req.user._id
  });

  res.status(201).json({
    status: 'success',
    result: reports.length,
    data: {
      assignedReports: reports
    }
  });
});

exports.asiignReportToCleaner = catchAsync(async (req, res, next) => {
  const { cleanerId, reportId } = req.body;

  // 1) Check if cleaner exists
  const cleaner = await User.findById(cleanerId);
  if (!cleaner) {
    return next(new AppError('Cleaner no longer exists.', 404));
  }

  //   2) Check if report exists
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError('Report does not exists', 404));
  }

  //   3) Assign Report to cleaner
  const assignedInfo = {
    assignedTo: cleanerId,
    assignedBy: req.user._id,
    assignedAt: Date.now()
  };

  report.assignedInfo = assignedInfo;
  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});
