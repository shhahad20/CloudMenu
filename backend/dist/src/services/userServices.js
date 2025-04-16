"use strict";
// import { Model } from 'mongoose'
// import { NextFunction } from 'express'
// import User from '../models/userSchema.js'
// import ApiError from '../errors/ApiError.js'
// import { UserInterface } from '../types/userInterface.js'
// import { emailSender } from '../helper/sendEmail.js'
// import { registeringEmail } from '../helper/emails.js'
// import { dev } from '../config/index.js'
// import generateToken from '../util/generateToken.js'
// // import { deleteImage } from '../helper/deletingImageHelper'
// // import { deleteFromCloudinary, valueWithoutExtension } from '../helper/cloudinaryHelper'
// // Function to send registration email
// export const sendRegistrationEmail = async (email: string, firstName: string, lastName: string, token:string) => {
//   try {
//     // Prepare the email content
//     const emailContent = registeringEmail(email, firstName, lastName, token);
//     // Send the email
//     await emailSender(emailContent);
//     return { success: true, message: 'Email sent successfully', token };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return { success: false, message: 'Failed to send email', error };
//   }
// };
// export const getUsers = async (page = 1, limit = 5, search = '') => {
//   const countUsers = await User.countDocuments()
//   const totalPages = Math.ceil(countUsers / limit)
//   if (page > totalPages) {
//     page = totalPages
//   }
//   const skip = (page - 1) * limit
//   const searchRegExp = new RegExp('.*' + search + '.*', 'i')
//   const filter = {
//     // isAdmin: { $ne: true },
//     $or: [
//       { email: { $regex: searchRegExp } },
//       { address: { $regex: searchRegExp } },
//       { phone: { $regex: searchRegExp } },
//       { first_name: { $regex: searchRegExp } },
//     ],
//   }
//   const ignoreOptions = {
//     // password: 0,
//     __v: 0,
//     updatedAt: 0,
//     // isAdmin: 0,
//   }
//   const users: UserInterface[] = await User.find(filter, ignoreOptions)
//     .populate('order')
//     .skip(skip)
//     .limit(limit)
//     .sort({ first_name: 1, created_at: 1 })
//   return {
//     users,
//     totalPages,
//     countUsers,
//     currentPage: page,
//   }
// }
// export const findUserById = async (id: string): Promise<UserInterface> => {
//   try {
//     const user = await User.findById(id, { password: 0 }).populate('order')
//     if (!user) {
//       const error = new ApiError(404, `User not found with this id ${id}`)
//       throw error
//     }
//     return user
//   } catch (error) {
//     throw error
//   }
// }
// export const findUserAndDelete = async (id: string) => {
//   try {
//     const userToDelete = await User.findById(id)
//     if (!userToDelete) {
//       const error = new ApiError(404, `User not found with this id ${id}`)
//       throw error
//     }
//     // if (userToDelete && userToDelete.image) {
//     //   // await deleteImage(userToDelete.image)
//     //   const publicId = await valueWithoutExtension(userToDelete.image)
//     //   await deleteFromCloudinary(`Full-Stack-Project/Users/${publicId}`)
//     // }
//     const deletedUser = await User.findByIdAndDelete(id)
//     return deletedUser
//   } catch (error) {
//     throw error
//   }
// }
// export const isExist = async (email: string) => {
//   const userExist = await User.exists({ email: email })
//   if (userExist) {
//     const error = ApiError.exist('User with this email already exist')
//     throw error
//   }
// }
// export const updateBanStatusById = async (id: string, isBanned: boolean) => {
//   const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true })
//   if (!user) {
//     const error = ApiError.notFound('User with this id not found')
//     throw error
//   }
// }
// export const updateRoleStatusById = async (id: string, isAdmin: boolean) => {
//   const user = await User.findByIdAndUpdate(id, { isAdmin }, { new: true })
//   if (!user) {
//     const error = ApiError.notFound('User with this id not found')
//     throw error
//   }
// }
