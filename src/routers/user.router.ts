import { Router } from "express";
import { roleAuth, validateReqBody, validateReqQuery } from "../middlewares";
import { createUserSchema, userFilterQuerySchema, userUpdateSchema } from "../schemas";
import { Roles } from "../enums";
import { userController } from "../controllers";



export const router = Router();


// API to create user by admin
router.post('/', roleAuth(Roles.ADMIN), validateReqBody(createUserSchema), userController.createUser);

// API to fetch users by admin(included filter, serach, sort and pagenation)
router.get('/', roleAuth(Roles.ADMIN), validateReqQuery(userFilterQuerySchema), userController.readAllUsers);

// API to update user by admin
router.put('/:id', roleAuth(Roles.ADMIN), validateReqBody(userUpdateSchema), userController.updateUser);

// API to delete user by admin
router.delete('/:id', roleAuth(Roles.ADMIN), userController.deleteUser);

// API to find user by id on admin side
router.get('/:id', roleAuth(Roles.ADMIN), userController.readUserById);