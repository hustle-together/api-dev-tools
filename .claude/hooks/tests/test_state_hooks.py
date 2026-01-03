"""Tests for state management hooks."""
import json
import pytest


class TestStateManager:
    """Tests for state-manager.py."""

    def test_creates_state_if_missing(self, runner, mock_posttool_input):
        """Should create state.json if it doesn't exist."""
        result = runner.run("state-manager.py", mock_posttool_input("Edit"))
        assert result.allowed

        state = runner.get_state()
        assert state is not None
        assert "metrics" in state
        assert state["metrics"]["filesCreated"] >= 1

    def test_increments_file_count(self, runner, mock_posttool_input, incomplete_state):
        """Should increment file count on Edit/Write."""
        incomplete_state["metrics"]["filesCreated"] = 5
        runner.set_state(incomplete_state)

        result = runner.run("state-manager.py", mock_posttool_input("Write"))
        assert result.allowed

        state = runner.get_state()
        assert state["metrics"]["filesCreated"] == 6

    def test_increments_research_queries(self, runner, mock_posttool_input, incomplete_state):
        """Should increment research queries on WebSearch/WebFetch."""
        incomplete_state["metrics"]["researchQueries"] = 3
        runner.set_state(incomplete_state)

        result = runner.run("state-manager.py", mock_posttool_input("WebSearch"))
        assert result.allowed

        state = runner.get_state()
        assert state["metrics"]["researchQueries"] == 4

    def test_increments_turn_count(self, runner, mock_posttool_input, incomplete_state):
        """Should always increment turn count."""
        incomplete_state["metrics"]["turnCount"] = 10
        runner.set_state(incomplete_state)

        result = runner.run("state-manager.py", mock_posttool_input("Read"))
        assert result.allowed

        state = runner.get_state()
        assert state["metrics"]["turnCount"] == 11


class TestSessionManager:
    """Tests for session-manager.py."""

    def test_injects_state_context(self, runner, complete_state):
        """Should inject workflow context at session start."""
        runner.set_state(complete_state)
        result = runner.run("session-manager.py", {"cwd": str(runner.project_dir)})
        assert result.allowed

        output = result.output_json
        assert output is not None
        assert "hookSpecificOutput" in output
        assert "additionalContext" in output["hookSpecificOutput"]

    def test_handles_missing_state(self, runner):
        """Should handle missing state gracefully."""
        result = runner.run("session-manager.py", {"cwd": str(runner.project_dir)})
        assert result.allowed


class TestRegistryManager:
    """Tests for registry-manager.py."""

    def test_updates_registry_on_file_change(self, runner, mock_posttool_input):
        """Should update registry when files change."""
        runner.set_registry({"artifacts": {"files": []}})
        result = runner.run("registry-manager.py", mock_posttool_input("Edit", "src/api.ts"))
        assert result.allowed

    def test_creates_registry_if_missing(self, runner, mock_posttool_input):
        """Should create registry if it doesn't exist."""
        result = runner.run("registry-manager.py", mock_posttool_input("Write", "src/new.ts"))
        assert result.allowed


class TestReground:
    """Tests for reground.py (periodic context injection)."""

    def test_injects_at_interval(self, runner, mock_stop_input, complete_state):
        """Should inject context at 7-turn intervals."""
        complete_state["metrics"]["turnCount"] = 14  # Multiple of 7
        runner.set_state(complete_state)

        result = runner.run("reground.py", mock_stop_input())
        assert result.allowed

        output = result.output_json
        assert output is not None
        assert "hookSpecificOutput" in output
        assert output["hookSpecificOutput"]["hookEventName"] == "Reground"

    def test_no_inject_off_interval(self, runner, mock_stop_input, complete_state):
        """Should not inject when not at interval."""
        complete_state["metrics"]["turnCount"] = 10  # Not multiple of 7
        runner.set_state(complete_state)

        result = runner.run("reground.py", mock_stop_input())
        assert result.allowed
        assert result.stdout.strip() == ""  # No output


class TestCapacityWarning:
    """Tests for capacity-warning.py."""

    def test_warns_at_50_percent(self, runner):
        """Should warn at 50% capacity."""
        result = runner.run("capacity-warning.py", {
            "context_tokens_used": 100000,
            "context_limit": 200000
        })
        assert result.allowed

        output = result.output_json
        assert output is not None
        assert "50%" in output["hookSpecificOutput"]["warning"]

    def test_warns_at_75_percent(self, runner):
        """Should warn at 75% capacity."""
        result = runner.run("capacity-warning.py", {
            "context_tokens_used": 150000,
            "context_limit": 200000
        })
        assert result.allowed

        output = result.output_json
        assert output is not None
        assert "75%" in output["hookSpecificOutput"]["warning"]

    def test_warns_at_90_percent(self, runner):
        """Should warn critically at 90% capacity."""
        result = runner.run("capacity-warning.py", {
            "context_tokens_used": 180000,
            "context_limit": 200000
        })
        assert result.allowed

        output = result.output_json
        assert output is not None
        assert "90%" in output["hookSpecificOutput"]["warning"]
        assert "CRITICAL" in output["hookSpecificOutput"]["warning"]

    def test_no_warn_under_50(self, runner):
        """Should not warn under 50%."""
        result = runner.run("capacity-warning.py", {
            "context_tokens_used": 50000,
            "context_limit": 200000
        })
        assert result.allowed
        assert result.stdout.strip() == ""
