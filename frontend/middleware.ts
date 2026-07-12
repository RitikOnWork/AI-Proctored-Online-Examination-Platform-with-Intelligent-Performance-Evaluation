import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value?.toLowerCase();

  const isStudentRoute = pathname.startsWith("/student");
  const isLoginRoute = pathname.startsWith("/login");

  // Protect student dashboard routes
  if (isStudentRoute) {
    if (!accessToken || userRole !== "student") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated students from login back to dashboard
  if (isLoginRoute) {
    if (accessToken && userRole === "student") {
      const dashboardUrl = new URL("/student/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: ["/student/:path*", "/login"],
};
