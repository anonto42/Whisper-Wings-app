import { User } from "../user/user.model"
import ApiError from "../../../errors/ApiError"
import { StatusCodes } from "http-status-codes"
import { STATUS } from "../../../enums/user"
import { Sherpa } from "../sherpas/sherpas.model"
import { ISherpa } from "../sherpas/sharpas.interface"
import unlinkFile, { unlinkFileAsync } from "../../../shared/unlinkFile"
import { Category } from "../category/category.model"
import { TCategoryCreate, UploadCategory } from "./admin.type"
import { Whisper } from "../whisper/whisper.model"
import { IWhisper, IWhisperUpdate } from "../whisper/whisper.interface"
import mongoose from "mongoose"
import { ISubscription, IUpdateSubscription } from "../subscriptions/subscription.interface"
import { Subscription } from "../subscriptions/subscription.model"
import { Subscribed } from "../subscriptions/subscribed.model"
import { IWhisperPart } from "../whisper_part/part.whisper.interface"
import { whisperPart } from "../whisper_part/part.whisper.model"

const OverView = async () => {
  // Total users
  const totalUsers = await User.countDocuments();

  // Total audios (4x multiplier logic)
  const totalAudios = (await Whisper.countDocuments()) * 4;

  // Handle revenue when prices are stored as strings
  const totalRevenue = await Subscribed.find().populate("subscriptionId");
  const newData = totalRevenue.map((item: any) => {
    const price = item.subscriptionId.price? Number(item.subscriptionId.price) : 0;
    return isNaN(price) ? 0 : price;
  });
  const totalRevenueByReduce = newData.reduce((a, b) => a + b, 0);

  // Total subscriptions
  const totalSubscriptions = await Subscribed.countDocuments();

  // Helper: get subscriptions by month
  const getTotalSubscriptionsByMonth = async () => {
    const totalSubscriptions = await Subscribed.aggregate([
      {
        $lookup: {
          from: "subscriptions",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscriptionDetails",
        },
      },
      { $unwind: "$subscriptionDetails" },
      {
        $addFields: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalSales: {
            $sum: { $toDouble: "$subscriptionDetails.price" }, // convert string → number
          },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          monthlySales: {
            $push: {
              month: "$_id.month",
              totalSales: "$totalSales",
            },
          },
          totalRevenue: { $sum: "$totalSales" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          totalRevenue: 1,
          monthlySales: 1,
        },
      },
      { $sort: { year: 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const result = totalSubscriptions.map((yearData: any) => {
      const monthlyData = months.map((month, index) => {
        const monthSales = yearData.monthlySales.find(
          (sales: any) => sales.month === index + 1
        );
        return {
          month,
          totalSales: monthSales ? monthSales.totalSales : 0,
        };
      });

      return {
        year: yearData.year,
        totalRevenue: yearData.totalRevenue,
        monthlySales: monthlyData,
      };
    });

    return result;
  };

  // Helper: get user growth by month
  const getUserGrowthByMonth = async () => {
    const totalUsers = await User.aggregate([
      {
        $addFields: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          userCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          monthlyUserGrowth: {
            $push: {
              month: "$_id.month",
              userCount: "$userCount",
            },
          },
          totalUserGrowth: { $sum: "$userCount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          totalUserGrowth: 1,
          monthlyUserGrowth: 1,
        },
      },
      { $sort: { year: 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const result = totalUsers.map((yearData: any) => {
      const monthlyData = months.map((month, index) => {
        const monthGrowth = yearData.monthlyUserGrowth.find(
          (growth: any) => growth.month === index + 1
        );
        return {
          month,
          userCount: monthGrowth ? monthGrowth.userCount : 0,
        };
      });

      return {
        year: yearData.year,
        totalUserGrowth: yearData.totalUserGrowth,
        monthlyUserGrowth: monthlyData,
      };
    });

    return result;
  };

  const subscriptionsByMonth = await getTotalSubscriptionsByMonth();
  const userGrowthByMonth = await getUserGrowthByMonth();

  return {
    totalUsers,
    totalAudios,
    totalRevenue: totalRevenueByReduce,
    totalSubscriptions,
    subscriptionsByMonth,
    userGrowthByMonth,
  };
};

const allSherpes = async (
    paginate: {page: number, limit: number}
) => {
    return Sherpa.find()
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
}

const createSherpa = async (
    data: ISherpa
) => {
    const isExist = await Sherpa.findOne({title: data.title})
    if (isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Title already exist!")
    }
    const result = await Sherpa.create(data)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to create sherpa!")
    }
    return result
}

const updateSherpa = async (
    data: ISherpa
) => {
    try {
        const isExist = await Sherpa.findById(data.id)
        if (!isExist) {
            throw new ApiError(StatusCodes.BAD_REQUEST,"Sherpa not found!")
        }
        
        if (isExist) {
            unlinkFile(isExist.image);
        }
    
        const result = await Sherpa.findByIdAndUpdate(data.id,data,{new: true})
        if (!result) {
            throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to update sherpa!")
        }
    
        return result
        
    } catch (error) {
        unlinkFile(data.image);
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to update sherpa!")
    }
}

const deleteSherpa = async (
    id: string
) => {
    const result = await Sherpa.findByIdAndDelete(id)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Sherpa not found for delete!")
    }
    return result
}

const allUsers = async (
    paginate: {
        page: number, 
        limit: number
    }
) => {
    
    return User.find()
        .select("-password -otpVerification -__v -authentication")
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
}

const AUser = async (id: string) => {
    return User.findById(id).select("-password -otpVerification -authentication")
}

const deleteUser = async (id: string) => {
    const newOBjID = new mongoose.Types.ObjectId(id);
    const user = await User.findByIdAndDelete(newOBjID).select("-password");
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded!")
    }
    
    return user
}

const blockUser = async (id: string) => {
    const user = await User.findOneAndUpdate({_id: id},{ status: STATUS.BLOCKED }).select("-password");
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded!")
    }
    user.status = STATUS.BLOCKED;
    await user.save();
    return user
}

const unBlockUser = async ( id: string) => {
    const user = await User.findOneAndUpdate({_id: id},{ status: STATUS.ACTIVE }).select("-password");
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded!")
    }
    user.status = STATUS.ACTIVE;
    await user.save();
    return user
}

const allCatagory = async ( 
    data: { 
        page: number, 
        limit: number 
    }
) => {
    return Category.find()
        .skip((data.page - 1) * data.limit)
        .limit(data.limit)
}

const createCatagory = async ( data: TCategoryCreate ) => {
    
    const isExist = await Category.findOne({name: data.name})
    if (isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Name already exist!")
    }
    const result = await Category.create(data)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to create catagory!")
    }
    return result
}

const updateCatagory = async ( data: UploadCategory ) => {
    const isExist = await Category.findById(data.id)
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Catagory not found!")
    }
    if (isExist) {
        unlinkFile(isExist.image);
    }
    const result = await Category.findByIdAndUpdate(data.id,data,{new: true})
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to update catagory!")
    }
    return result
}

