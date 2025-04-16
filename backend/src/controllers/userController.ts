import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/userSchema.js";
import ApiError from "../errors/ApiError.js";
// import {
//   findUserAndDelete,
//   findUserById,
//   getUsers,
//   isExist,
//   updateBanStatusById,
//   updateRoleStatusById,
// } from "../services/userServices.js";
import generateToken from "../util/generateToken.js";
import { emailSender } from "../helper/sendEmail.js";
import { forgetPasswordEmail, registeringEmail } from "../helper/emails.js";
// import {
//   deleteFromCloudinary,
//   uploadToCloudinary,
//   valueWithoutExtension,
// } from '../helper/cloudinaryHelper'
import { dev } from "../config/index.js";
// import { sendRegistrationEmail } from "../services/userServices.js";
import { UserInterface } from "../types/userInterface.js";
import { supabase } from "../config/supabaseClient.js";
import { createUserSchema } from "../services/schemaManager.js";
// import { console } from "inspector";
const DEFAULT_IMAGES_PATH = "public/images/usersImages/default/usrImage.png";


export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase.from('users').select('*');

    if (error) return next(error);
    if (!data || data.length === 0) return next(ApiError.notFound("Users not found"));

    res.status(200).json({ message: "All users are here", payload: data });
  } catch (error) {
    next(error);
  }

};
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, age, email } = req.body;
    if (!name || !age || !email) return res.status(400).json({ message: "Name, age, and email are required" });

    const { error } = await supabase.from('users').insert([{ name, age, email }]);

    if (error) return res.status(500).send("Failed to insert data");
    res.status(201).send("Data inserted successfully");
  } catch (error) {
    next(error);
  }

};

export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const { data, error } = await supabase.from('users').select('first_name, email').eq('id', userId).single();

    if (error) return next(error);
    if (!data) return next(ApiError.notFound(`User with id = ${userId} not found`));

    res.status(200).json({ message: "Get user by id", payload: data });
  } catch (error) {
    next(error);
  }
  
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const { first_name } = req.body;
    const { error } = await supabase.from('users').update({ first_name }).eq('id', userId);

    if (error) return res.status(500).send("Failed to update data");
    res.status(200).json({ message: "Update user by id" });
  } catch (error) {
    next(error);
  }
  
};

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) return res.status(500).send("Failed to delete data");
    res.status(200).json({ message: `You deleted a user` });
  } catch (error) {
    next(error);
  }
  
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { first_name, last_name, email, password, address, phone, age, country, city } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const { data: userExists, error: existError } = await supabase.from('users').select('email').eq('email', email);

    if (existError || userExists?.length > 0) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // const hashedPassword = bcrypt.hashSync(password, 10);
    const tokenPayload = { first_name, last_name, email, password, phone, address, age, country, city };
    const token = jwt.sign(tokenPayload, dev.jwt.reset_k, { expiresIn: '1h' });
    const emailToSend = registeringEmail(email, first_name, last_name, token)
    await emailSender(emailToSend)
    // Send email logic here...
    res.status(200).json({
      message: "Verification email sent. Please check your email to complete registration.",
      token,
    });
  } catch (error) {
    next(error);
  }
  
};
export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(404).json({ message: "Please provide a valid token" });
    }

    // Verify the token
    jwt.verify(
      token,
      dev.jwt.reset_k,
      async (
        err: jwt.VerifyErrors | null,
        decoded: jwt.JwtPayload | string | undefined
      ) => {
        if (err) {
          console.error("Token verification error:", err);
          return res.status(400).json({ message: err.message || "Invalid or expired token" });
        }

        if (typeof decoded === "string") {
          return res.status(400).json({ message: "Invalid token payload" });
        }

        const payloadUser = decoded as UserInterface;
        const { email, first_name, last_name, password, phone, address, age, country, city } =
          payloadUser;

        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email);

        if (fetchError) {
          console.error("Error fetching user:", fetchError);
          return res.status(500).json({ message: "Error checking user existence" });
        }
        console.log(existingUser);
        if (existingUser.length > 0) {
          return res.status(400).json({ message: "User already activated. Please log in." });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the main users table
        const { data: insertedUser, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              first_name,
              last_name,
              email,
              password: hashedPassword, // Ensure you hash the password before storing it
              phone,
              address,
              age,
              country,
              city,
            },
          ])
          .select();

        if (insertError) {
          console.error("Error inserting user:", insertError);
          return res.status(500).json({ message: "Failed to register user" });
        }

        console.log("Inserted user:", insertedUser);

        if (!insertedUser) {
          return res.status(500).json({ message: "Failed to retrieve inserted user" });
        }

        return res.status(200).json({ message: "User successfully verified and registered." });
      }
    );
  } catch (error: any) {
    console.error("Error in activation:", error.message || error);
    next(error);
  }
};


