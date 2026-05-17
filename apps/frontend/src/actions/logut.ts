'use server';
import { makeError } from "@/lib/utils";
import { cookies } from "next/headers";

const logout = async (access_token: string): Promise<boolean> => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        console.error("No refresh token found for logout");
        return false;
    }

    try {
        // Call the API route to logout the user
        const response = await fetch(
            // `${process.env.BACKEND_URL}/api/logout`, 
            "http://localhost:3000/api/logout", 
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`,
                "refresh_token": refreshToken, // Include the refresh token in the header
            },
        });

        if (!response.ok) {
            console.error("Logout failed with status:", response.status);
            return false;
        }

        // Clear the refresh token cookie
        console.log("Clearing refresh token cookie");
        cookieStore.delete("refresh_token")

        return true;
    } catch (error) {
        console.error("Logout error:", error);
        throw makeError(`Logout failed: ${error instanceof Error ? error.message : String(error)}`, 500, "LogoutError");
    }
}

export default logout;