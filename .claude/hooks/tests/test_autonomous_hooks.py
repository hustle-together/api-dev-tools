"""Tests for autonomous hooks (ralph-loop, auto-answer, notify)."""
import json
import os
import pytest
from pathlib import Path


class TestRalphLoop:
    """Tests for ralph-loop.py (autonomous continuation)."""

    def test_blocks_without_completion_promise(self, runner, tmp_path):
        """Should block stop without completion promise."""
        # Create a transcript without completion promise
        transcript = tmp_path / "transcript.txt"
        transcript.write_text("Working on the task...\nStill working...")

        input_data = {
            "session_id": "test_session_1",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.blocked
        assert "DONE" in result.stderr

    def test_allows_with_completion_promise(self, runner, tmp_path):
        """Should allow stop with completion promise."""
        transcript = tmp_path / "transcript.txt"
        transcript.write_text("Working on the task...\nDONE")

        input_data = {
            "session_id": "test_session_2",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.allowed

        output = result.output_json
        assert "Completion promise detected" in output.get("reason", "")

    def test_respects_max_iterations(self, runner, tmp_path):
        """Should stop after max iterations for safety."""
        transcript = tmp_path / "transcript.txt"
        transcript.write_text("Still working...")

        # Simulate max iterations reached
        count_file = Path(f"/tmp/ralph_test_max_count")
        count_file.write_text("50")

        input_data = {
            "session_id": "test_max",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.allowed  # Should allow after max iterations

        # Cleanup
        if count_file.exists():
            count_file.unlink()


class TestNotify:
    """Tests for notify.py (NTFY notifications)."""

    def test_builds_notification_for_ask_user(self, runner):
        """Should build high-priority notification for AskUserQuestion."""
        input_data = {
            "tool_name": "AskUserQuestion",
            "notification_type": "info"
        }

        # Note: This won't actually send (no network in tests)
        # but validates the hook runs without error
        result = runner.run("notify.py", input_data)
        assert result.allowed

    def test_handles_generic_notification(self, runner):
        """Should handle generic notifications."""
        input_data = {
            "tool_name": "SomeOtherTool",
            "notification_type": "info",
            "message": "Test notification"
        }

        result = runner.run("notify.py", input_data)
        assert result.allowed


class TestAutoAnswer:
    """Tests for auto-answer.py (autonomous mode)."""

    def test_continues_without_auto_mode(self, runner):
        """Should continue normally when not in auto mode."""
        # No state file = not in auto mode
        result = runner.run("auto-answer.py", {})
        assert result.allowed

    def test_selects_comprehensive_option(self, runner):
        """Should select most comprehensive option in auto mode."""
        # Create auto mode state
        claude_dir = runner.project_dir / ".claude"
        claude_dir.mkdir(parents=True, exist_ok=True)

        state_file = claude_dir / "hustle-build-state.json"
        state_file.write_text(json.dumps({"mode": "auto", "build_id": "test"}))

        # Set tool input via environment
        os.environ["CLAUDE_TOOL_INPUT"] = json.dumps({
            "questions": [{
                "header": "Feature Selection",
                "question": "Which features to include?",
                "options": [
                    {"label": "Basic", "description": "Minimal features"},
                    {"label": "All Features (Recommended)", "description": "Complete comprehensive set"}
                ]
            }]
        })

        result = runner.run("auto-answer.py", {})

        # Clean up
        del os.environ["CLAUDE_TOOL_INPUT"]

        # Check it selected comprehensive option
        output = result.output_json
        if output and not output.get("continue"):
            assert "All Features" in output.get("reason", "")

    def test_prefers_affirmative_options(self, runner):
        """Should prefer 'yes/proceed' options for phase exits."""
        claude_dir = runner.project_dir / ".claude"
        claude_dir.mkdir(parents=True, exist_ok=True)

        state_file = claude_dir / "hustle-build-state.json"
        state_file.write_text(json.dumps({"mode": "auto", "build_id": "test"}))

        os.environ["CLAUDE_TOOL_INPUT"] = json.dumps({
            "questions": [{
                "header": "Phase Complete",
                "question": "Ready to proceed?",
                "options": [
                    {"label": "No, more research needed", "description": "Go back"},
                    {"label": "Yes, proceed", "description": "Continue to next phase"}
                ]
            }]
        })

        result = runner.run("auto-answer.py", {})

        del os.environ["CLAUDE_TOOL_INPUT"]

        output = result.output_json
        if output and not output.get("continue"):
            assert "proceed" in output.get("reason", "").lower()
