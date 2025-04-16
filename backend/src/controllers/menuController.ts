import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError.js";
import { supabase } from "../config/supabaseClient.js";
import * as menuService from "../services/menuService.js";
import { copyComponent } from "./componentControllers/simpleCompController.js";

interface Item {
  title: string;
  description: string;
  price: string;
}

interface Section {
  header: string;
  section_order: number;
  items: Item[];
}

interface Template {
  name: string;
  user_id: number;
  sections: Section[];
}

export const getAllMenuTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = "1";
    let pageNo = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search as string | undefined;
    const sortField = (req.query.sortField as string) || "name";
    const sortOrder = req.query.sortOrder as string | "asc" | "desc";

    const data = await menuService.getAllMenus(
      userId,
      "templates",
      "name",
      pageNo,
      limit,
      sortField,
      sortOrder,
      search
    );

    res.status(200).json({
      message: "Templates retrieved successfully.",
      payload: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(ApiError.badRequest("Menu id must be provided!"));
    }

    // Fetch template with related sections and items
    const { data, error } = await supabase
      .from("templates")
      .select(
        `
        id,
        name,
        created_at,
        updated_at,
        user_id,
        original_id,
        component_id,
        template_sections (
          section_id,
          header,
          section_order,
          template_id,
          template_items (
            item_id,
            title,
            description,
            price
          )
        )
      `
      )
      .eq("id", id);

    if (error) {
      return next(
        ApiError.internal("Error retrieving template data: " + error.message)
      );
    }

    if (!data || data.length === 0) {
      return next(ApiError.notFound(`Template with ID: ${id} not found.`));
    }

    res.status(200).json({
      message: "Template retrieved successfully.",
      payload: data[0], // Return the first result since IDs are unique
    });
  } catch (error) {
    console.error(error);
    next(ApiError.internal("Unexpected error while retrieving template data"));
  }
};

export const createMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, user_id, sections }: Template = req.body;

  if (!name || !user_id || !sections || sections.length === 0) {
    return next(ApiError.badRequest("Missing required fields!"));
  }

  const supabaseClient = supabase;

  try {
    // Insert into templates table
    const { data: templateData, error: templateError } = await supabaseClient
      .from("templates")
      .insert([{ name, user_id }])
      .select();

    if (templateError) {
      return next(ApiError.internal("Error creating template"));
    }

    const templateId = templateData[0].id; // Newly created template ID

    // Prepare and insert sections into template_sections table
    const sectionData = sections.map((section) => ({
      template_id: templateId,
      header: section.header,
      section_order: section.section_order,
    }));

    const { data: sectionsData, error: sectionsError } = await supabaseClient
      .from("template_sections")
      .insert(sectionData)
      .select();

    if (sectionsError) {
      return next(ApiError.internal("Error creating sections"));
    }

    // Prepare and insert items into template_items table
    const itemsData = sections.flatMap((section, index) =>
      section.items.map((item) => ({
        section_id: sectionsData[index].section_id,
        title: item.title,
        description: item.description,
        price: item.price,
      }))
    );

    const { error: itemsError } = await supabaseClient
      .from("template_items")
      .insert(itemsData);

    if (itemsError) {
      return next(ApiError.internal("Error creating items"));
    }

    res.status(201).json({
      message: "Menu template created successfully.",
      template_id: templateId,
    });
  } catch (error) {
    console.error(error);
    next(ApiError.internal("Unexpected error while creating template"));
  }
};

export const updateMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params; // Template ID
    // const { name, sections } = req.body; // Template name and sections
        const { name } = req.body; 

    const userId = req.user?.id; // User ID from authentication

    if (!id || !name) {
      return next(ApiError.badRequest("Missing required fields!"));
    }

    // Update template name
    const { error: templateError } = await supabase
      .from("templates")
      .update({ name, updated_at: new Date() })
      .eq("id", id)
      .eq("user_id", userId);

    if (templateError) {
      return next(ApiError.internal("Error updating template name!"));
    }

    // Iterate over sections to update or add new ones
    // for (const section of sections) {
    //   const { section_id, header, items } = section;

    //   if (section_id) {
    //     // Update existing section
    //     const { error: sectionError } = await supabase
    //       .from("template_sections")
    //       .update({ header })
    //       .eq("section_id", section_id)
    //       .eq("template_id", id);

    //     if (sectionError) {
    //       return next(
    //         ApiError.internal(
    //           `Error updating section '${header}': ${sectionError.message}`
    //         )
    //       );
    //     }
    //   } else {
    //     // Add new section
    //     const { data: newSection, error: newSectionError } = await supabase
    //       .from("template_sections")
    //       .insert([{ header, template_id: id }])
    //       .select()
    //       .single();

    //     if (newSectionError) {
    //       return next(
    //         ApiError.internal(
    //           `Error adding new section '${header}': ${newSectionError.message}`
    //         )
    //       );
    //     }

    //     section.section_id = newSection.section_id; // Assign new section ID for items
    //   }

      // Update or add items within the section
      // for (const item of items || []) {
      //   const { item_id, title, price, description } = item;

      //   if (item_id) {
      //     // Update existing item
      //     const { error: itemError } = await supabase
      //       .from("template_items")
      //       .update({ title, price, description })
      //       .eq("item_id", item_id)
      //       .eq("section_id", section.section_id);

      //     if (itemError) {
      //       return next(
      //         ApiError.internal(
      //           `Error updating item '${title}' in section '${header}': ${itemError.message}`
      //         )
      //       );
      //     }
      //   } else {
      //     // Add new item
      //     const { error: newItemError } = await supabase
      //       .from("template_items")
      //       .insert([
      //         { title, price, description, section_id: section.section_id },
      //       ]);

      //     if (newItemError) {
      //       return next(
      //         ApiError.internal(
      //           `Error adding item '${title}' to section '${header}': ${newItemError.message}`
      //         )
      //       );
      //     }
      //   }
      // }
    // }

    res.status(200).json({
      message: "Menu template updated successfully.",
    });
  } catch (error) {
    console.error(error);
    next(ApiError.internal("Failed to update menu template."));
  }
};

