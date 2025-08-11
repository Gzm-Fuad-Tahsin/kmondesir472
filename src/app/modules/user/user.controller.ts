import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { User } from "./user.model";
import { Audio } from "../audio/audio.model";
import { Payment } from "../payment/payment.model";


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

export const getSingleUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -verificationInfo -refreshToken -password_reset_token")
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
export const adminDashboard = catchAsync(async (req, res) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalAudios = await Audio.countDocuments();

  // Total Revenue (Sum of amounts)
  const totalRevenueAgg = await Payment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  // Revenue by Month (for chart)
  const revenueChart = await Payment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const revenueChartFormatted = revenueChart.map((item) => ({
    label: `${item._id.month}-${item._id.year}`,
    value: item.total
  }));

  // Most popular audios by play count (for pie chart)
  const topAudios = await Audio.find({})
    .sort({ listeners: -1 }) // Replace `playCount` with your own field
    .limit(5)
    .select('title listeners');

  const popularAudioChart = topAudios.map((audio) => ({
    label: audio.title,
    value: audio.listeners
  }));

  // Final response
  // res.json({
  //   totalUsers,
  //   totalAudios,
  //   totalRevenue,
  //   revenueChart: revenueChartFormatted,
  //   popularAudioChart
  // });
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Data fetched successfully',
    data: {
      totalUsers,
      totalAudios,
      totalRevenue,
      revenueChart: revenueChartFormatted,
      popularAudioChart
    }

  })
});


export const getHomeAudios = catchAsync(async (req, res) => {
  const [featuredAudios, trendingAudios, topWeeklyAudios] = await Promise.all([
    // Latest 3 audios
    Audio.find().sort({ createdAt: -1 }).limit(3),

    // Most listened audios
    Audio.find().sort({ listeners: -1 }).limit(6),

    // Top this week (last 7 days)
    Audio.find({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }).sort({ listeners: -1 }).limit(6),
  ]);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Home page audios fetched successfully',
    data: {
      featuredAudios,
      trendingAudios,
      topWeeklyAudios,
    },
  });
});



