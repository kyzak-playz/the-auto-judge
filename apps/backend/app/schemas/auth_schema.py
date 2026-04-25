"""
Authentication Schemas
------------------------------
This module defines the Pydantic models for authentication-related requests and responses, including user sign-in and login.
- These models are used to validate and structure the data exchanged between the client and the authentication API endpoints.
- Alongside there are more specific models to handle the responses from the Supabase authentication service, ensuring that the data is correctly parsed and utilized within the application and they only relate to authentication and not other functionalities of the application.
"""

from pydantic import BaseModel


class SignInRequest(BaseModel):
    """Request model for user sign-in."""

    email: str
    password: str


class SignInResponse(BaseModel):
    """Response model for user sign-in."""

    access_token: str
    token_type: str
    expires_in: int = 60 * 3  # Access token expires in 3 minutes


class LoginRequest(BaseModel):
    """Request model for user login."""

    email: str
    password: str


class SupabaseUser(BaseModel):
    """
    Model representing a user as returned by Supabase authentication service.

    Attributes:
        id (str): The unique identifier of the user.
        email (str): The email address of the user.
        role (str): The role of the user, which can be used for authorization purposes.
    """

    id: str
    email: str
    role: str


class LoginResponse(BaseModel):
    """Response model for user login."""

    access_token: str
    token_type: str
    expires_in: int = 60 * 3  # Access token expires in 3 minutes

class LogoutRequest(BaseModel):
    """Request model for user logout."""
    refresh_token: str

class LogoutResponse(BaseModel):
    """Response model for user logout."""

    message: str



class userLoggedInSuccessfully(BaseModel):
    """Model for successful user login response from Supabase."""

    access_token: str
    refresh_token: str
    expires_in: int = 60 * 3  # Access token expires in 3 minutes
    user: SupabaseUser # Assuming the response includes user information, adjust as needed based on actual Supabase response structure