export const deleteMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(ApiError.badRequest("Template ID must be provided"));
    }

    const { error, count } = await supabase
      .from("templates")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return next(ApiError.internal("Error deleting menu template " + error.message));
    }

    if (count === 0) {
      return next(ApiError.notFound("Menu template not found"));
    }

    res.status(200).json({
      message: `Template with ID ${id} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
export const copyMenuTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { templateId } = req.body;
  const userId = req.user?.id;

  try {
    // Validate the templateId
    if (!templateId) {
      return next(ApiError.badRequest("Template ID is required!"));
    }

    // Validate the userId
    if (!userId) {
      return next(ApiError.unauthorized("User ID is required!"));
    }

    // Fetch the original template
    const { data: originalTemplate, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (!originalTemplate || error) {
      return next(
        ApiError.internal(
          `Error retrieving original template: ${error?.message}`
        )
      );
    }

    // if (!originalTemplate) {
    //   return next(ApiError.notFound("Menu template not found!"));
    // }
    // Fetch the sections of the original template
    const { data: originalSections, error: sectionError } = await supabase
      .from("template_sections")
      .select("*")
      .eq("template_id", templateId);

    if (sectionError) {
      return next(
        ApiError.internal(
          `Error retrieving template sections: ${sectionError.message}`
        )
      );
    }

    // Create a copy of the original template
    const { data: newTemplate, error: insertError } = await supabase
      .from("templates")
      .insert([
        {
          name: `${originalTemplate.name} (Copy)`, // Append "(Copy)" to the name
          user_id: userId, // Assign the new user ID
          created_at: new Date(), // Add timestamps
          updated_at: new Date(),
          original_id: templateId,
          component_id: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return next(
        ApiError.internal(`Error copying template: ${insertError.message}`)
      );
    }

    const newTemplateId = newTemplate.id;

    // Copy sections and items of the template
    for (const section of originalSections || []) {
      const { data: newSection, error } = await supabase
        .from("template_sections")
        .insert([
          {
            header: section.header,
            template_id: newTemplateId, // Here we make the (Link) to the new template
            section_order: section.section_order,
          },
        ])
        .select()
        .single();

      if (error) {
        return next(
          ApiError.internal(
            `Error copying section '${section.header}' : ${error.message}`
          )
        );
      }

      const sectionId = newSection.section_id;
      // Fetch items for the current section
      const { data: originalItems, error: itemsError } = await supabase
        .from("template_items")
        .select("*")
        .eq("section_id", section.section_id);

      if (itemsError) {
        return next(
          ApiError.internal(
            `Error retrieving items for section '${section.header}' : ${itemsError.message}`
          )
        );
      }

      // Copy items
      for (const item of originalItems || []) {
        const { error: insertItemError } = await supabase
          .from("template_items")
          .insert([
            {
              title: item.title,
              price: item.price,
              section_id: sectionId,
              description: item.description,
            },
          ]);

        if (insertItemError) {
          return next(
            ApiError.internal(
              `Error copying item '${item.title}' in section '${section.header}' : ${insertItemError.message}`
            )
          );
        }
      }
    }

    const newComponentId = await copyComponent(templateId, newTemplateId, userId);
    // Update the templates table with the new component_id
const { error: updateError } = await supabase
.from("templates")
.update({ component_id: newComponentId })
.eq("id", newTemplateId);

if (updateError) {
return next(
  ApiError.internal(`Error updating template with new component_id: ${updateError.message}`)
);
}

res.status(201).json({
message: "Template copied successfully.",
payload: {
  ...newTemplate,
  component_id: newComponentId, // Include the new component_id in the response
},
});
  } catch (error) {
    console.error(error);
    next(ApiError.badRequest("Failed to copy template."));
  }
};

export const getAllUserMenus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    let pageNo = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search as string | undefined;
    const sortField = (req.query.sortField as string) || "name";
    const sortOrder = req.query.sortOrder as string | "asc" | "desc";

    if (!userId) {
      return next(ApiError.badRequest("Please login first!"));
    }
    const data = await menuService.getAllMenus(
      userId,
      "templates",
      "name",
      pageNo,
      limit,
      sortField,
      sortOrder,
      search
    );
    res.status(200).json({
      message: "Templates retrieved successfully.",
      payload: {
        templates: data.templates,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};
