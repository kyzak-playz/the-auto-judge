from collections.abc import Generator

import pytest

from app.core.config import get_settings


@pytest.fixture(autouse=True)
def test_clear_settings_cache() -> Generator[None]:
    # Ensure each test gets a clean settings cache and cannot leak env state.
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
