import { NextFunction, Request, Response } from "express";
import ApiError from "../../errors/ApiError.js";
import { supabase } from "../../config/supabaseClient.js";
import {
  deleteImageFromSupabase,
  uploadImageToSupabase,
} from "../../helper/supabaseUploadFile.js";
import {
  createData,
  deleteData,
  getAll,
  getSingleData,
  updateData,
} from "../../services/generalServices.js";

export const getCompData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(ApiError.unauthorized("User not authenticated"));
    }
    const result = await getAll(userId, "simple_components");
    if (result) {
      res.status(200).json(result);
    } else {
      return next(
        ApiError.notFound(
          "Data not found, or you do not have permission to access this page."
        )
      );
    }
  } catch (error) {
    return next(ApiError.internal("Failed to fetch menu Data"));
  }
};

export const getCompById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id;

    if (!userId) {
      return next(ApiError.unauthorized("User not authenticated"));
    }

    const data = await getSingleData(id, "simple_components", userId);

    if (data) {
      res.status(200).json(data);
    } else {
      return next(ApiError.notFound("Data not found")); // Return 404 if no data found
    }
  } catch (error: any) {
    return next(ApiError.internal("Failed to fetch data: " + error.message));
  }
};

export const createComp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.id;
    const {
      template_id,
      header,
      image_url,
      logo,
      slogan,
      navbar,
      contact_info,
    } = req.body;
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Header image file is required" });
    }

    // Upload the image to Supabase
    const header_img = await uploadImageToSupabase(req.file, user_id);
    if (!header_img) {
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const newData = await createData("simple_components", {
      template_id,
      header,
      header_img,
      logo,
      slogan,
      navbar,
      contact_info,
      user_id,
    });
    res.status(201).json(newData);
  } catch (error) {
    console.log(error);
    return next(ApiError.internal("Failed to create data"));
  }
};

export const updateComp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const { template_id, header, image_url, logo, slogan, navbar, contact_info } = req.body;

    if (req.file) {
      console.log("File received:", req.file);
    } else {
      console.log("No file received");
    }

    const foundedData = await getSingleData(id, "simple_components", userId);

    if (!foundedData || foundedData.length === 0) {
      return res.status(404).json({ error: "Data not found in database." });
    }

    // Extract the existing header image
    const existingHeaderImg = foundedData.header_img;
    console.log("Existing Header Image:", existingHeaderImg);

    let header_img = existingHeaderImg;

    if (req.file) {
      console.log("File received, uploading new image.");

      // Delete the previous image if it exists
      if (existingHeaderImg) {
        const isDeleted = await deleteImageFromSupabase(existingHeaderImg);
        if (!isDeleted) {
          console.error("Failed to delete image from Supabase storage.");
        }
      }

      // Upload the new image
      header_img = await uploadImageToSupabase(req.file, userId);
    } else {
      console.log("No new file uploaded; retaining existing header_img.");
    }

    // If no header_img exists (either was null or empty before), set it explicitly to null
    if (!header_img || header_img === "") {
      header_img = null;
    }

    // Update data in the database
    await updateData("simple_components", id, {
      userId,
      template_id,
      header,
      header_img, // Ensure this is either a valid UUID or null
      logo,
      slogan,
      navbar,
      contact_info,
    });

    res.status(200).json({ message: `You updated data with id: ${id}` });
  } catch (error) {
    next(error);
  }
};

export const deleteCompData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id;

    const foundedData = await getSingleData(id, "simple_components", userId);

    if (Array.isArray(foundedData) && foundedData.length > 0) {
      const { header_img } = foundedData[0]; // Access the first element of the array
      if (header_img) {
        const isDeleted = await deleteImageFromSupabase(header_img);
        if (!isDeleted) {
          console.error("Failed to delete image from Supabase storage.");
        }
      }
    } else {
      return res.status(404).json({ error: "Data not found in database." });
    }

    await deleteData(id, userId, "simple_components");

    res
      .status(204)
      .json({ message: `You deleted component data with id: ${id}` });
  } catch (error) {
    return next(ApiError.internal("Failed to delete data"));
  }
};

export const copyComponent = async (
  templateId: string,
  newTemplateId: string,
  userId: string
): Promise<string> => {
  try {
    // Fetch the original components
    const { data: originalComponents, error: fetchError } = await supabase
      .from("simple_components")
      .select("*")
      .eq("template_id", templateId);

    if (fetchError) {
      throw new Error(`Error retrieving components: ${fetchError.message}`);
    }

    if (!originalComponents || originalComponents.length === 0) {
      throw new Error("No components found to copy.");
    }

    // Prepare new components data
    const newComponents = originalComponents.map((comp) => ({
      original: false,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date(),
      header: comp.header,
      header_img: comp.header_img,
      slogan: comp.slogan,
      logo: comp.logo,
      navbar: comp.navbar,
      contact_info: comp.contact_info,
      template_id: newTemplateId,
    }));

    // Insert the new components
    const { data: insertedComponents, error: insertError } = await supabase
      .from("simple_components")
      .insert(newComponents)
      .select();

    if (insertError) {
      throw new Error(`Error copying components: ${insertError.message}`);
    }

    // Return the ID of the first new component as the component_id
    return insertedComponents[0].id;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to copy components: ${error.message}`);
  }
};
