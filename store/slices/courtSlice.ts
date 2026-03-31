import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import { courtService } from "@/services/courtService";

interface CourtState {
    items: BaseResponseDTO[];
    selectedItem: BaseResponseDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CourtState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
};

export const fetchAllCourts = createAsyncThunk<BaseResponseDTO[]>(
    "court/fetchAll",
    async () => {
        const response = await courtService.findAll();
        return response.data;
    }
);

export const fetchCourtById = createAsyncThunk<BaseResponseDTO, number>(
    "court/fetchById",
    async (id: number) => {
        const response = await courtService.findById(id);
        return response.data;
    }
);

export const createCourt = createAsyncThunk<void, BaseCreateDTO>(
    "court/create",
    async (payload: BaseCreateDTO) => {
        await courtService.create(payload);
    }
);

export const updateCourt = createAsyncThunk<void, { id: number; payload: BaseUpdateDTO }>(
    "court/update",
    async ({ id, payload }: { id: number; payload: BaseUpdateDTO }) => {
        await courtService.update(id, payload);
    }
);

export const deleteCourtById = createAsyncThunk<void, number>(
    "court/deleteById",
    async (id: number) => {
        await courtService.deleteById(id);
    }
);

export const reactivateCourtById = createAsyncThunk<void, number>(
    "court/reactivateById",
    async (id: number) => {
        await courtService.reactivateById(id);
    }
);

const courtSlice = createSlice({
    name: "court",
    initialState,
    reducers: {
        clearSelectedCourt: (state) => {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllCourts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllCourts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllCourts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar varas judiciais";
            })
            .addCase(fetchCourtById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCourtById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchCourtById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar vara judicial";
            })
            .addCase(createCourt.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCourt.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createCourt.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao criar vara judicial";
            })
            .addCase(updateCourt.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCourt.fulfilled, (state, action) => {
                state.isLoading = false;
                const { id, payload } = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, ...payload };
                }
            })
            .addCase(updateCourt.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao atualizar vara judicial";
            })
            .addCase(deleteCourtById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCourtById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: false } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: false };
                }
            })
            .addCase(deleteCourtById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao desativar vara judicial";
            })
            .addCase(reactivateCourtById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reactivateCourtById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: true } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: true };
                }
            })
            .addCase(reactivateCourtById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao reativar vara judicial";
            });
    },
});

export const { clearSelectedCourt } = courtSlice.actions;
export default courtSlice.reducer;
