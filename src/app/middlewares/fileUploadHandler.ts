import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'whisperCoverImage':
          uploadDir = path.join(baseUploadDir, 'whisperCoverImage');
          break;
        case 'FrancaisFile':
          uploadDir = path.join(baseUploadDir, 'FrancaisFile');
          break;
        case 'EspanolFile':
          uploadDir = path.join(baseUploadDir, 'EspanolFile');
          break;
        case 'DeutschFile':
          uploadDir = path.join(baseUploadDir, 'DeutschFile');
          break;
        case 'EnglishFile':
          uploadDir = path.join(baseUploadDir, 'EnglishFile');
          break;
        case 'EnglishLRC':
          uploadDir = path.join(baseUploadDir, 'lrc/EnglishLRC');
          break;
        case 'DeutschLRC':
          uploadDir = path.join(baseUploadDir, 'lrc/DeutschLRC');
          break;
        case 'FrancaisLRC':
          uploadDir = path.join(baseUploadDir, 'lrc/FrancaisLRC');
          break;
        case 'EspanolLRC':
          uploadDir = path.join(baseUploadDir, 'lrc/EspanolLRC');
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          // .split(' ')
          // .join('-')
        // '-'
        // Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (file.fieldname === 'image') {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg file supported'
          )
        );
      }
    } else if (file.fieldname === 'whisperCoverImage') {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg file supported'
          )
        );
      }
    } else if (file.fieldname === 'EnglishFile') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'DeutschFile') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'FrancaisFile') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'EspanolFile') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'EnglishLRC') {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (fileExtension === 'lrc') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .lrc files are supported'
          )
        );
      }
    } else if (file.fieldname === 'FrancaisLRC') {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (fileExtension === 'lrc') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .lrc files are supported'
          )
        );
      }
    } else if (file.fieldname === 'DeutschLRC') {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (fileExtension === 'lrc') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .lrc files are supported'
          )
        );
      }
    } else if (file.fieldname === 'EspanolLRC') {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      if (fileExtension === 'lrc') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .lrc files are supported'
          )
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 3 },
    { name: 'whisperCoverImage', maxCount: 1 },
    { name: 'EnglishFile', maxCount: 1 },
    { name: 'DeutschFile', maxCount: 1 },
    { name: 'FrancaisFile', maxCount: 1 },
    { name: 'EspanolFile', maxCount: 1 },
    { name: 'doc', maxCount: 3 },
    { name: 'EnglishLRC', maxCount: 1 },
    { name: 'DeutschLRC', maxCount: 1 },
    { name: 'FrancaisLRC', maxCount: 1 },
    { name: 'EspanolLRC', maxCount: 1 },
  ]);
  return upload;
};

export default fileUploadHandler;
