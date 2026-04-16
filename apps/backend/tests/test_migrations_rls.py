from unittest.mock import MagicMock
import importlib.util
from pathlib import Path

import pytest


def _load_migration_module():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "alembic"
        / "versions"
        / "bf3f1bab7a24_add_initial_rls_policies.py"
    )
    spec = importlib.util.spec_from_file_location("migration_rls", migration_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


migration = _load_migration_module()


# Verifies upgrade enables RLS on all intended tables.
def test_upgrade_enables_rls_on_all_target_tables(monkeypatch: pytest.MonkeyPatch) -> None:
    execute_mock = MagicMock()
    monkeypatch.setattr(migration.op, "execute", execute_mock)

    migration.upgrade()

    executed_sql = [call.args[0] for call in execute_mock.call_args_list]
    assert "ALTER TABLE problem ENABLE ROW LEVEL SECURITY" in executed_sql
    assert "ALTER TABLE submission ENABLE ROW LEVEL SECURITY" in executed_sql
    assert "ALTER TABLE result ENABLE ROW LEVEL SECURITY" in executed_sql
    assert 'ALTER TABLE "user" ENABLE ROW LEVEL SECURITY' in executed_sql


# Verifies upgrade creates the public read policy for the problem table.
def test_upgrade_creates_problem_public_read_policy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execute_mock = MagicMock()
    monkeypatch.setattr(migration.op, "execute", execute_mock)

    migration.upgrade()

    executed_sql = [call.args[0] for call in execute_mock.call_args_list]
    assert any("CREATE POLICY problem_public_read_policy" in sql for sql in executed_sql)


# Verifies downgrade removes the public read policy before disabling RLS.
def test_downgrade_drops_problem_public_read_policy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execute_mock = MagicMock()
    monkeypatch.setattr(migration.op, "execute", execute_mock)

    migration.downgrade()

    executed_sql = [call.args[0] for call in execute_mock.call_args_list]
    assert "DROP POLICY IF EXISTS problem_public_read_policy ON problem" in executed_sql


# Verifies downgrade disables RLS on all tables that were enabled in upgrade.
def test_downgrade_disables_rls_on_all_target_tables(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execute_mock = MagicMock()
    monkeypatch.setattr(migration.op, "execute", execute_mock)

    migration.downgrade()

    executed_sql = [call.args[0] for call in execute_mock.call_args_list]
    assert 'ALTER TABLE "user" DISABLE ROW LEVEL SECURITY' in executed_sql
    assert "ALTER TABLE result DISABLE ROW LEVEL SECURITY" in executed_sql
    assert "ALTER TABLE submission DISABLE ROW LEVEL SECURITY" in executed_sql
    assert "ALTER TABLE problem DISABLE ROW LEVEL SECURITY" in executed_sql