export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    const { data: foundUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (fetchError) {
      console.error("Error while querying user data:", fetchError);
      return next(ApiError.internal("Server error while finding user"));
    }

    if (foundUser.length === 0) {
      return next(ApiError.notFound(`${email} does not exist`));
    }

    // Generate the token
    const token = generateToken({ email }, dev.jwt.reset_k, "60m");
    const user = foundUser[0];

    const emailToSend = forgetPasswordEmail(
      email,
      user.first_name,
      user.last_name,
      token
    );

    try {
      emailSender(emailToSend); // Sending the email
      res.status(200).json({
        message: "Email sent successfully, please check your inbox",
        payload: token, // Token for reference
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return next(ApiError.internal("Error while sending email"));
    }
  } catch (error) {
    next(error);
  }
  
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password, confirmPassword, email } = req.body;
    if (!token) {
      next(ApiError.notFound("Please provide a valid token"));
      return;
    }
    if (password !== confirmPassword) {
      throw ApiError.unauthorized("Passwords do not match");
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    console.log("Hashed Password:", hashedPassword);

    jwt.verify(
      token,
      dev.jwt.reset_k,
      async (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
        if (err) {
          console.error("Token verification error:", err);
          return res.status(400).json({ message: err.message || "Invalid or expired token" });
        }
        
        if (typeof decoded === "string") {
          return res.status(400).json({ message: "Invalid token payload" });
        }

        // Update password in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('email', email);

        if (updateError) {
          console.error("Failed to reset password:", updateError);
          return res.status(500).send("Failed to reset password");
        }

        res.status(200).json({ message: "Password reset successfully" });
      }
    );
  } catch (error) {
    next(error);
  }
};

export const changeRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const newRole = req.body.role;

  const validRoles = ["User", "Admin", "superAdmin"];
  if (!validRoles.includes(newRole)) {
    return next(ApiError.badRequest("Invalid role type."));
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select(); 

    if (error) {
      console.error("Failed to update user role:", error);
      return next(ApiError.internal("Failed to update user role."));
    }

    // Check if data is an array and contains elements
    if (!data || !Array.isArray(data) || data.length === 0) {
      return next(ApiError.badRequest("User not found or role not updated."));
    }

    res.status(200).json({ message: "User role updated successfully." });
  } catch (error) {
    next(ApiError.internal("Failed to update user role."));
  }
};

// export const banUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = req.params.userId
//     const user = await updateBanStatusById(id, true)
//     res.status(200).json({
//       message: `You banned a user with ID: ${id}`,
//     })
//   } catch (error) {
//     if (error instanceof mongoose.Error.CastError) {
//       const error = new ApiError(400, `Not vaild id`)
//       next(error)
//     } else {
//       next(error)
//     }
//   }
// }
// export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = req.params.userId
//     const user = await updateBanStatusById(id, false)
//     res.status(200).json({
//       message: `You unbanned a user with ID: ${id}`,
//     })
//   } catch (error) {
//     if (error instanceof mongoose.Error.CastError) {
//       const error = new ApiError(400, `Not vaild id`)
//       next(error)
//     } else {
//       next(error)
//     }
//   }
// }


