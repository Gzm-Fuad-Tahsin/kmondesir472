import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { User } from "./user.model";


export const updateProfile = catchAsync(async (req, res) => {
  const { name, email, password, phone, username } = req.body;
  const user = await User.findByIdAndUpdate({ _id: req?.user?._id }, { name, phone }, { new: true });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found')
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated',
    data: user
  })

})



export const getUsers = catchAsync(async (req, res) => {
  // console.log("dasfdsf")
  const user = await User.find().select("-password");
  if (!user) {
    throw new AppError(400, "user not found")
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Get all users',
    data: user,
  })
})

export const getSingleUser = catchAsync(async (req, res) =>{
  const user = await User.findById(req.params.id).select("-password -verificationInfo -refreshToken -password_reset_token")
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User not found")
    }
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Get single user',
      data: user
      })
})



// export const allRide = catchAsync(async (req, res) => {
//   if (!req.user?._id) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized to access this route')
//   }
//   const ride = await Ticket.find({ userId: req.user?._id }).select("-avaiableSeat")
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Get all ride',
//     data: ride
//   })
// })



// export const allBusRoute = catchAsync(async (req, res) => {
//   const busRoute = await Bus.find().select("stops")
//   let Route:string[] = []
//   busRoute.forEach((item) => {
//     item.stops.forEach((item2) => {
//       Route.push(item2.name)
//     })
//   }
//   )
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Get all bus route',
//     data: Route
//     })
// })
