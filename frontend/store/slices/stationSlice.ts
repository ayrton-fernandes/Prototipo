import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import { domainStationService } from "@/services/domainStationService";

interface StationState {
    items: BaseResponseDTO[];
    selectedItem: BaseResponseDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StationState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
};

export const fetchAllStations = createAsyncThunk<BaseResponseDTO[]>(
    "station/fetchAll",
    async () => {
        const response = await domainStationService.findAll();
        return response.data;
    }
);

export const fetchStationById = createAsyncThunk<BaseResponseDTO, number>(
    "station/fetchById",
    async (id: number) => {
        const response = await domainStationService.findById(id);
        return response.data;
    }
);

export const createStation = createAsyncThunk<void, BaseCreateDTO>(
    "station/create",
    async (payload: BaseCreateDTO) => {
        await domainStationService.create(payload);
    }
);

export const updateStation = createAsyncThunk<void, { id: number; payload: BaseUpdateDTO }>(
    "station/update",
    async ({ id, payload }: { id: number; payload: BaseUpdateDTO }) => {
        await domainStationService.update(id, payload);
    }
);

export const deleteStationById = createAsyncThunk<void, number>(
    "station/deleteById",
    async (id: number) => {
        await domainStationService.deleteById(id);
    }
);

export const reactivateStationById = createAsyncThunk<void, number>(
    "station/reactivateById",
    async (id: number) => {
        await domainStationService.reactivateById(id);
    }
);

const stationSlice = createSlice({
    name: "station",
    initialState,
    reducers: {
        clearSelectedStation: (state) => {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllStations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllStations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllStations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar varas";
            })
            .addCase(fetchStationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchStationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchStationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar vara";
            })
            .addCase(createStation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createStation.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createStation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao criar vara";
            })
            .addCase(updateStation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateStation.fulfilled, (state, action) => {
                state.isLoading = false;
                const { id, payload } = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, ...payload };
                }
            })
            .addCase(updateStation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao atualizar vara";
            })
            .addCase(deleteStationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteStationById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: false } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: false };
                }
            })
            .addCase(deleteStationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao desativar vara";
            })
            .addCase(reactivateStationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reactivateStationById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: true } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: true };
                }
            })
            .addCase(reactivateStationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao reativar vara";
            });
    },
});

export const { clearSelectedStation } = stationSlice.actions;
export default stationSlice.reducer;
