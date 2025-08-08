import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getUserProfile)
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );

router
  .route("/change-language")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getLanguage)
  .patch(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.changeLanguage);

router
  .route("/subscribe")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER), 
    UserController.subscribe
  );

router
  .route("/payment/success")
  .get(UserController.paymentSuccess);

router
  .route("/payment/failure")
  .get(UserController.paymentFailure);
  

export const UserRoutes = router;
