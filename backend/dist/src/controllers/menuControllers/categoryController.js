import ApiError from "../../errors/ApiError.js";
import { getAllMenuItems } from "../../services/menuItemService.js";
export const getMenuSections = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        let pageNo = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search;
        const sortField = req.query.sortField || "title";
        const sortOrder = req.query.sortOrder;
        if (!userId) {
            return next(ApiError.unauthorized("User not authenticated"));
        }
        const result = await getAllMenuItems(userId, 'template_sections', 'header', pageNo, limit, sortField, sortOrder, search);
        if (result) {
            res.status(200).json(result);
        }
        else {
            return next(ApiError.notFound("Sections not found, or you do not have permission to access this page."));
        }
    }
    catch (error) {
        return next(ApiError.internal("Failed to fetch menu sections"));
    }
};
