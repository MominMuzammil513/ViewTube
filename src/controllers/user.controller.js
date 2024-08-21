import { User } from "../modules/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiREsponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


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
try {
    const {username,email,password,fullName} = req.json();
    console.log(username, email, password,fullName);

    // if(fullName === ""){
    //     throw new ApiError(400,"fullName is required")
    // }
    if([username,email,password,fullName].some((filed)=>filed?.trim()==="")){
        return ApiError(400,"all fields are required") 
    }
    const existUser = User.findOne({
        $or:[{username,email}]
    })
    if(existUser){
        throw new ApiError(409,"User already exists with email and username")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    // if(!coverImageLocalPath){
    //     throw new ApiError(400,"cover image is required")
    // }
    
    const uploadAvatar = await uploadOnCloudinary(avatarLocalPath)
    const uploadCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!uploadAvatar){
        throw new ApiError(400,"Avatar is required")
    }
    const user = await User.create({
        fullName,
        avatar:uploadAvatar.url,
        coverImage:uploadCoverImage.url || "",
        email,
        password,
        username:username.toLowerCase(),
    })
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registration successfully")
   )
} catch (error) {
    throw new ApiError(error,"please check your network, and try again")
}
});

export default registerUser;
