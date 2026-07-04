import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getClientsAndItems, getOrderById, getOrders, saveOrder } from '../../services/api';

const createEmptyLine = () => ({
  id: 0,
  itemId: null,
  itemCode: '',
  itemDescription: '',
  unitPrice: 0,
  quantity: 1,
  taxRate: 0,
  exclAmount: 0,
  taxAmount: 0,
  inclAmount: 0,
  note: '',
});

export const createEmptyOrder = () => ({
  id: 0,
  orderNumber: `SO-${Date.now()}`,
  orderDate: new Date().toISOString().slice(0, 10),
  customerId: 0,
  customerName: '',
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  suburb: '',
  state: '',
  postalCode: '',
  country: '',
  invoiceDate: new Date().toISOString().slice(0, 10),
  referenceNo: '',
  notes: '',
  totalExclAmount: 0,
  totalTaxAmount: 0,
  totalInclAmount: 0,
  items: [createEmptyLine()],
});

const normalizeOrder = (order) => ({
  ...createEmptyOrder(),
  ...order,
  orderDate: order?.orderDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  invoiceDate: order?.invoiceDate?.slice(0, 10) || order?.orderDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  items: (order?.items || [createEmptyLine()]).map((line) => ({ ...createEmptyLine(), ...line })),
  totalExclAmount: Number(order?.totalExclAmount || 0),
  totalTaxAmount: Number(order?.totalTaxAmount || 0),
  totalInclAmount: Number(order?.totalInclAmount || 0),
});

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await getOrders();
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load orders');
  }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await getOrderById(id);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load order');
  }
});

export const fetchClientsAndItems = createAsyncThunk('orders/fetchClientsAndItems', async (_, { rejectWithValue }) => {
  try {
    const [clientsResponse, itemsResponse] = await getClientsAndItems();
    return {
      clients: clientsResponse.data,
      items: itemsResponse.data,
    };
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load clients and items');
  }
});

export const submitOrder = createAsyncThunk('orders/submitOrder', async (payload, { rejectWithValue }) => {
  try {
    const response = await saveOrder(payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to save order');
  }
});

const initialState = {
  orders: [],
  clients: [],
  items: [],
  currentOrder: createEmptyOrder(),
  loading: false,
  saving: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = normalizeOrder(action.payload);
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = createEmptyOrder();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = normalizeOrder(action.payload);
        state.loading = false;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientsAndItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientsAndItems.fulfilled, (state, action) => {
        state.clients = action.payload.clients;
        state.items = action.payload.items;
        state.loading = false;
      })
      .addCase(fetchClientsAndItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitOrder.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.saving = false;
        state.currentOrder = normalizeOrder(action.payload);
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentOrder, clearCurrentOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
