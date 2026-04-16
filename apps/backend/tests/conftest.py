from collections.abc import Generator

from app.core.config import get_settings
import pytest


@pytest.fixture(autouse=True)
def test_clear_settings_cache() -> Generator[None, None, None]:
    # Ensure each test gets a clean settings cache and cannot leak env state.
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
