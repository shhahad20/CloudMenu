import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../api/api";
import axios from "axios";

export interface Item {
  item_id: string;
  title: string;
  description: string;
  price: number;
  template_sections: {
    header: string;
    section_id: string;
    section_order: string;
    template_id: string;
    templates: {
      id: string;
      user_id: number;
    };
  };
}

export interface Section {
  sectionName: string;
  items: Item[];
}

export interface Template {
  templateName: string;
  sections: Section[];
}
export interface SingleItem {
  item: {
    title: string;
    price: number;
    description: string;
  };
  section: {
    header: string;
    section_id: string;
  };
}

export interface ItemsState {
  items: Item[];
  item: SingleItem | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
const initialState: ItemsState = {
  items: [],
  item: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalItems: 0,
};

// Fetch items from backend
export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async ({
    page,
    searchTerm,
    sortOption,
    sortOrder,
    limit,
  }: {
    page: number;
    searchTerm: string;
    sortOption: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
  }) => {
    const response = await axios.get(`${API_URL}/menu/menu-items`, {
      params: {
        page,
        search: searchTerm,
        sortField: sortOption,
        sortOrder,
        limit,
      },
    });
    console.log(response.data);
    return response.data;
  }
);
export const fetchSectionItems = createAsyncThunk(
  "sections/fetch-all-section-items",
  async ({
    template_id,
    section_id,
  }: {
    template_id: string;
    section_id: string;
  }) => {
    try {
      const response = await axios.get(
        `${API_URL}/menu/menu-items/all/${template_id}/${section_id}`
      );
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const createItem = createAsyncThunk(
  "items/createItem",
  async (item: object, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/menu/menu-items`, item);
      console.log("Hi slice :" + response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.msg);
      }
    }
  }
);
export const fetchItemById = createAsyncThunk(
  "sections/fetch-item",
  async ({
    item_id,
    template_id,
  }: {
    item_id: string;
    template_id: string;
  }) => {
    try {
      const response = await axios.get(
        `${API_URL}/menu/menu-items/${item_id}/${template_id}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const updateItem = createAsyncThunk(
  "items/editItem",
  async (item: object) => {
    try {
      const response = await axios.put(`${API_URL}/menu/menu-items`, item);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);
export const removeItem = createAsyncThunk(
  "items/removeItem",
  async (id: string) => {
    await axios.delete(`${API_URL}/menu/menu-items/${id}`);
    return id;
  }
);

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    // addItem: (state, action: PayloadAction<Item>) => {
    //   state.items.push(action.payload);
    // },
    // updateItem: (state, action: PayloadAction<Item>) => {
    //   const index = state.items.findIndex(item => item.itemId === action.payload.itemId);
    //   if (index !== -1) state.items[index] = action.payload;
    // },
    // deleteItem: (state, action: PayloadAction<number>) => {
    //   state.items = state.items.filter(item => item.itemId !== action.payload);
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        console.log(action.payload);
        state.items.push(action.payload);
      })
      .addCase(fetchSectionItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        // state.totalItems = action.payload.totalItems;
        // state.currentPage = action.payload.currentPage;
        // state.totalPages = action.payload.totalPages;
      });
    // .addCase(editItem.fulfilled, (state, action) => {
    //   const index = state.items.findIndex(item => item.itemId === action.payload.id);
    //   if (index !== -1) state.items[index] = action.payload;
    // })
    // .addCase(removeItem.fulfilled, (state, action) => {
    //   state.items = state.items.filter(item => item.itemId !== action.payload);
    // });
    builder.addCase(removeItem.fulfilled, (state, action) => {
      state.items = state.items.filter(
        (item) => item.item_id !== action.payload
      );
    });
  },
});

// export const { addItem, updateItem } = itemsSlice.actions;
export default itemsSlice.reducer;
