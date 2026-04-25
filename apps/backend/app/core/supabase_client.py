'''
This module provides utility functions for creating and managing a Supabase client instance.
'''
from app.core.config import settings
from supabase import AsyncClient, create_async_client

async def create_supabase_client() -> AsyncClient:
    """
    Create and return a Supabase client instance.

    ### Returns:
        Client: An instance of the Supabase client configured with the URL and anonymous key from settings.
    """
    supabase =  await create_async_client(settings.supabase_url, settings.supabase_anon_key)
    return supabase
