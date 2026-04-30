import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function normalizeRedirectPath(pathname: string): string {
    if (!pathname || !pathname.startsWith("/")) return "/home";

    // Never keep auth pages as post-login target.
    if (pathname === "/login" || pathname.startsWith("/verify-code")) return "/home";

    // If an invalid path containing verify-code was produced, fallback safely.
    if (pathname.includes("verify-code")) return "/home";

    return pathname;
}

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const pathname = request.nextUrl.pathname;
    const isLoginPage = pathname === "/login";
    const isVerifyCodePage = pathname === "/verify-code";
    const isPublicRoute = isLoginPage || isVerifyCodePage || pathname.startsWith("/public");

    // Se não for rota pública e não tiver token, redireciona para login
    if (!token && !isLoginPage && !isPublicRoute) {
        const redirectUrl = new URL("/login", request.url);
        const safePath = normalizeRedirectPath(request.nextUrl.pathname);
        // Adiciona o path original como query parameter para ser acessado no cliente
        redirectUrl.searchParams.set("redirectTo", safePath);
        
        const response = NextResponse.redirect(redirectUrl);
        // Salva o path original para redirecionamento pós-login
        response.cookies.set("redirectTo", safePath, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 300,
        });
        return response;
    }

    // Se tiver token e estiver na página de login/verify-code, redireciona para o path salvo
    if (token && (isLoginPage || isVerifyCodePage)) {
        // Prefer query param over cookie (verify-code uses query param)
        const queryRedirect = request.nextUrl.searchParams.get("redirectTo");
        const cookieRedirect = request.cookies.get("redirectTo")?.value;
        const rawRedirect = queryRedirect || cookieRedirect || "/home";
        const redirectTo = normalizeRedirectPath(rawRedirect);

        const response = NextResponse.redirect(new URL(redirectTo, request.url));
        response.cookies.delete("redirectTo");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Protege todas as rotas exceto páginas públicas e assets
        "/((?!login|verify-code|favicon.ico|logo.*\\.png|.*\\.svg|_next/static|_next/image|fonts|icons|images|api/public).*)",
    ],
};
