import { createSlice } from "@reduxjs/toolkit";
const honeySlice = createSlice({
    name: "honey",
    initialState: {
        qtyAvailable: 50,
    },
    reducers:{
        reStock: (state, action) => {
            state.qtyAvailable = action.payload;
        },
    }
})
export const { reStock } = honeySlice.actions;
export default honeySlice.reducer;