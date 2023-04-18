const Report = require('../models/reportModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
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

exports.supportReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.body;

  //   1) Check if report exists
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError('Report does not exists', 404));
  }

  // 3) Check if supported already
  const isInArray = report.supportedBy.some(function(supportedBy) {
    return supportedBy.equals(req.user._id);
  });
  if (isInArray) {
    return next(new AppError('Already supported by user', 404));
  }

  //   5) Support Report
  report.supportedBy.push(req.user._id);
  report.supportCount += 1;

  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});

exports.unSupportReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.body;

  //   1) Check if report exists
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError('Report does not exists', 404));
  }

  // 3) Check if unSupported already
  const isInArray = report.supportedBy.some(function(notSupportedBy) {
    return notSupportedBy.equals(req.user._id);
  });
  if (!isInArray) {
    return next(
      new AppError(
        'You cannot unsupport this report. Please Support it first.',
        404
      )
    );
  }

  //   5) UnSupport Report
  report.supportedBy.remove(req.user._id);
  report.supportCount -= 1;

  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});

exports.requestReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.body;

  //   2) Check if report exists
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError('Report does not exists', 404));
  }

  if (report.status === 'resolved') {
    return next(new AppError('Report already resolved successfully', 404));
  }

  // 3) Check if report is assigned to someone
  const { assignedBy } = report.assignedInfo;
  if (assignedBy != null) {
    return next(
      new AppError('Report already assigned. You cannot request it', 404)
    );
  }

  // 4) Check if requested already
  const isInArray = report.requestedBy.some(function(requestedBy) {
    return requestedBy.equals(req.user._id);
  });
  if (isInArray) {
    return next(new AppError('Already requested by user', 404));
  }

  //   5) Request Report to cleaner
  report.requestedBy.push(req.user._id);

  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});

exports.requestCompletedReport = catchAsync(async (req, res, next) => {
  const { reportId } = req.body;

  //   1) Check if report exists
  const report = await Report.findById(reportId);
  if (!report) {
    return next(new AppError('Report does not exists', 404));
  }

  // 2) Check STatus
  if (report.status === 'resolved') {
    return next(new AppError('Report already resolved successfully', 404));
  }
  if (report.status === 'completed request') {
    return next(new AppError('You cannot make completed request again.', 404));
  }
  if (report.status !== 'assigned') {
    return next(
      new AppError(
        'Report not assigned to any cleaner. This request for completion of this report cannot be done.',
        404
      )
    );
  }

  // 2) Check if report is assigned to user
  const { assignedTo } = report.assignedInfo;
  if (!assignedTo._id.equals(req.user._id)) {
    return next(
      new AppError(
        'Report not assigned to you. You cannot request for completion of this report.',
        404
      )
    );
  }

  //   3) Completed Request Report to cleaner
  report.completedRequest = req.user._id;
  report.status = 'complete request';

  await report.save({ validateModifiedOnly: true });
  res.status(200).json({ status: 'success', report });
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

exports.getReportsResolvedByUser = catchAsync(async (req, res, next) => {
  const reports = await Report.find({
    'completedInfo.completedBy': req.user._id
  });

  res.status(201).json({
    status: 'success',
    result: reports.length,
    data: {
      assignedReports: reports
    }
  });
});

exports.reportRequestedUsers = catchAsync(async (req, res, next) => {
  const { reportId } = req.body;

  const report = await Report.findById(reportId)
    .populate('requestedBy')
    .select('requestedBy');

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.getReportsRequestedToUser = catchAsync(async (req, res, next) => {
  const reports = await Report.find({
    requestedBy: { $in: req.user._id }
  });

  res.status(201).json({
    status: 'success',
    result: reports.length,
    data: {
      requestedReports: reports
    }
  });
});

exports.assignReportToCleaner = catchAsync(async (req, res, next) => {
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

  // 3 Check if report is already assigned
  const { assignedBy } = report.assignedInfo;
  if (assignedBy != null) {
    return next(new AppError('Report already assigned', 404));
  }

  //   4) Assign Report to cleaner
  const assignedInfo = {
    assignedTo: cleanerId,
    assignedBy: req.user._id,
    assignedAt: Date.now()
  };

  report.assignedInfo = assignedInfo;
  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});

exports.approveReportRequest = catchAsync(async (req, res, next) => {
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

  if (report.status === 'resolved') {
    return next(new AppError('Report already resolved successfully', 404));
  }

  // 3) Check if report is assigned to someone
  const { assignedBy } = report.assignedInfo;
  if (assignedBy != null) {
    return next(
      new AppError(
        'Report already assigned to cleaner. You cannot approve it',
        404
      )
    );
  }

  // 4) Check if report is requested
  const isInArray = report.requestedBy.some(function(requestedBy) {
    return requestedBy.equals(cleanerId);
  });
  if (!isInArray) {
    return next(new AppError('Report not requested by cleaner', 404));
  }

  //   5) Approve Report Request to cleaner
  const assignedInfo = {
    assignedTo: cleanerId,
    assignedBy: req.user._id,
    assignedAt: Date.now()
  };

  report.assignedInfo = assignedInfo;
  report.status = 'assigned';
  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});

exports.approveCompletedRequest = catchAsync(async (req, res, next) => {
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

  // 3) Check Status
  if (report.status === 'resolved') {
    return next(new AppError('Report already resolved successfully', 404));
  }
  if (
    report.status !== 'completed request' ||
    report.completedRequest == null
  ) {
    return next(
      new AppError('Completed request is not done for this report.', 404)
    );
  }

  //   5) Approve Report Complete Request to cleaner
  const completedInfo = {
    completedBy: cleanerId,
    approvedBy: req.user._id,
    approvedAt: Date.now()
  };

  report.completedInfo = completedInfo;
  report.status = 'resolved';
  await report.save({ validateModifiedOnly: true });

  res.status(200).json({ status: 'success', report });
});