const deleteCatagory = async ( id: string ) => {
    const result = await Category.findByIdAndDelete(id)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Catagory not found for delete!")
    }
    return result
}

const allWhispers = async (
    paginate: {
        page: number, 
        limit: number
    }
) => {
    return await Whisper.find()
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
        .populate("parts", "-updatedAt -createdAt")
        .select("-updatedAt -__v -createdAt")
        .lean();
}

const createWhisper = async (
    data: IWhisper & 
        { 
            protocoll: string, 
            host: string 
        }
) => {
    try {

        const result = await Whisper.create(data);
        if (!result || !result.id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create whisper!");
        }

        //@ts-ignore
        delete result.createdAt
        //@ts-ignore
        delete result.updatedAt
        delete result.__v

        return result;
        
    } catch (error) {
        console.error("Error occurred while creating whisper:", error);
        
        // Clean up any files if necessary
        if (data.whisperCoverImage) {
            unlinkFile(data.whisperCoverImage);
        }
        // if (data.DeutschLRC) {
        //     try {
        //         await unlinkFileAsync(data.DeutschLRC); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.FrancaisLRC) {
        //     try {
        //         await unlinkFileAsync(data.FrancaisLRC); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.EspanolLRC) {
        //     try {
        //         await unlinkFileAsync(data.EspanolLRC); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.EnglishLRC) {
        //     try {
        //         await unlinkFileAsync(data.EnglishLRC); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.EnglishFile) {
        //     try {
        //         await unlinkFileAsync(data.EnglishFile); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.DeutschFile) {
        //     try {
        //         await unlinkFileAsync(data.DeutschFile); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.FrancaisFile) {
        //     try {
        //         await unlinkFileAsync(data.FrancaisFile); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }
        // if (data.EspanolFile) {
        //     try {
        //         await unlinkFileAsync(data.EspanolFile); 
        //     } catch (err) {
        //         console.error("Failed to delete audio file:", err);
        //     }
        // }

        // Handle failure and throw an error
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create whisper!");
    }
}

