import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import AppError from "../app/errors/AppError";
import { User } from "../app/modules/user/user.model";
import catchAsync from "../app/utils/catchAsync";

export const protect = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError(httpStatus.NOT_FOUND, "Token not found");

  try {
    const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    // console.log(decoded)
    const user = await User.findById(decoded._id)
    if (user && await User.isOTPVerified(user._id)) {
      req.user = user;
    }
    next();
  } catch (err) {
    console.log( err );
    throw new AppError(401, "Invalid token");
  }
})

export const isAdmin = catchAsync(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new AppError(403, "Access denied. You are not an admin.");
  }
  next();
})

export const isDriver = catchAsync(async(req, res, next) => {
  if (req.user?.role !== "driver") {
    throw new AppError(403, "Access denied. You are not an driver.");
  }
  next();
})