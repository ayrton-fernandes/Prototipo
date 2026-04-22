import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import { domainDirectorateService } from "@/services/domainDirectorateService";

interface DirectorateState {
    items: BaseResponseDTO[];
    selectedItem: BaseResponseDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DirectorateState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
};

export const fetchAllDirectorates = createAsyncThunk<BaseResponseDTO[]>(
    "directorate/fetchAll",
    async () => {
        const response = await domainDirectorateService.findAll();
        return response.data;
    }
);

export const fetchDirectorateById = createAsyncThunk<BaseResponseDTO, number>(
    "directorate/fetchById",
    async (id: number) => {
        const response = await domainDirectorateService.findById(id);
        return response.data;
    }
);

export const createDirectorate = createAsyncThunk<void, BaseCreateDTO>(
    "directorate/create",
    async (payload: BaseCreateDTO) => {
        await domainDirectorateService.create(payload);
    }
);

export const updateDirectorate = createAsyncThunk<void, { id: number; payload: BaseUpdateDTO }>(
    "directorate/update",
    async ({ id, payload }: { id: number; payload: BaseUpdateDTO }) => {
        await domainDirectorateService.update(id, payload);
    }
);

export const deleteDirectorateById = createAsyncThunk<void, number>(
    "directorate/deleteById",
    async (id: number) => {
        await domainDirectorateService.deleteById(id);
    }
);

export const reactivateDirectorateById = createAsyncThunk<void, number>(
    "directorate/reactivateById",
    async (id: number) => {
        await domainDirectorateService.reactivateById(id);
    }
);

const directorateSlice = createSlice({
    name: "directorate",
    initialState,
    reducers: {
        clearSelectedDirectorate: (state) => {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDirectorates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllDirectorates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllDirectorates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar diretorias";
            })
            .addCase(fetchDirectorateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDirectorateById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchDirectorateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar diretoria";
            })
            .addCase(createDirectorate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDirectorate.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createDirectorate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao criar diretoria";
            })
            .addCase(updateDirectorate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDirectorate.fulfilled, (state, action) => {
                state.isLoading = false;
                const { id, payload } = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, ...payload };
                }
            })
            .addCase(updateDirectorate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao atualizar diretoria";
            })
            .addCase(deleteDirectorateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDirectorateById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: false } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: false };
                }
            })
            .addCase(deleteDirectorateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao desativar diretoria";
            })
            .addCase(reactivateDirectorateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reactivateDirectorateById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: true } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: true };
                }
            })
            .addCase(reactivateDirectorateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao reativar diretoria";
            });
    },
});

export const { clearSelectedDirectorate } = directorateSlice.actions;
export default directorateSlice.reducer;
