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
            `${process.env.BACKEND_URL}/api/v1/auth/logout`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${access_token}`, // Add Bearer prefix for standard authorization header format
            },
            body: JSON.stringify({ refresh_token: refreshToken }), // Include the refresh token in the body
        });

        if (!response.ok) {
            const error = await response.json()
            console.error("Logout failed with status:", error);
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
    finally {
        cookieStore.delete("refresh_token") // Ensure the refresh token cookie is deleted even if an error occurs
    }
}

export default logout;