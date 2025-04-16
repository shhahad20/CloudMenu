import mongoose, { Schema } from 'mongoose'

import { UserInterface } from '../types/userInterface'

const IMAGES_PATH = "public/images/usersImages/default/usrImage.png"
 
const userSchema = new Schema<UserInterface>(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    // image: {
    //   type: String,
    //   default: IMAGES_PATH,
    // },
    phone: {
      type: String,
      trim: true,
      required: true,
    },
    country:{
      type: String,
      requireed:  true,
    },
    city:{
      type: String,
      requireed:  true,
    },
    address: {
      type: String,
      trim: true,
      required: true,
    },
    // isBanned: {
    //   type: Boolean,
    //   default: false,
    // },
    role: {
      type: String,
      default: "User",
    },
    // gender: {
    //   type: String,
    //   enum: ['Male', 'Female'],
    // },
    // order: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Order',
    // }],
  },
  { timestamps: true }
)

export default mongoose.model<UserInterface>('User', userSchema)