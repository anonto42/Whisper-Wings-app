import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AdminService } from "./admin.service";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiError";

const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    const {...paginate} = req.body;
    let result;
    if (!id) {
      result = await AdminService.allUsers(paginate);
    } else if ( id ) {
      result = await AdminService.AUser(id as string)
    }
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get user',
      data: result,
    });
  }
);

const deletetUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the id of the user to delete the user")
    }
    const result = await AdminService.deleteUser(id as string)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully delete the user',
      data: result,
    });
  }
);

const blockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the id of the user to block the user")
    }
    const result = await AdminService.blockUser(id as string)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully block the user',
      data: result,
    });
  }
);

const unBlockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the id of the user to unblock the user")
    }
    const result = await AdminService.unBlockUser(id as string)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully unblock the user',
      data: result,
    });
  }
);

const allSherpes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {...paginate} = req.body;
    const result = await AdminService.allSherpes(paginate)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get all sherpes',
      data: result,
    });
  }
);

const deleteSherpe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the id of the sherpe to delete the sherpe")
    }
    const result = await AdminService.deleteSherpa(id as string)

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully delete the sherpe',
      data: result,
    });
  }
);

const updateSherpe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const {...data} = req.body;
    
    const image = getSingleFilePath(req.files,'image');
    
    const finalData = {
      image,
      ...data
    }

    const result = await AdminService.updateSherpa(finalData)

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the sherpe',
      data: result,
    });
  }
);

const createSherpe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {...data} = req.body;
    const image = getSingleFilePath(req.files,'image');
    const finalData = {
      image,
      ...data
    }
    const result = await AdminService.createSherpa(finalData)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully create the sherpe',
      data: result,
    });
  }
);

const createCatagory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {...data} = req.body;
    const image = getSingleFilePath(req.files,'image');

    const finalData = {
      image,
      ...data
    }
    
    const result = await AdminService.createCatagory(finalData)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully create the catagory',
      data: result,
    });
  }
);

const updateCatagory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {...data} = req.body;
    const image = getSingleFilePath(req.files,'image');
    const finalData = {
      image,
      ...data
    }
    const result = await AdminService.updateCatagory(finalData)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the catagory',
      data: result,
    });
  }
);

const deleteCatagory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id;
    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the id of the catagory to delete the catagory")
    }
    const result = await AdminService.deleteCatagory(id as string)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully delete the catagory',
      data: result,
    });
  }
);

const allCatagory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const {...data} = req.body;

    const result = await AdminService.allCatagory(data)
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get all catagory',
      data: result,
    });
  }
);

export const AdminController = {
  getUser,
  blockUser,
  unBlockUser,
  deletetUser,
  createSherpe,
  updateSherpe,
  deleteSherpe,
  allSherpes,
  createCatagory,
  updateCatagory,
  deleteCatagory,
  allCatagory,
}