export const getToken = () => {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("token="))
        ?.split("=")[1];
};

export const setToken = (token: string, expiresIn?: number) => {
    if (expiresIn && expiresIn > 0) {
        document.cookie = `token=${token}; path=/; max-age=${expiresIn}; samesite=lax`;
        return;
    }

    document.cookie = `token=${token}; path=/; samesite=lax`;
};

export const removeToken = () => {
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
};
