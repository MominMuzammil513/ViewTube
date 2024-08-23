import jwt from "jsonwebtoken";
import { User } from "../modules/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiREsponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// const registerUser = asyncHandler(async (req, res) => {
// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
//create user object - create entry in db
// remove password and refresh token filed from response
// check for user creation
// return user object OR Response
// // try {
//     const {username,email,password,fullName} = req.body;
//     console.log(username, email, password,fullName);

//     // if(fullName === ""){
//     //     throw new ApiError(400,"fullName is required")
//     // }
//     if([username,email,password,fullName].some((filed)=>filed?.trim()==="")){
//         return ApiError(400,"all fields are required")
//     }
//     const existUser =await User.findOne({
//         $or:[{username,email}]
//     })
//     if(existUser){
//         throw new ApiError(409,"User already exists with email and username")
//     }
//     const avatarLocalPath = req.files?.avatar[0]?.path;
//     // const coverImageLocalPath = req.files?.coverImage[0]?.path;
//     let coverImageLocalPath;
//     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
//         coverImageLocalPath = req.files.coverImage[0].path;
//     }else{
//         coverImageLocalPath = ''
//     }
//     if(!avatarLocalPath){
//         throw new ApiError(400,"Avatar is required")
//     }
//     // if(!coverImageLocalPath){
//     //     throw new ApiError(400,"cover image is required")
//     // }

//     const uploadAvatar = await uploadOnCloudinary(avatarLocalPath)
//     const uploadCoverImage = await uploadOnCloudinary(coverImageLocalPath)
//     if(!uploadAvatar){
//         throw new ApiError(400,"Avatar is required")
//     }
//     const user = await User.create({
//         fullName,
//         avatar:uploadAvatar.url,
//         coverImage:uploadCoverImage.url || "",
//         email,
//         password,
//         username:username.toLowerCase(),
//     })
//    const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//    )
//    if(!createdUser){
//     throw new ApiError(500,"something went wrong while registering the user")
//    }
//    return res.status(201).json(
//     new ApiResponse(200,createdUser,"user registration successfully")
//    )
// // } catch (error) {
// //     throw new ApiError(error,"please check your network, and try again")
// // }
// });

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating access and refresh tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  //create user object - create entry in db
  // remove password and refresh token filed from response
  // check for user creation
  // return user object OR Response
  const { username, email, password, fullName } = req.body;

  if ([username, email, password, fullName].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email or username");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const uploadAvatar = await uploadOnCloudinary(avatarLocalPath);
  const uploadCoverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!uploadAvatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user = await User.create({
    fullName,
    avatar: uploadAvatar.url,
    coverImage: uploadCoverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error during user registration");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registration successful"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body=>Data
  //username or email check
  //find the user
  // password check
  // access and refresh token
  // send cookies
  const { username, email, password } = req.body;
  console.log("Login Request Received=======>:", req.body);
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(403, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //   console.log(accessToken, refreshToken,"Access token and refresh token");
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  //   const ck =await res.cookie("accessToken", accessToken, options)
  //   .cookie("refreshToken", refreshToken, options)
  //   console.log(ck,"============+++++++============");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(200, {}, "User Logged out");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingAccessToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingAccessToken) {
      throw new ApiError(401, "Unauthorized  request");
    }
    const decodedToken = jwt.verify(
      incomingAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "invalid request token");
    if (!incomingAccessToken)
      throw new ApiError(401, "refresh token is expired or used");
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access Token and Refresh Token successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "invalid access token or refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // if(newPassword === confirmPassword) {
  //   throw new ApiError(404,"Password is not match");
  // }
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched"));
});

const updatedAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body; //add the coverImage and avatar to the account
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(
    req.user?._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password");
  return res.status(200).json(new ApiResponse(200, user, "Account updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalFilePath = await req.file?.path;
  if (!avatarLocalFilePath) throw new ApiError(400, "Avatar file not found");
  const avatar = await uploadOnCloudinary(avatarLocalFilePath);

  if (!avatar.url) throw new ApiError(400, "Error while uploading avatar");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalFilePath = await req.file?.path;
  if (!coverImageLocalFilePath)
    throw new ApiError(400, "Cover Image file not found");
  const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading Cover Image");
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updatedAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
