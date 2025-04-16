import ApiError from "../../errors/ApiError.js";
import { createMenuSection, deleteMenuSections, getAllMenuSections, getMenuSectionById, getMenuSectionsById, updateMenuSections } from "../../services/sectionService.js";
export const getMenuSections = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        let pageNo = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search;
        const sortField = req.query.sortField || "header";
        const sortOrder = req.query.sortOrder;
        if (!userId) {
            return next(ApiError.unauthorized("User not authenticated"));
        }
        const result = await getAllMenuSections(userId, 'template_sections', 'header', pageNo, limit, sortField, sortOrder, search);
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
export const getMenuSection = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        // const { sectionId } = req.body;
        const menuSection = await getMenuSectionById(userId, id);
        if (menuSection) {
            res.status(200).json(menuSection);
        }
        else {
            return next(ApiError.notFound("Section not found"));
        }
    }
    catch (error) {
        return next(ApiError.internal("Failed to fetch menu section " + error));
    }
};
export const getMenuSectionsOfTemplate = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const id = req.params.id;
        // const { sectionId } = req.body;
        const menuSection = await getMenuSectionsById(userId, id);
        if (menuSection) {
            res.status(200).json(menuSection);
        }
        else {
            return next(ApiError.notFound("Section not found"));
        }
    }
    catch (error) {
        return next(ApiError.internal("Failed to fetch menu section " + error));
    }
};
export const createSection = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { template_id, header } = req.body;
        // Check if a file is uploaded
        // if (!req.file) {
        //   return res.status(400).json({ error: "Image file is required" });
        // }
        // // Upload the image to Supabase
        // const imageUrl = await uploadImageToSupabase(req.file, userId);
        // if (!imageUrl) {
        //   return res.status(500).json({ error: "Failed to upload image" });
        // }
        console.log("Template ID:", req.body.template_id);
        const newMenuItem = await createMenuSection({
            template_id,
            header,
            user_id: userId,
        });
        res.status(201).json(newMenuItem);
    }
    catch (error) {
        console.log(error);
        return next(ApiError.internal("Failed to create item"));
    }
};
export const updateMeunSection = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { header, section_id } = req.body;
        const updatedSection = await updateMenuSections(userId, section_id, header);
        res.status(200).json(updatedSection);
    }
    catch (error) {
        next(error);
    }
};
export const deleteMenuSection = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const section_id = req.params.id;
        // const menuItem = await menuItemService.getMenuItemById(id, userId);
        // if (!menuItem) {
        //   return res.status(404).json({ error: "Menu item not found" });
        // }
        // Extract the image URL
        // const { image_url } = menuItem;
        await deleteMenuSections(section_id);
        // if (image_url) {
        //   const isDeleted = await deleteImageFromSupabase(image_url);
        //   if (!isDeleted) {
        //     console.error("Failed to delete image from Supabase storage.");
        //   }
        // }
        res.status(204).json({ message: `You deleted a section with id: ${section_id}` });
    }
    catch (error) {
        return next(ApiError.internal("Failed to delete menu section"));
    }
};
