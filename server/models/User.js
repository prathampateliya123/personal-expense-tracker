/**
 * models/User.js
 * Mongoose schema for User documents.
 * Passwords are hashed via bcrypt before save in the auth controller.
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    // Map createdAt/updatedAt; expose createdAt as specified
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

const User = mongoose.model("User", userSchema);

export default User;
