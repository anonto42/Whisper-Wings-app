import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import mongoose, { Types } from 'mongoose';
import { stripeWithKey } from '../../../util/stripe';
import { Subscription } from '../subscriptions/subscription.model';
import { Whisper } from '../whisper/whisper.model';
import { IWhisper } from '../whisper/whisper.interface';
import Stripe from 'stripe';

const createUserToDB = async (payload: Partial<IUser>): Promise<any> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate(
    { _id: createUser._id },
    { $set: { authentication } }
  );

  return {
    name: createUser.name,
    email: createUser.email,
    image: createUser.image,
  };
};

const getUserProfileFromDB = async ( 
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  
  const isExistUser = await User.isValidUser(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  }).select("-password -authentication -__v -createdAt -updatedAt -email -role -verified -status");

  return updateDoc;
};

const changeLanguageToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  }).select("-password -authentication -__v -createdAt -updatedAt -email -role -verified -status -favorites");

  return updateDoc;
};

const getLanguageFromDB = async (
  user: JwtPayload
): Promise<any> => {
  const { id } = user;

  const newOBjID = new Types.ObjectId(id);
  const isExistUser = await User.findById(newOBjID).lean().exec();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  return isExistUser.language;
};

const subscribeToDB = async (
  data: {
    id: string,
    planID: string,
    protocall: string,
    host: string,
  }
) => {
  const { id } = data;

  const objID = new mongoose.Types.ObjectId(id);
  const isExistUser = await User.findById(objID);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if ( isExistUser.subscriptionDate > new Date( Date.now() ) ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your subscription was not expired!");
  }

  const subscribtionOBJ = new mongoose.Types.ObjectId( data.planID  );
  const isExistSubscription = await Subscription.findById(subscribtionOBJ);
  if (!isExistSubscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Subscription doesn't exist!");
  }

  const session = await stripeWithKey.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: isExistSubscription.name,
          },
          unit_amount: isExistSubscription.price * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${data.protocall}://${data.host}/api/v1/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${data.protocall}://${data.host}/api/v1/user/payment/failure`,
    metadata: {
      userID: isExistUser._id.toString(),
      plan_id: isExistSubscription._id.toString(),
    },
  });

  isExistUser.transictionID = session.id;
  await isExistUser.save();

  return session.url;
};

const lovedToDB = async (
  user: JwtPayload,
  data: string
): Promise<boolean> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const objID = new mongoose.Types.ObjectId(data);
  const whisper = await Whisper.findById(objID);
  if (!whisper) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Whisper doesn't exist!");
  }

  if (isExistUser.favorites.includes(objID)) {
    
    isExistUser.favorites.pull(objID);
    await isExistUser.save();
    return false;

  } else {

    isExistUser.favorites.push(objID);
    await isExistUser.save();
    return true;
    
  }
};

const getLoved = async (
  user: JwtPayload
): Promise<any> => {
  const { id } = user;
  const objID = new mongoose.Types.ObjectId(id);
  const isExistUser = await User.findById(objID).populate("favorites");
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser.favorites;
};

const dataForGuest = async (
  data: {
    page: number,
    limit: number
  }
): Promise<any> => {

  const result = await Whisper.find()
    .skip((data.page - 1) * data.limit)
    .limit(data.limit);


  const formetedData = result.map( (item: IWhisper, index: number  ) => {

    if (index == 0) {
      return {
        isFree: index === 0 ? true : false,
        whisperName: item.whisperName,
        whisperCoverImage: item.whisperCoverImage,
        whisperCategory: item.whisperCategory,
        whisperSherpas: item.whisperSherpas,
        EnglishFile: item.EnglishFile,
        DeutschFile: item.DeutschFile,
        FrancaisFile: item.FrancaisFile,
        EspanolFile: item.EspanolFile,
        timer: item.timer,
        EnglishLRC: item.EnglishLRC,
        DeutschLRC: item.DeutschLRC,
        FrancaisLRC: item.FrancaisLRC,
        EspanolLRC: item.EspanolLRC,
      } 
    } else {
      return {
        isFree: index === 0 ? true : false,
        whisperName: item.whisperName,
        whisperCoverImage: item.whisperCoverImage,
        whisperCategory: item.whisperCategory,
        whisperSherpas: item.whisperSherpas,
      }
    }
    
  });

  return formetedData;
};

const getStory = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number,
    timer: string,
    whisperCategory: string,
  }    
): Promise<any> => {
  const { id } = payload;
  const objId = new mongoose.Types.ObjectId(id);
  const user = await User.findById(objId);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  if (!user.subscriptionDate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your subscription was not founded!");
  };

  if (user.subscriptionDate < new Date(Date.now())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your subscription was expired!");
  };
  let whisper;

  if ( data.timer == "0" ) {
      whisper = await Whisper.find({
      whisperCategory: data.whisperCategory,
    })
    .skip((data.page - 1) * data.limit)
    .limit(data.limit);
  } else {

    whisper = await Whisper.find({
      timer: data.timer,
      whisperCategory: data.whisperCategory,
    })
    .skip((data.page - 1) * data.limit)
    .limit(data.limit);

  }

  const DataWithLoved = whisper?.map( (item: any) => ({
    ...item._doc,
    loved: user.favorites.includes(item._id.toString()),
  }));

  return DataWithLoved;
};

//Web-Hook call

const webhook = async (event: Stripe.Event): Promise<void> => {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        
        const sessionData = event.data.object as Stripe.Checkout.Session;
        const {
          id: sessionId,
          payment_intent: paymentIntentId,
          metadata,
        } = sessionData;
        
 
        if (!paymentIntentId) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Payment Intent ID not found in session',
          );
        }
 
        const paymentIntent = await stripeWithKey.paymentIntents.retrieve(
          paymentIntentId as string,
        );
 
        break;
      }
 
      case 'checkout.session.async_payment_failed': {
       
        break;
      }
 
      default:
        return;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
  }
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  changeLanguageToDB,
  getLanguageFromDB,
  subscribeToDB,
  lovedToDB,
  getLoved,
  dataForGuest,
  getStory,
  webhook
};
