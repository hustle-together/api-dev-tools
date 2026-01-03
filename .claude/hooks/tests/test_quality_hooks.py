"""Tests for quality hooks (format, code-review, visual-qa)."""
import json
import pytest


class TestFormat:
    """Tests for format.py."""

    def test_runs_on_code_files(self, runner, mock_posttool_input):
        """Should run formatter on code file changes."""
        result = runner.run("format.py", mock_posttool_input("Edit", "src/api.ts"))
        assert result.allowed  # Should not block

    def test_ignores_non_edit_tools(self, runner, mock_posttool_input):
        """Should ignore non-edit tools."""
        result = runner.run("format.py", mock_posttool_input("Read", "src/api.ts"))
        assert result.allowed


class TestCodeReview:
    """Tests for code-review.py."""

    def test_queues_review_in_green_phase(self, runner, mock_posttool_input):
        """Should queue review after TDD green phase."""
        state = {"progress": {"currentPhase": "tdd-green"}}
        runner.set_state(state)

        result = runner.run("code-review.py", mock_posttool_input("Edit", "src/api.ts"))
        assert result.allowed

        # Check pending reviews file created
        pending = runner.devkit_dir / "pending-reviews.json"
        assert pending.exists()

    def test_skips_test_files(self, runner, mock_posttool_input):
        """Should skip test files for review."""
        state = {"progress": {"currentPhase": "tdd-green"}}
        runner.set_state(state)

        result = runner.run("code-review.py", mock_posttool_input("Edit", "src/api.test.ts"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-reviews.json"
        assert not pending.exists()

    def test_skips_spec_files(self, runner, mock_posttool_input):
        """Should skip spec files for review."""
        state = {"progress": {"currentPhase": "tdd-green"}}
        runner.set_state(state)

        result = runner.run("code-review.py", mock_posttool_input("Edit", "src/api.spec.ts"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-reviews.json"
        assert not pending.exists()


class TestVisualQA:
    """Tests for visual-qa.py."""

    def test_queues_ui_components(self, runner, mock_posttool_input):
        """Should queue visual tests for UI components."""
        result = runner.run("visual-qa.py", mock_posttool_input("Edit", "src/components/Button.tsx"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-visual-tests.json"
        assert pending.exists()

        content = pending.read_text()
        assert "Button.tsx" in content
        assert "1920x1080" in content  # Default viewport

    def test_queues_story_files(self, runner, mock_posttool_input):
        """Should queue visual tests for story files."""
        result = runner.run("visual-qa.py", mock_posttool_input("Write", "src/Button.stories.tsx"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-visual-tests.json"
        assert pending.exists()

    def test_queues_page_files(self, runner, mock_posttool_input):
        """Should queue visual tests for page files."""
        result = runner.run("visual-qa.py", mock_posttool_input("Edit", "app/dashboard/page.tsx"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-visual-tests.json"
        assert pending.exists()

    def test_ignores_non_ui_files(self, runner, mock_posttool_input):
        """Should ignore non-UI files."""
        result = runner.run("visual-qa.py", mock_posttool_input("Edit", "src/utils/api.ts"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-visual-tests.json"
        assert not pending.exists()

    def test_ignores_read_tool(self, runner, mock_posttool_input):
        """Should ignore Read tool."""
        result = runner.run("visual-qa.py", mock_posttool_input("Read", "src/components/Button.tsx"))
        assert result.allowed

        pending = runner.devkit_dir / "pending-visual-tests.json"
        assert not pending.exists()
