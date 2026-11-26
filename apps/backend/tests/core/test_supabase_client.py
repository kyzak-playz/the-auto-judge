from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.core import supabase_client as supabase_module
from app.exceptions import HTTPException


@pytest.mark.anyio
async def test_create_supabase_client_uses_settings_values(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake_client = object()
    monkeypatch.setattr(
        supabase_module,
        "settings",
        SimpleNamespace(
            supabase_url="https://example.supabase.co",
            supabase_publishable_key="publishable-key",
        ),
    )
    create_async_client_mock = AsyncMock(return_value=fake_client)
    monkeypatch.setattr(supabase_module, "create_async_client", create_async_client_mock)

    result = await supabase_module.create_supabase_client()

    assert result is fake_client
    create_async_client_mock.assert_awaited_once_with(
        "https://example.supabase.co",
        "publishable-key",
    )


@pytest.mark.anyio
async def test_supabase_user_returns_authenticated_user(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = SimpleNamespace(id="user-1", email="user@example.com")
    supabase = SimpleNamespace(auth=SimpleNamespace(get_user=AsyncMock(return_value=SimpleNamespace(user=user))))
    monkeypatch.setattr(supabase_module, "create_supabase_client", AsyncMock(return_value=supabase))

    result = await supabase_module.supabase_user("access-token")

    assert result is user


@pytest.mark.anyio
async def test_supabase_user_raises_when_user_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    supabase = SimpleNamespace(auth=SimpleNamespace(get_user=AsyncMock(return_value=SimpleNamespace(user=None))))
    monkeypatch.setattr(supabase_module, "create_supabase_client", AsyncMock(return_value=supabase))

    with pytest.raises(HTTPException) as exc_info:
        await supabase_module.supabase_user("access-token")

    assert exc_info.value.status == 401
    assert exc_info.value.code == "INVALID_TOKEN"
