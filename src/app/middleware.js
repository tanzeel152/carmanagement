import { authMiddleware } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "../utils/firebaseConfig"; // Ensure correct path

export async function middleware(request) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys || [""], // Ensure at least one key
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
  });
}

export const config = {
  matcher: [
    "/",
    "/((?!_next|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
