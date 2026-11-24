"""
This module provides utility functions for creating and managing a Supabase client instance.
"""

from supabase import AsyncClient, AuthApiError, create_async_client
from supabase_auth import User

from app.core.config import settings
from app.exceptions import HTTPException


async def create_supabase_client() -> AsyncClient:
    """
    Create and return a Supabase client instance.

    ### Returns:
        Client: An instance of the Supabase client configured with the URL and publishable key from settings.
    """
    supabase = await create_async_client(settings.supabase_url, settings.supabase_publishable_key)
    return supabase


async def supabase_user(token: str) -> User:
    """
    Get the current user information from the Supabase client using the provided access token.

    ### Parameters:
        token (str): The access token to authenticate the request.

    ### Returns:
        User: The authenticated Supabase user if the token is valid.

    ### Raises:
        HTTPException: If the token is invalid or expired.
    """
    supabase = await create_supabase_client()
    try:
        user_info = await supabase.auth.get_user(token)
    except AuthApiError as error:
        raise HTTPException(
            status=401,
            message="Unauthorized: Invalid or expired token",
            code="INVALID_TOKEN",
        ) from error

    if not user_info or not user_info.user:
        raise HTTPException(
            status=401,
            message="Unauthorized: Invalid or expired token",
            code="INVALID_TOKEN",
        )

    return user_info.user
