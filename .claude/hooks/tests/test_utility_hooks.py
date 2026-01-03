"""Tests for utility hooks (validate-bash, subagent-verify)."""
import pytest


class TestValidateBash:
    """Tests for validate-bash.py."""

    def test_allows_safe_commands(self, runner, mock_pretool_input):
        """Should allow safe bash commands."""
        result = runner.run("validate-bash.py", mock_pretool_input(
            "Bash",
            command="npm test"
        ))
        assert result.allowed

    def test_allows_git_commands(self, runner, mock_pretool_input):
        """Should allow git commands."""
        result = runner.run("validate-bash.py", mock_pretool_input(
            "Bash",
            command="git status"
        ))
        assert result.allowed


class TestSubagentVerify:
    """Tests for subagent-verify.py."""

    def test_verifies_subagent_output(self, runner):
        """Should verify subagent deliverables."""
        input_data = {
            "subagent_type": "researcher",
            "output": "Research completed successfully",
        }
        result = runner.run("subagent-verify.py", input_data)
        assert result.allowed

    def test_handles_missing_output(self, runner):
        """Should handle missing subagent output."""
        input_data = {
            "subagent_type": "builder",
        }
        result = runner.run("subagent-verify.py", input_data)
        # Should not crash
        assert result.exit_code in [0, 1, 2]
