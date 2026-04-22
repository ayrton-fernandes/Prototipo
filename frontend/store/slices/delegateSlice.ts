import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import { domainDelegateService } from "@/services/domainDelagateService";

interface DelegateState {
    items: BaseResponseDTO[];
    selectedItem: BaseResponseDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DelegateState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
};

export const fetchAllDelegates = createAsyncThunk<BaseResponseDTO[]>(
    "delegate/fetchAll",
    async () => {
        const response = await domainDelegateService.findAll();
        return response.data;
    }
);

export const fetchDelegateById = createAsyncThunk<BaseResponseDTO, number>(
    "delegate/fetchById",
    async (id: number) => {
        const response = await domainDelegateService.findById(id);
        return response.data;
    }
);

export const createDelegate = createAsyncThunk<void, BaseCreateDTO>(
    "delegate/create",
    async (payload: BaseCreateDTO) => {
        await domainDelegateService.create(payload);
    }
);

export const updateDelegate = createAsyncThunk<void, { id: number; payload: BaseUpdateDTO }>(
    "delegate/update",
    async ({ id, payload }: { id: number; payload: BaseUpdateDTO }) => {
        await domainDelegateService.update(id, payload);
    }
);

export const deleteDelegateById = createAsyncThunk<void, number>(
    "delegate/deleteById",
    async (id: number) => {
        await domainDelegateService.deleteById(id);
    }
);

export const reactivateDelegateById = createAsyncThunk<void, number>(
    "delegate/reactivateById",
    async (id: number) => {
        await domainDelegateService.reactivateById(id);
    }
);

const delegateSlice = createSlice({
    name: "delegate",
    initialState,
    reducers: {
        clearSelectedDelegate: (state) => {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDelegates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllDelegates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllDelegates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar delegacias";
            })
            .addCase(fetchDelegateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDelegateById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchDelegateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar delegacia";
            })
            .addCase(createDelegate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDelegate.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createDelegate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao criar delegacia";
            })
            .addCase(updateDelegate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDelegate.fulfilled, (state, action) => {
                state.isLoading = false;
                const { id, payload } = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, ...payload };
                }
            })
            .addCase(updateDelegate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao atualizar delegacia";
            })
            .addCase(deleteDelegateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDelegateById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: false } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: false };
                }
            })
            .addCase(deleteDelegateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao desativar delegacia";
            })
            .addCase(reactivateDelegateById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reactivateDelegateById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: true } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: true };
                }
            })
            .addCase(reactivateDelegateById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao reativar delegacia";
            });
    },
});

export const { clearSelectedDelegate } = delegateSlice.actions;
export default delegateSlice.reducer;
