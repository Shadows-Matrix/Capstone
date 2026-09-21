import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

function dashboardFor(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") return "/provider";
  return "/customer";
}

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  // Signed-in users skip auth pages
  if ((path === "/login" || path === "/register") && session) {
    return Response.redirect(new URL(dashboardFor(role), nextUrl));
  }

  const requiredRole =
    path.startsWith("/admin")
      ? "ADMIN"
      : path.startsWith("/provider")
        ? "PROVIDER"
        : path.startsWith("/customer")
          ? "CUSTOMER"
          : null;

  if (!requiredRole) return; // public route

  if (!session) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }

  if (role !== requiredRole) {
    return Response.redirect(new URL(dashboardFor(role), nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*", "/customer/:path*", "/login", "/register"],
};
