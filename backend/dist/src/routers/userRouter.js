import express from 'express';
import { activateUser, changeRole, deleteUserById, forgetPassword, getAllUsers, getSingleUser, registerUser, resetPassword, updateUser,
// banUser,
// unbanUser,
 } from '../controllers/userController.js';
import { creatUserValidator, } from '../validation/userValidation.js';
import { runValidation } from '../validation/index.js';
import { isSuperAdmin } from '../middleware/superAdmin.js';
import { isLoggedOut, isLoggedIn } from '../middleware/authentication.js';
const router = express.Router();
router.get('/', isLoggedIn, isSuperAdmin, getAllUsers);
router.get('/:userId', isLoggedIn, isSuperAdmin, getSingleUser);
router.delete('/:userId', isLoggedIn, isSuperAdmin, deleteUserById);
router.post('/registering', creatUserValidator, runValidation, registerUser);
// router.post('/add-user', addUser);
router.post('/activate/:token', activateUser);
router.post('/forget-password', isLoggedOut, forgetPassword);
router.post('/reset-password', resetPassword);
router.put('/:userId', updateUser);
router.put('/change-role/:userId', isLoggedIn, isSuperAdmin, changeRole);
// router.post(
//   '/registering',
//   isLoggedOut,
//   creatUserValidator,
//   runValidationUser,
//   upload.single('image'),
//   registerUser
// )
// router.post(
//   '/registering',
//   creatUserValidator,
//   runValidationUser,
//   upload.single('image'),
//   registerUser
// )
// // router.put('/ban/:userId', isLoggenIn, isAdmin, banUser)
// router.put('/ban/:userId', banUser)
// // router.put('/unban/:userId', isLoggenIn, isAdmin, unbanUser)
// router.put('/unban/:userId', unbanUser)
// router.put('/:userId', upload.single('image'), updateUser)
// // router.post('/forget-password', isLoggedOut, forgetPasswordValidator, runValidation, forgetPassword)
export default router;
