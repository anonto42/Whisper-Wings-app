import { JwtPayload } from "jsonwebtoken"
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
import axios from "axios"
import config from "../../../config"

const OverView = async () =>{

    const totalUsers = await User.countDocuments();
    const totalAudios = ( await Whisper.countDocuments() * 4 );
    const totalRevenue = await Subscribed.find().populate("subscriptionId");
    const newData = totalRevenue.map( ( item: any ) => item.subscriptionId.price);
    const totalRevenueByReduce = newData.reduce((a: number, b: number) => a + b, 0);

    const totalSubscriptions = await Subscribed.countDocuments();

    const getTotalSubscriptionsByMonth = async () => {
        const totalSubscriptions = await Subscribed.aggregate([
          {
            $lookup: {
              from: 'subscriptions', 
              localField: 'subscriptionId', 
              foreignField: '_id', 
              as: 'subscriptionDetails'
            }
          },
          {
            $unwind: "$subscriptionDetails" 
          },
          {
            $addFields: {
              year: { $year: "$createdAt" }, 
              month: { $month: "$createdAt" } 
            }
          },
          {
            $group: {
              _id: {
                year: "$year", 
                month: "$month" 
              },
              totalSales: { $sum: "$subscriptionDetails.price" } 
            }
          },
          {
            $group: {
              _id: "$_id.year", 
              monthlySales: {
                $push: {
                  month: "$_id.month", 
                  totalSales: "$totalSales"
                }
              },
              totalRevenue: { $sum: "$totalSales" }
            }
          },
          {
            $project: {
              _id: 0,
              year: "$_id",
              totalRevenue: 1,
              monthlySales: 1
            }
          },
          {
            $sort: { year: 1 }
          }
        ]);
      
        const months = [
          "January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"
        ];
      
        const result = totalSubscriptions.map((yearData: any) => {
          const monthlyData = months.map((month, index) => {
            const monthSales = yearData.monthlySales.find((sales: any) => sales.month === index + 1);
            return {
              month,
              totalSales: monthSales ? monthSales.totalSales : 0
            };
          });
      
          return {
            year: yearData.year,
            totalRevenue: yearData.totalRevenue,
            monthlySales: monthlyData
          };
        });
      
        return result;
    };

    const getUserGrowthByMonth = async () => {
        const totalUsers = await User.aggregate([
          {
            $addFields: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            }
          },
          {
            $group: {
              _id: {
                year: "$year", 
                month: "$month" 
              },
              userCount: { $sum: 1 } 
            }
          },
          {
            $group: {
              _id: "$_id.year", 
              monthlyUserGrowth: {
                $push: {
                  month: "$_id.month", 
                  userCount: "$userCount" 
                }
              },
              totalUserGrowth: { $sum: "$userCount" } 
            }
          },
          {
            $project: {
              _id: 0,
              year: "$_id", 
              totalUserGrowth: 1, 
              monthlyUserGrowth: 1 
            }
          },
          {
            $sort: { year: 1 } 
          }
        ]);
      
        const months = [
          "January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"
        ];
      
        const result = totalUsers.map((yearData: any) => {
          const monthlyData = months.map((month, index) => {
            const monthGrowth = yearData.monthlyUserGrowth.find((growth: any) => growth.month === index + 1);
            return {
              month,
              userCount: monthGrowth ? monthGrowth.userCount : 0 
            };
          });
      
          return {
            year: yearData.year,
            totalUserGrowth: yearData.totalUserGrowth, 
            monthlyUserGrowth: monthlyData 
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
        userGrowthByMonth
    }
}

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

const allUsers = async (paginate: {page: number, limit: number}) => {
    
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

const allCatagory = async ( data:{ page: number, limit: number }) => {
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

const allWhispers = async (paginate: {page: number, limit: number}) => {
    return await Whisper.find()
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
}

const createWhisper = async (data: IWhisper & { protocoll: string, host: string }) => {
    try {

        // const EnglishLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.EnglishFile});

        // const DeutschLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.DeutschFile});
        
        // const FrancaisLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.FrancaisFile});
        
        // const EspanolLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.EspanolFile});

        // data.DeutschLRC = DeutschLRC.data.lrc_file;
        // data.FrancaisLRC = FrancaisLRC.data.lrc_file;
        // data.EspanolLRC = EspanolLRC.data.lrc_file;
        // data.EnglishLRC = EnglishLRC.data.lrc_file;

        const result = await Whisper.create(data);
        if (!result || !result.id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create whisper!");
        }
        return result;
        
    } catch (error) {
        console.error("Error occurred while creating whisper:", error);
        
        // Clean up any files if necessary
        if (data.whisperCoverImage) {
            unlinkFile(data.whisperCoverImage);
        }
        if (data.DeutschFile) {
            try {
                await unlinkFileAsync(data.DeutschFile); 
            } catch (err) {
                console.error("Failed to delete audio file:", err);
            }
        }
        if (data.FrancaisFile) {
            try {
                await unlinkFileAsync(data.FrancaisFile); 
            } catch (err) {
                console.error("Failed to delete audio file:", err);
            }
        }
        if (data.EspanolFile) {
            try {
                await unlinkFileAsync(data.EspanolFile); 
            } catch (err) {
                console.error("Failed to delete audio file:", err);
            }
        }
        if (data.EnglishFile) {
            try {
                await unlinkFileAsync(data.EnglishFile); 
            } catch (err) {
                console.error("Failed to delete audio file:", err);
            }
        }

        // Handle failure and throw an error
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create whisper!");
    }
}

const updateWhisper = async (data: IWhisperUpdate & { protocoll: string }) => {

    if( 
        !data.whisperName || 
        !data.whisperSherpas || 
        !data.whisperCategory || 
        !data.whisperCoverImage || 
        !data.EnglishFile || 
        !data.DeutschFile || 
        !data.FrancaisFile || 
        !data.EspanolFile
    ){
        throw new ApiError(StatusCodes.BAD_REQUEST,"All fields are required!")
    }
    
    const objid = new mongoose.Types.ObjectId(data.id)
    const result = await Whisper.findById(objid)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Failed to update whisper!")
    }

    if( data.whisperCoverImage != result.whisperCoverImage ){
        result.whisperCoverImage = data.whisperCoverImage;
        
        unlinkFile(result.whisperCoverImage);
    }

    if( data.EnglishFile != result.EnglishFile ){
        result.EnglishFile = data.EnglishFile;

        const EnglishLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.EnglishFile});

        result.EnglishLRC = EnglishLRC.data.lrc_file;

        await unlinkFileAsync(result.EnglishFile);
    }

    if( data.DeutschFile !== result.DeutschFile ){
        result.DeutschFile = data.DeutschFile;

        const DeutschLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.DeutschFile});

        result.DeutschLRC = DeutschLRC.data.lrc_file;

        await unlinkFileAsync(result.DeutschFile);
    }

    if( data.FrancaisFile !== result.FrancaisFile ){
        result.FrancaisFile = data.FrancaisFile;

        const FrancaisLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.FrancaisFile});

        result.FrancaisLRC = FrancaisLRC.data.lrc_file;

        await unlinkFileAsync(result.FrancaisFile);
    }

    if( data.EspanolFile !== result.EspanolFile ){
        result.EspanolFile = data.EspanolFile;

        const EspanolLRC = await axios.post(`${data.protocoll}://${config.ip_address}:${config.python_port}/uploadfile`, {fileName: data.EspanolFile});

        result.EspanolLRC = EspanolLRC.data.lrc_file;

        await unlinkFileAsync(result.EspanolFile);
    }

    if (data.whisperName !== result.whisperName) {
        result.whisperName = data.whisperName;
    }

    if (data.whisperSherpas !== result.whisperSherpas) {
        result.whisperSherpas = data.whisperSherpas;
    }

    if (data.whisperCategory !== result.whisperCategory) {
        result.whisperCategory = data.whisperCategory;
    }

    await result.save();

    return result;
}

const deleteWhisper = async (id: string) => {

    const objID = new mongoose.Types.ObjectId(id)

    const result = await Whisper.findByIdAndDelete(objID)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Whisper not found for delete!")
    }

    unlinkFile(result.whisperCoverImage);
    
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
    
    const result = await Subscription.findByIdAndDelete(objId)
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Subscription not found for delete!")
    }

    return result
}

const allSubscriptions = async (paginate: {page: number, limit: number}) => {
    return Subscription.find()
        .skip((paginate.page - 1) * paginate.limit)
        .limit(paginate.limit)
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
}

const ASubscriber = async (id: string) => {
    const objId = new mongoose.Types.ObjectId(id)
    return Subscribed.findById(objId)
}

export const AdminService = {
    allUsers,
    AUser,
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