const createWhisperPart = async (
    data: IWhisperPart
) => {

    const mainWhisper = await Whisper.findById( new mongoose.Types.ObjectId(data.parent_id));
    if (!mainWhisper) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Your main Whisper Not founded!"
        )
    }

    data.DeutschLRC = `/lrc${data.DeutschLRC}`;
    data.EnglishLRC = `/lrc${data.EnglishLRC}`;
    data.FrancaisLRC = `/lrc${data.FrancaisLRC}`;
    data.EspanolLRC = `/lrc${data.EspanolLRC}`;

    const whisper = await whisperPart.create( data );
    
    mainWhisper.parts.push(whisper._id);
    await mainWhisper.save()
    
    return whisper
}

const updateWhisper = async (data: IWhisperUpdate & { protocoll: string }) => {
    if( 
        !data.whisperName || 
        !data.whisperSherpas || 
        !data.whisperCategory || 
        !data.whisperCoverImage
        // !data.EnglishFile || 
        // !data.DeutschFile || 
        // !data.FrancaisFile || 
        // !data.EspanolFile || 
        // !data.EnglishLRC || 
        // !data.DeutschLRC || 
        // !data.FrancaisLRC || 
        // !data.EspanolLRC
    ){
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!");
    }
    
    const objid = new mongoose.Types.ObjectId(data.id);
    const result = await Whisper.findById(objid);
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update whisper!");
    }

    try {
        // Update cover image if changed
        if (data.whisperCoverImage !== result.whisperCoverImage) {
            if (result.whisperCoverImage) {
                await unlinkFileAsync(result.whisperCoverImage).catch(console.error);
            }
            result.whisperCoverImage = data.whisperCoverImage;
        }

        // Update English file and LRC if changed
        // if (data.EnglishFile !== result.EnglishFile) {
        //     if (result.EnglishFile) {
        //         await unlinkFileAsync(result.EnglishFile).catch(console.error);
        //     }
        //     result.EnglishFile = data.EnglishFile;
        // }
        // if (data.EnglishLRC !== result.EnglishLRC) {
        //     if (result.EnglishLRC) {
        //         await unlinkFileAsync(result.EnglishLRC).catch(console.error);
        //     }
        //     result.EnglishLRC = data.EnglishLRC ? `/lrc${data.EnglishLRC}` : '';
        // }

        // // Update Deutsch file and LRC if changed
        // if (data.DeutschFile !== result.DeutschFile) {
        //     if (result.DeutschFile) {
        //         await unlinkFileAsync(result.DeutschFile).catch(console.error);
        //     }
        //     result.DeutschFile = data.DeutschFile;
        // }
        // if (data.DeutschLRC !== result.DeutschLRC) {
        //     if (result.DeutschLRC) {
        //         await unlinkFileAsync(result.DeutschLRC).catch(console.error);
        //     }
        //     result.DeutschLRC = data.DeutschLRC ? `/lrc${data.DeutschLRC}` : '';
        // }

        // // Update Francais file and LRC if changed
        // if (data.FrancaisFile !== result.FrancaisFile) {
        //     if (result.FrancaisFile) {
        //         await unlinkFileAsync(result.FrancaisFile).catch(console.error);
        //     }
        //     result.FrancaisFile = data.FrancaisFile;
        // }
        // if (data.FrancaisLRC !== result.FrancaisLRC) {
        //     if (result.FrancaisLRC) {
        //         await unlinkFileAsync(result.FrancaisLRC).catch(console.error);
        //     }
        //     result.FrancaisLRC = data.FrancaisLRC ? `/lrc${data.FrancaisLRC}` : '';
        // }

        // // Update Espanol file and LRC if changed
        // if (data.EspanolFile !== result.EspanolFile) {
        //     if (result.EspanolFile) {
        //         await unlinkFileAsync(result.EspanolFile).catch(console.error);
        //     }
        //     result.EspanolFile = data.EspanolFile;
        // }
        // if (data.EspanolLRC !== result.EspanolLRC) {
        //     if (result.EspanolLRC) {
        //         await unlinkFileAsync(result.EspanolLRC).catch(console.error);
        //     }
        //     result.EspanolLRC = data.EspanolLRC ? `/lrc${data.EspanolLRC}` : '';
        // }

        // Update other fields
        if (data.whisperName !== result.whisperName) {
            result.whisperName = data.whisperName;
        }

        if (data.whisperSherpas !== result.whisperSherpas) {
            result.whisperSherpas = data.whisperSherpas;
        }

        if (data.whisperCategory !== result.whisperCategory) {
            result.whisperCategory = data.whisperCategory;
        }

        const updatedWhisper = await result.save();
        return updatedWhisper;
    } catch (error) {
        console.error("Error occurred while updating whisper:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update whisper!");
    }
}

