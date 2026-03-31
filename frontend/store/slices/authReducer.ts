import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User, UserState } from "@/domain/entities/user";
import { apiRequestAdapter, ApiError } from "@/services/api/adapters/apiAdapter";
import { showToast } from "./toastSlice";
import { setLoading } from "./loadingReducer";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { removeToken } from "@/services/utils/cookie";
import { MenuUser } from "@/domain/types/menuUser";
import MenuService from "@/services/menuService";

interface LoginCredentials {
    email: string;
    password: string;
}

const initialState: UserState = {
    user: null,
};

export const fetchUserMenus = createAsyncThunk<
    { data: MenuUser[] },
    void,
    { rejectValue: ApiError; state: { auth: UserState } }
>("auth/fetchUserMenus", async (_, { rejectWithValue, dispatch, getState }) => {
    const { auth } = getState();
    if (!auth.user) return rejectWithValue({ message: "Usuário não autenticado" });

    try {
        const response = await apiRequestAdapter(
            () => MenuService.getMenuByUser(),
            "Erro ao obter menus do usuário",
            {},
            dispatch
        ) as { data: MenuUser[] };
        return response;
    } catch (error) {
        const apiError = error as ApiError;
        dispatch(
            showToast({
                severity: "error",
                summary: "Erro ao obter menus do usuário",
                detail: apiError.message,
            })
        );
        return rejectWithValue(apiError);
    }
});

export const checkAuthState = createAsyncThunk<
    { data: User & { menus?: MenuUser[] | import("@/domain/types/userMe").UserMenu[] } } | null,
    void,
    { rejectValue: ApiError; state: { auth: UserState } }
>("auth/checkAuthState", async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.user?.menus) return { data: auth.user };

    try {
        dispatch(setLoading(true));

        const userResponse = await apiRequestAdapter(
            () => userService.getCurrentUser(),
            "Erro ao obter dados do usuário",
            {},
            dispatch
        ) as { data: User };

        if (!userResponse.data) {
            return null;
        }

        try {
            const menuResponse = await apiRequestAdapter(
                () => MenuService.getMenuByUser(),
                "Erro ao obter menus do usuário",
                {},
                dispatch
            ) as { data: MenuUser[] };

            return {
                data: {
                    ...userResponse.data,
                    menus: menuResponse.data,
                },
            };
        } catch (error) {
            return { data: userResponse.data };
        }
    } catch (error) {
        return null;
    } finally {
        dispatch(setLoading(false));
    }
});

export const login = createAsyncThunk<
    { data: void; redirectTo?: string },
    LoginCredentials,
    { rejectValue: ApiError }
>("auth/login", async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setLoading(true));
        const response = await apiRequestAdapter(
            () => authService.login({ email, password }),
            "Erro ao realizar login",
            { redirectAfterSuccess: true },
            dispatch
        ) as { data: void; redirectTo?: string };
        return response;
    } catch (error) {
        const apiError = error as ApiError;
        dispatch(
            showToast({
                severity: "error",
                summary: "Erro ao realizar login",
                detail: apiError.message,
            })
        );
        return rejectWithValue(apiError);
    } finally {
        dispatch(setLoading(false));
    }
});

export const logout = createAsyncThunk<void, void, { rejectValue: ApiError }>(
    "auth/logout",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            dispatch(setLoading(true));
            removeToken();
            return;
        } catch (error) {
            const apiError = {
                message: (error as Error).message || "Erro ao fazer logout",
                errors: [(error as Error).message || "Erro ao fazer logout"],
            };
            dispatch(
                showToast({
                    severity: "error",
                    summary: "Erro ao fazer logout",
                    detail: apiError.message,
                })
            );
            return rejectWithValue(apiError);
        } finally {
            dispatch(setLoading(false));
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
    extraReducers: builder => {
        builder.addCase(logout.fulfilled, (state: UserState) => {
            state.user = null;
        });
        builder
            .addCase(checkAuthState.fulfilled, (state: UserState, action) => {
                if (action.payload) {
                    state.user = action.payload.data;
                } else {
                    state.user = null;
                }
            })
            .addCase(checkAuthState.rejected, (state: UserState) => {
                state.user = null;
            })
            .addCase(fetchUserMenus.fulfilled, (state: UserState, action) => {
                if (state.user) {
                    state.user.menus = action.payload.data;
                }
            });
    },
});

export const { setUserData, clearUser } = authSlice.actions;
export default authSlice.reducer;
