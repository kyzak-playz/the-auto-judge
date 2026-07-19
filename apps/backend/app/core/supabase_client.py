'''
This module provides utility functions for creating and managing a Supabase client instance.
'''
from app.core.config import settings
from supabase import AsyncClient, create_async_client

async def create_supabase_client() -> AsyncClient:
    """
    Create and return a Supabase client instance.

    ### Returns:
        Client: An instance of the Supabase client configured with the URL and publishable key from settings.
    """
    supabase =  await create_async_client(settings.supabase_url, settings.supabase_publishable_key)
    return supabase

async def get_current_user(token: str):
    """
    Get the current user information from the Supabase client using the provided access token.

    ### Parameters:
        token (str): The access token to authenticate the request.

    ### Returns:
        dict: A dictionary containing user information if the token is valid.

    ### Raises:
        Exception: If the token is invalid or expired, an exception will be raised.
    """
    supabase = await create_supabase_client()
    user_info = await supabase.auth.get_user(token)
    
    if not user_info or not user_info.user:
        raise Exception("Unauthorized: Invalid or expired token")
    
    return user_info.user