const updateWhisperPart = async (
  data: Partial<IWhisperPart> & { protocoll: string; _id: string }
) => {
  const objId = new mongoose.Types.ObjectId(data._id);
  const result = await whisperPart.findById(objId) as any;

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Whisper not found!");
  }

  if ( data.part ) result.part = data.part;
 
  try {
    // Supported languages
    const languages = ["English", "Deutsch", "Francais", "Espanol"];

    for (const lang of languages) {
      const fileKey = `${lang}File` as keyof IWhisperPart;
      const lrcKey = `${lang}LRC` as keyof IWhisperPart;

      // ✅ Only update if new File is provided
      if (data[fileKey] !== undefined && data[fileKey] !== result[fileKey]) {
        if (result[fileKey]) {
          await unlinkFileAsync(result[fileKey] as string).catch(console.error);
        }
        result[fileKey] = data[fileKey]!;
      }

      // ✅ Only update if new LRC is provided
      if (data[lrcKey] !== undefined && data[lrcKey] !== result[lrcKey]) {
        if (result[lrcKey]) {
          await unlinkFileAsync(result[lrcKey] as string).catch(console.error);
        }
        result[lrcKey] = data[lrcKey] ? `/lrc${data[lrcKey]}` : "";
      }
    }

    const updatedWhisper = await result.save();
    return updatedWhisper;
  } catch (error) {
    console.error("Error occurred while updating whisper:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update whisper!"
    );
  }
}

const deleteWhisper = async (id: string) => {

    const objID = new mongoose.Types.ObjectId(id)

    const result = await Whisper.findByIdAndDelete(objID)
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"Whisper not found for delete!")
    }
    unlinkFile(result.whisperCoverImage);

    const whisperPrts = await whisperPart.find({ parent_id: result._id }).lean();

    if (whisperPrts.length > 0 ) {
      whisperPrts.forEach( async ( e: any ) => {
        await unlinkFileAsync(e.EnglishFile);
        await unlinkFileAsync(e.DeutschFile);
        await unlinkFileAsync(e.FrancaisFile);
        await unlinkFileAsync(e.EspanolFile);
        await unlinkFileAsync(e.EnglishLRC);
        await unlinkFileAsync(e.DeutschLRC);
        await unlinkFileAsync(e.FrancaisLRC);
        await unlinkFileAsync(e.EspanolLRC);
      })
    }
    return result
}

const deleteWhisperPart = async (id: string) => {

    const objID = new mongoose.Types.ObjectId(id)

    const result = await whisperPart.findByIdAndDelete(objID)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Whisper Prt not found for delete!")
    }
    
    await unlinkFileAsync(result.EnglishFile);
    await unlinkFileAsync(result.DeutschFile);
    await unlinkFileAsync(result.FrancaisFile);
    await unlinkFileAsync(result.EspanolFile);
    await unlinkFileAsync(result.EnglishLRC);
    await unlinkFileAsync(result.DeutschLRC);
    await unlinkFileAsync(result.FrancaisLRC);
    await unlinkFileAsync(result.EspanolLRC);
    return result
}

const createSubscription = async (data: ISubscription) => {
    const result = await Subscription.create(data)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to create subscription!")
    }
    return result
}

const updateSubscription = async (data: IUpdateSubscription) => {
    const result = await Subscription.findByIdAndUpdate(data.id,data,{new: true})
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to update subscription!")
    }
    return result
}

const deleteSubscription = async (id: string) => {
    const objId = new mongoose.Types.ObjectId(id)
    
    const result = await Subscription.findByIdAndUpdate(objId,{ isDeleted: true },{new: true})
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"Subscription not found fordelete!")
    }

    return result
}

const allSubscriptions = async (paginate: {page: number, limit: number}) => {
    return Subscription.find({ isDeleted: false })
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
        .lean();
}

const allSubscribers = async (paginate: {page: number, limit: number}) => {
    return Subscribed.find()
        .populate("subscriptionId")
        .populate({
            path: "userId",
            select: "name email image language"
        })
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
        .lean();
}

const ASubscriber = async (id: string) => {
    const objId = new mongoose.Types.ObjectId(id)
    return Subscribed.findById(objId).lean();
}

export const AdminService = {
    allUsers, updateWhisperPart,
    AUser, createWhisperPart,
    deleteWhisperPart,
    deleteUser,
    blockUser,
    unBlockUser,
    allSherpes,
    createSherpa,
    updateSherpa,
    deleteSherpa,
    allCatagory,
    createCatagory,
    updateCatagory,
    deleteCatagory,
    allWhispers,
    createWhisper,
    updateWhisper,
    deleteWhisper,
    allSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    allSubscribers,
    ASubscriber,
    OverView
}