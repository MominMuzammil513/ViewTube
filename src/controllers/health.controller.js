import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Healthcheck controller to return OK status with a message
const healthcheck = asyncHandler(async (req, res) => {
    const response = new ApiResponse(200, null, "Service is running smoothly");
    res.status(200).json(response);
});

export {
    healthcheck
};
