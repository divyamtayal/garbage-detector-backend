const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const DustbinBot = require('./../models/dustbinBotModel');

exports.registerDustbinBot = catchAsync(async (req, res, next) => {
  const dustbinBot = await DustbinBot.create({
    name: req.body.name,
    description: req.body.description
  });

  res.status(201).json({
    status: 'success',
    data: {
      dustbinBot
    }
  });
});

exports.updateDustbinBotStatus = catchAsync(async (req, res, next) => {
  const dustbinBot = await DustbinBot.findById(req.body.id);
  if (!dustbinBot) {
    return next(new AppError('Dustbin Bot does not exists', 404));
  }

  dustbinBot.dustbinStatus.push({ perFilled: req.body.perFilled });
  const updatedDustbin = await dustbinBot.save({ validateModifiedOnly: true });

  res.status(201).json({
    status: 'success',
    data: {
      dustbinBot: updatedDustbin
    }
  });
});

exports.getAllDustbinBots = catchAsync(async (req, res, next) => {
  const data = await DustbinBot.find();

  res.status(201).json({
    status: 'success',
    length: data.length,
    data: data
  });
});

exports.getDustbinBot = catchAsync(async (req, res, next) => {
  const dustbinBot = await DustbinBot.findById(req.body.dustbinBotId);

  res.status(201).json({
    status: 'success',
    data: {
      dustbinBot
    }
  });
});
