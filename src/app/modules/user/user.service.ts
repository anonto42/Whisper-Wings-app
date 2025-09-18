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
  let createUser;

  const isUserExist = await User.findOne({ email: payload.email });
  if (isUserExist) {
    
    //send email
    const otp = generateOTP();
    const values = {
      name: isUserExist.name,
      otp: otp,
      email: isUserExist.email!,
    };
    
    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 5 * 60000),
      isResetPassword: false,
    };

    isUserExist.password = payload.password!;
    isUserExist.authentication = authentication;
    await isUserExist.save();

    return {
      message: "Otp send successfully on your email!",
      statusCode: 409,
      user:{
        name: isUserExist.name,
        email: isUserExist.email,
        image: isUserExist.image,
        isVerified: isUserExist.verified,
      }
    };

  } else {
    createUser = await User.create(payload);
    if (!createUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
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
  
  const isExistUser = await User.findById(new mongoose.Types.ObjectId(id));
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  if ( ( isExistUser.currentSubscription && isExistUser.subscriptionDate ) && isExistUser.subscriptionDate < new Date( Date.now() ) ) {
    isExistUser.currentSubscription = null;
    isExistUser.subscriptionDate = null;
    await isExistUser.save();
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
          unit_amount: Number(isExistSubscription.price) * 100,
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
    limit: number,
    timer: string,
    whisperCategory: string,
  }
): Promise<any> => {

  // Define filter conditions based on category and timer
  const filterConditions: any = {};

  if (data.whisperCategory) {
    filterConditions.whisperCategory = data.whisperCategory;
  }

  if (data.timer) {
    filterConditions.timer = data.timer;
  }

  // If there are any filter conditions, apply them, otherwise return random data
  const result = filterConditions.whisperCategory || filterConditions.timer 
    ? await Whisper.find(filterConditions)
      .skip((data.page - 1) * data.limit)
      .populate("parts","-createdAt -updatedAt -__v")
      .limit(data.limit)
    : await Whisper.aggregate([{ $sample: { size: data.limit } }]);


  const formetedData = result.map((item: IWhisper, index: number) => {
    // Return different formats based on the index
    return {
      isFree: index === 0 ? true : false,
      _id: item._id,
      whisperName: item.whisperName,
      whisperCoverImage: item.whisperCoverImage,
      whisperCategory: item.whisperCategory,
      whisperSherpas: item.whisperSherpas,
      ...(index === 0 ? {
        parts: item.parts
      } : {})
    };
  });

  return formetedData;
};

const getStory = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number,
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

  const whisper = await Whisper.find({
      whisperCategory: data.whisperCategory,
    })
    .skip((data.page - 1) * data.limit)
    .populate("parts","-__v -createdAt -updatedAt")
    .select("-createdAt -updatedAt -__v")
    .limit(data.limit)
    .lean();


  const DataWithLoved = whisper?.map( (item: any) => ({
    ...item,
    loved: user.favorites.includes(item._id.toString()),
  }));

  return DataWithLoved;
};

const currentSubscription = async(
  user: JwtPayload
): Promise<any> => {

  const { id } = user;

  const objID = new mongoose.Types.ObjectId(id);
  const isExistUser = await User.findById(objID).populate("currentSubscription").lean().exec();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.currentSubscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Your subscription was not founded!");
  }

  return isExistUser.currentSubscription;
}

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
  webhook,
  currentSubscription
};
