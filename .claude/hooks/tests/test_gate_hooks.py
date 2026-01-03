"""Tests for gate hooks (research, interview, schema, tdd, verify, docs)."""
import pytest


class TestResearchGate:
    """Tests for research-gate.py."""

    def test_blocks_edit_without_research(self, runner, mock_pretool_input, incomplete_state):
        """Should block Edit when research not complete."""
        runner.set_state(incomplete_state)
        result = runner.run("research-gate.py", mock_pretool_input("Edit"))
        assert result.blocked
        assert "research" in result.stderr.lower()

    def test_allows_edit_with_research(self, runner, mock_pretool_input, complete_state):
        """Should allow Edit when research is complete."""
        runner.set_state(complete_state)
        result = runner.run("research-gate.py", mock_pretool_input("Edit"))
        assert result.allowed

    def test_allows_read_without_research(self, runner, mock_pretool_input, incomplete_state):
        """Should allow Read regardless of research status."""
        runner.set_state(incomplete_state)
        result = runner.run("research-gate.py", mock_pretool_input("Read"))
        assert result.allowed

    def test_blocks_without_state_file(self, runner, mock_pretool_input):
        """Should block when no state file exists (enforces research-first)."""
        result = runner.run("research-gate.py", mock_pretool_input("Edit"))
        assert result.blocked
        assert "research" in result.stderr.lower()


class TestInterviewGate:
    """Tests for interview-gate.py."""

    def test_blocks_without_interview(self, runner, mock_pretool_input, incomplete_state):
        """Should block when interview not complete."""
        runner.set_state(incomplete_state)
        result = runner.run("interview-gate.py", mock_pretool_input("Write"))
        assert result.blocked
        assert "interview" in result.stderr.lower()

    def test_allows_with_interview(self, runner, mock_pretool_input, complete_state):
        """Should allow when interview is complete."""
        runner.set_state(complete_state)
        result = runner.run("interview-gate.py", mock_pretool_input("Write"))
        assert result.allowed

    def test_ignores_non_code_tools(self, runner, mock_pretool_input, incomplete_state):
        """Should ignore non-code-modifying tools."""
        runner.set_state(incomplete_state)
        result = runner.run("interview-gate.py", mock_pretool_input("Read"))
        assert result.allowed


class TestSchemaGate:
    """Tests for schema-gate.py."""

    def test_blocks_without_schema(self, runner, mock_pretool_input, incomplete_state):
        """Should block when schema not complete."""
        runner.set_state(incomplete_state)
        result = runner.run("schema-gate.py", mock_pretool_input("Edit"))
        assert result.blocked
        assert "schema" in result.stderr.lower()

    def test_allows_with_schema(self, runner, mock_pretool_input, complete_state):
        """Should allow when schema is complete."""
        runner.set_state(complete_state)
        result = runner.run("schema-gate.py", mock_pretool_input("Edit"))
        assert result.allowed


class TestTddGate:
    """Tests for tdd-gate.py."""

    def test_blocks_impl_without_tests(self, runner, mock_pretool_input):
        """Should block implementation files without tests."""
        state = {
            "phases": {"tdd-red": {"complete": False}},
            "progress": {"currentPhase": "tdd-green"}
        }
        runner.set_state(state)
        result = runner.run("tdd-gate.py", mock_pretool_input("Edit", "src/api.ts"))
        assert result.blocked
        assert "test" in result.stderr.lower()

    def test_allows_test_files(self, runner, mock_pretool_input):
        """Should allow writing test files."""
        state = {"phases": {"tdd-red": {"complete": False}}}
        runner.set_state(state)
        result = runner.run("tdd-gate.py", mock_pretool_input("Edit", "src/api.test.ts"))
        assert result.allowed

    def test_allows_after_tdd_red(self, runner, mock_pretool_input):
        """Should allow implementation after TDD red phase."""
        state = {"phases": {"tdd-red": {"complete": True}}}
        runner.set_state(state)
        result = runner.run("tdd-gate.py", mock_pretool_input("Edit", "src/api.ts"))
        assert result.allowed


class TestVerifyGate:
    """Tests for verify-gate.py.

    Note: verify-gate runs npm test to verify, not state-based.
    """

    def test_allows_when_stop_hook_active(self, runner, mock_stop_input):
        """Should allow when stop_hook_active is True (prevents infinite loops)."""
        result = runner.run("verify-gate.py", mock_stop_input(stop_hook_active=True))
        assert result.allowed

    def test_runs_verification(self, runner, mock_stop_input):
        """Should attempt verification (npm test) on stop."""
        # Without npm configured, this will fail silently and allow
        result = runner.run("verify-gate.py", mock_stop_input())
        assert result.allowed  # Allows when npm test not available


class TestDocsGate:
    """Tests for docs-gate.py."""

    def test_blocks_stop_without_docs(self, runner, mock_stop_input, incomplete_state):
        """Should block stop when docs not complete."""
        runner.set_state(incomplete_state)
        result = runner.run("docs-gate.py", mock_stop_input())
        assert result.blocked
        assert "documentation" in result.stderr.lower()

    def test_allows_stop_with_docs(self, runner, mock_stop_input, complete_state):
        """Should allow stop when docs is complete."""
        runner.set_state(complete_state)
        result = runner.run("docs-gate.py", mock_stop_input())
        assert result.allowed
