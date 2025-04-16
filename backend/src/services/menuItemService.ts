import { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabaseClient.js";
import ApiError from "../errors/ApiError.js";

export const getAllMenuItems = async (
  userId: string | undefined,
  tableName: string,
  searchField: string,
  pageNo: number = 1,
  limit: number = 5,
  sortField: string,
  sortOrder: string,
  searchQuery?: string
) => {
  try {
    const offset = (pageNo - 1) * limit;

    // Step 1: Query template_items and join template_sections and templates with user_id filter
    let query = supabase
      .from(tableName)
      .select(
        `
        item_id,
        title,
        description,
        price,
        section_id,
        template_sections (
          section_id,
          header,
          template_id,
          templates (
            id,
            user_id,
            name
          )
        )
      `,
        { count: "exact" }
      )
      .eq("template_sections.templates.user_id", userId) // Filter based on user_id of templates table
      .not("template_sections", "is", null)
      .not("template_sections.templates", "is", null)
      .range(offset, offset + limit - 1);
      // .order(sortField, { ascending: sortOrder === "asc" });

       // Handle sorting based on the field and order
    if (sortField === "priceLowToHigh") {
      query = query.order("price", { ascending: true });
    } else if (sortField === "priceHighToLow") {
      query = query.order("price", { ascending: false });
    } else if (sortField === "template") {
      // Sorting by template (e.g., by template header)
      query = query.order("template_sections.templates.name", { ascending: sortOrder === "asc" });
    } else {
      query = query.order(sortField, { ascending: sortOrder === "asc" });
    }



    if (searchQuery) {
      query = query.ilike(searchField, `%${searchQuery}%`); // ilike() for Case-insensitive search
    }

    const { data, error, count } = await query;

    // Debugging: Check if there's an error or no data
    if (error) {
      console.error("Error fetching menu items: ", error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    // Debugging: Check if we have data or if it's empty
    if (!data || data.length === 0) {
      console.warn("No data found or the data is empty.");
    }

    return {
      data,
      totalItems: count || 0,
      currentPage: pageNo,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Error in fetching data: ", error);
    throw new Error(`Failed to fetch data: ${error}`);
  }
};

export const getMenuItemById = async (
  id: string,
  userId: string | undefined,
  templateId: string
) => {
  try {
    console.log("Inputs:", { id, userId, templateId });
    if (!id || !userId || !templateId) {
      throw new Error(
        "Invalid input: id, userId, and templateId must all be provided."
      );
    }
    const { data, error } = await supabase
      .from("templates")
      .select(
        `
      id,
      name,
      user_id,
      template_sections (
        section_id,
        header,
        template_items (
          item_id,
          title,
          price,
          description
        )
      )
    `
      )
      .eq("id", templateId)
      .eq("user_id", userId); 

    if (error) {
      console.error("Error fetching menu item:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Menu or sections not found");
    }

   // Find the specific section and item
   let foundSection: any = null;
   let foundItem: any = null;

   for (const section of data[0].template_sections) {
     const item = section.template_items?.find(
       (templateItem: any) => templateItem.item_id === id
     );
     if (item) {
      foundSection = {
        section_id: section.section_id,
        header: section.header,
      };
       foundItem = item;
       break;
     }
   }

   if (!foundItem) {
     throw new Error("Item not found in the menu");
   }

   // Return both the item and its corresponding section
   return {
     item: foundItem,
     section: foundSection,
   };
  } catch (error) {
    console.error("Error in getMenuItemById:", error);
    throw new Error(`Failed to fetch the item: ${error}`);
  }
};
interface TemplateItem {
  item_id: string;
  title: string;
  price: number;
  description: string;
  section_id: string;
  template_sections: {
    template_id: string;
  }[];
}

export const getSectionItemsById = async (
  id: string,
  userId: string | undefined,
  sectionId: string
) => {
  try {
    console.log("Inputs:", { id, userId, sectionId });
    if (!id || !userId || !sectionId) {
      throw new Error(
        "Invalid input: id, userId, and sectionId must all be provided."
      );
    }
    const { data, error } = await supabase
      .from("template_items")
      .select(
        `
      item_id,
      title,
      price,
      description,
      section_id,
      template_sections!inner(template_id)
    `
      )
      .eq("section_id", sectionId);

    if (error) {
      console.error("Error fetching section items:", error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Menu or sections not found");
    }

    return (data as TemplateItem[]).map((item) => ({
      ...item,
      template_id: item.template_sections[0]?.template_id,
    }));
  } catch (error) {
    console.error("Error in getMenuItemById:", error);
    throw new Error(`Failed to fetch the item: ${error}`);
  }
};
export const createMenuItem = async (menuItemData: {
  templateId: string;
  section_id: string;
  title: string;
  price: number;
  description: string;
  // image_url: string | File | null;
  user_id: string | undefined;
}) => {
  try {
    const { data, error } = await supabase
      .from("template_items")
      .insert([
        {
          section_id: menuItemData.section_id,
          title: menuItemData.title,
          price: menuItemData.price,
          description: menuItemData.description,
        },
      ])
      .select("*");

    if (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    console.error("Error in createMenuItem:", error);
    throw new Error(`Failed to create menu item: ${error}`);
  }
};

export const updateMenuItem = async (
  userId: string | undefined,

  item_id: string,
  title: string,
  price: number,
  description: string,
  section_id: string,
  // image_url: string | File | null;
) => {
  const { data, error } = await supabase
    .from("template_items")
    .select("*")
    .eq("item_id", item_id)
    .single();

  if (error || !data) {
    throw ApiError.notFound("item not found");
  }

  const { data: updatedItem, error: updateError } = await supabase
    .from("template_items")
    .update([
      {
        title: title,
        price: price,
        description: description,
        section_id: section_id,
      },
    ])
    .eq("item_id", item_id)
    .select("*");

  if (updateError) throw updateError;

  return updatedItem;
};

export const deleteMenuItem = async (item_id: string) => {
  const { error } = await supabase
    .from("template_items")
    .delete()
    .eq("item_id", item_id);

  if (error) throw error;
};
