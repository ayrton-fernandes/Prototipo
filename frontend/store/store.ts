import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import toastReducer from "@/store/slices/toastSlice";
import loadingReducer from "./slices/loadingReducer";
import authReducer from "./slices/authReducer";
import courtReducer from "./slices/courtSlice";
import delegateReducer from "./slices/delegateSlice";
import departmentReducer from "./slices/departmentSlice";
import directorateReducer from "./slices/directorateSlice";
import stationReducer from "./slices/stationSlice";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        loading: loadingReducer,
        toast: toastReducer,
        court: courtReducer,
        delegate: delegateReducer,
        department: departmentReducer,
        directorate: directorateReducer,
        station: stationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;