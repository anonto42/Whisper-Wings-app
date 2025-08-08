import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { PaymentSuccessPage, PyamentCancel, PyamentFailed } from '../../../shared/paymenTemplates';
import ApiError from '../../../errors/ApiError';
import { stripeWithKey } from '../../../util/stripe';
import { User } from './user.model';
import mongoose, { Types } from 'mongoose';
import { Subscription } from '../subscriptions/subscription.model';
import { Subscribed } from '../subscriptions/subscribed.model';

const createUser = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request | any, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const changeLanguage = catchAsync(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...languageData } = req.body;
    const result = await UserService.changeLanguageToDB(user, languageData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Language changed successfully',
      data: result,
    });
  }
);

const getLanguage = catchAsync(async (req: Request | any, res: Response) => {
  const user = req.user;
  const result = await UserService.getLanguageFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Language retrieved successfully',
    data: result,
  });
});

const subscribe = catchAsync(async (req: Request | any, res: Response) => {
  const user = req.user;

  const data = {
    id: user.id,
    planID: req.body.planID,
    protocall: req.protocol,
    host: req.get('host'),
  };

  const result = await UserService.subscribeToDB(data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscribed successfully',
    data: result,
  });
});

const paymentSuccess = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
 
  const { session_id } = req.query;
  if (!session_id) throw new ApiError(StatusCodes.BAD_REQUEST, "Session ID is required!");

  const session = await stripeWithKey.checkout.sessions.retrieve(session_id as string);
  if (!session) throw new ApiError(StatusCodes.NOT_FOUND, "Session was not found!");

  if (session.payment_status !== 'paid') {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Payment was not successful!");
  }
  const userId = session.metadata?.userID;

  const ObjId = new Types.ObjectId(userId);
  const user = await User.findById(ObjId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");

  if( !user.transictionID || user.transictionID === "" ) {
    return res.send(PyamentFailed);
  }

  if( user.transictionID != session_id ) {
    return res.send(PyamentFailed);
  }

  const subObj = new mongoose.Types.ObjectId( session.metadata?.plan_id );
  const subscription = await Subscription.findById(subObj);
  if (!subscription) throw new ApiError(StatusCodes.NOT_FOUND, "Subscription was not found!");
  
  const daysToAdd = subscription.type === "monthly" ? 30 : 365; 
  user.subscriptionDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

  user.transictionID = "";
  
  await user.save();

  await Subscribed.create({
    subscriptionId: subObj,
    userId: ObjId
  })

  return res.send(PaymentSuccessPage(subscription.price));

});

const paymentFailure = catchAsync(async (req: Request | any, res: Response, next: NextFunction) => {
  return res.send(PyamentCancel);
});

export const UserController = { createUser, getUserProfile, updateProfile, changeLanguage, getLanguage, subscribe, paymentFailure, paymentSuccess };
