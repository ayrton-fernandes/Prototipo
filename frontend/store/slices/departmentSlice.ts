import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BaseCreateDTO, BaseResponseDTO, BaseUpdateDTO } from "@/domain/types/base";
import { domainDepartmentService } from "@/services/domainDepartmentService";

interface DepartmentState {
    items: BaseResponseDTO[];
    selectedItem: BaseResponseDTO | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: DepartmentState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    error: null,
};

export const fetchAllDepartments = createAsyncThunk<BaseResponseDTO[]>(
    "department/fetchAll",
    async () => {
        const response = await domainDepartmentService.findAll();
        return response.data;
    }
);

export const fetchDepartmentById = createAsyncThunk<BaseResponseDTO, number>(
    "department/fetchById",
    async (id: number) => {
        const response = await domainDepartmentService.findById(id);
        return response.data;
    }
);

export const createDepartment = createAsyncThunk<void, BaseCreateDTO>(
    "department/create",
    async (payload: BaseCreateDTO) => {
        await domainDepartmentService.create(payload);
    }
);

export const updateDepartment = createAsyncThunk<void, { id: number; payload: BaseUpdateDTO }>(
    "department/update",
    async ({ id, payload }: { id: number; payload: BaseUpdateDTO }) => {
        await domainDepartmentService.update(id, payload);
    }
);

export const deleteDepartmentById = createAsyncThunk<void, number>(
    "department/deleteById",
    async (id: number) => {
        await domainDepartmentService.deleteById(id);
    }
);

export const reactivateDepartmentById = createAsyncThunk<void, number>(
    "department/reactivateById",
    async (id: number) => {
        await domainDepartmentService.reactivateById(id);
    }
);

const departmentSlice = createSlice({
    name: "department",
    initialState,
    reducers: {
        clearSelectedDepartment: (state) => {
            state.selectedItem = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDepartments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllDepartments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchAllDepartments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar departamentos";
            })
            .addCase(fetchDepartmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDepartmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedItem = action.payload;
            })
            .addCase(fetchDepartmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao buscar departamento";
            })
            .addCase(createDepartment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDepartment.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createDepartment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao criar departamento";
            })
            .addCase(updateDepartment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDepartment.fulfilled, (state, action) => {
                state.isLoading = false;
                const { id, payload } = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, ...payload } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, ...payload };
                }
            })
            .addCase(updateDepartment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao atualizar departamento";
            })
            .addCase(deleteDepartmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDepartmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: false } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: false };
                }
            })
            .addCase(deleteDepartmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao desativar departamento";
            })
            .addCase(reactivateDepartmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reactivateDepartmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                const id = action.meta.arg;
                state.items = state.items.map((item) =>
                    item.id === id ? { ...item, active: true } : item
                );
                if (state.selectedItem?.id === id) {
                    state.selectedItem = { ...state.selectedItem, active: true };
                }
            })
            .addCase(reactivateDepartmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || "Erro ao reativar departamento";
            });
    },
});

export const { clearSelectedDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
