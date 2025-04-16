import ApiError from "../errors/ApiError.js";
export const isSuperAdmin = (req, res, next) => {
    try {
        const userRole = req.user?.role;
        console.log("User Role from Middleware:", userRole);
        if (userRole !== "superAdmin") {
            return next(ApiError.forbidden("You don't have permission to access this resource."));
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
