import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidaton } from "./admin.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";


const router = Router();

router
    .route("/users")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.getUser
    )
    .patch(
        auth( USER_ROLES.ADMIN ),
        AdminController.blockUser
    )
    .put(
        auth( USER_ROLES.ADMIN ),
        AdminController.unBlockUser
    )
    .delete(
        auth( USER_ROLES.ADMIN ),
        AdminController.deletetUser
    )
 
router
    .route("/sherpas")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.allSherpes
    )
    .post(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.postUpload),
        AdminController.createSherpe
    )
    .put(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.sherpaUpload),
        AdminController.updateSherpe
    )
    .delete(
        auth( USER_ROLES.ADMIN ),
        AdminController.deleteSherpe
    )

router
    .route("/category")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.allCatagory
    )
    .post(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.catagoryUpload),
        AdminController.createCatagory
    )
    .put(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.updateCatagory),
        AdminController.updateCatagory
    )
    .delete(
        auth( USER_ROLES.ADMIN ),
        AdminController.deleteCatagory
    )

router
    .route("/whisper")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.allWhispers
    )
    .post(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.whisperUpload),
        AdminController.createWhisper
    )
    .put(
        auth( USER_ROLES.ADMIN ),
        fileUploadHandler(),
        validateRequest(AdminValidaton.whisperUpdate),
        AdminController.updateWhisper
    )
    .delete(
        auth( USER_ROLES.ADMIN ),
        AdminController.deleteWhisper
    )

router
    .route("/subscription")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.allSubscriptions
    )
    .post(
        auth( USER_ROLES.ADMIN ),
        validateRequest(AdminValidaton.subscriptionUpload),
        AdminController.createSubscription
    )
    .put(
        auth( USER_ROLES.ADMIN ),
        validateRequest(AdminValidaton.subscriptionUpdate),
        AdminController.updateSubscription
    )
    .delete(
        auth( USER_ROLES.ADMIN ),
        AdminController.deleteSubscription
    )

router
    .route("/subscriber")
    .get(
        auth( USER_ROLES.ADMIN ),
        AdminController.subscripers
    )


export const AdminRouter = router;