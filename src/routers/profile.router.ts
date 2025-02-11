import { Router } from "express";
import { profileController } from "../controllers";
import { validateReqBody, validateReqQuery } from "../middlewares";
import { accountDeletionQuerySchema, userUpdateSchema } from "../schemas";



export const router = Router();


// API to view Profile
router.get('/', profileController.readMyProfile);

// API to update profile
router.put('/', validateReqBody(userUpdateSchema), profileController.updateProfile);

//API to request verification otp for account deletion
router.post('/delete', profileController.profileDeleteRequest);

// API to delete account by otp verification
router.delete('/', validateReqQuery(accountDeletionQuerySchema), profileController.verifyAndDeleteProfile);