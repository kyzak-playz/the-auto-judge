"""
Authentication Schemas
------------------------------
This module defines the Pydantic models for authentication-related requests and responses, including user sign-in and login.
- These models are used to validate and structure the data exchanged between the client and the authentication API endpoints.
- Alongside there are more specific models to handle the responses from the Supabase authentication service, ensuring that the data is correctly parsed and utilized within the application and they only relate to authentication and not other functionalities of the application.
"""

from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.enums import UserRole


class AuthCredentialsRequest(BaseModel):
    """Credentials submitted to sign in or sign up."""

    username: str
    password: str


class AuthTokenResponse(BaseModel):
    """Tokens and lifetime returned by login, signup, and refresh."""

    access_token: str
    refresh_token: str
    expires_in: int = 60 * 3


class AuthenticatedUser(BaseModel):
    """Application user profile loaded from the public users table."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    email: str
    role: UserRole


class LogoutRequest(BaseModel):
    """Logout request body; the access token is sent in the request header."""

    refresh_token: str


class LogoutResponse(BaseModel):
    """Response model for user logout."""

    message: str


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing the access token."""

    refresh_token: str
