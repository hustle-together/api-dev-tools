"""Pytest fixtures for hook testing."""
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import pytest


class HookResult:
    """Result from running a hook."""

    def __init__(self, exit_code: int, stdout: str, stderr: str):
        self.exit_code = exit_code
        self.stdout = stdout
        self.stderr = stderr

    @property
    def blocked(self) -> bool:
        """Hook blocked the action (exit code 2)."""
        return self.exit_code == 2

    @property
    def allowed(self) -> bool:
        """Hook allowed the action (exit code 0)."""
        return self.exit_code == 0

    @property
    def output_json(self) -> dict | None:
        """Parse stdout as JSON if possible."""
        try:
            return json.loads(self.stdout) if self.stdout.strip() else None
        except json.JSONDecodeError:
            return None


class HookRunner:
    """Runs hooks with mock inputs."""

    def __init__(self, hooks_dir: Path, temp_project_dir: Path):
        self.hooks_dir = hooks_dir
        self.project_dir = temp_project_dir
        self.devkit_dir = temp_project_dir / ".devkit"
        self.devkit_dir.mkdir(parents=True, exist_ok=True)

    def run(self, hook_name: str, input_data: dict[str, Any]) -> HookResult:
        """Run a hook with given input data."""
        hook_path = self.hooks_dir / hook_name

        if not hook_path.exists():
            raise FileNotFoundError(f"Hook not found: {hook_path}")

        # Add cwd to input if not present
        if "cwd" not in input_data:
            input_data["cwd"] = str(self.project_dir)

        # Set environment
        env = os.environ.copy()
        env["CLAUDE_PROJECT_DIR"] = str(self.project_dir)

        # Run hook
        result = subprocess.run(
            ["python3", str(hook_path)],
            input=json.dumps(input_data),
            capture_output=True,
            text=True,
            env=env,
            timeout=10
        )

        return HookResult(result.returncode, result.stdout, result.stderr)

    def set_state(self, state: dict[str, Any]) -> None:
        """Set the devkit state."""
        state_file = self.devkit_dir / "state.json"
        state_file.write_text(json.dumps(state, indent=2))

    def set_registry(self, registry: dict[str, Any]) -> None:
        """Set the devkit registry."""
        registry_file = self.devkit_dir / "registry.json"
        registry_file.write_text(json.dumps(registry, indent=2))

    def get_state(self) -> dict[str, Any] | None:
        """Get current state."""
        state_file = self.devkit_dir / "state.json"
        if state_file.exists():
            return json.loads(state_file.read_text())
        return None


@pytest.fixture
def hooks_dir():
    """Path to hooks directory."""
    return Path(__file__).parent.parent


@pytest.fixture
def temp_project(tmp_path):
    """Temporary project directory for testing."""
    project_dir = tmp_path / "test_project"
    project_dir.mkdir()
    return project_dir


@pytest.fixture
def runner(hooks_dir, temp_project):
    """Hook runner instance."""
    return HookRunner(hooks_dir, temp_project)


@pytest.fixture
def mock_pretool_input():
    """Factory for PreToolUse input data."""
    def _make(tool_name: str = "Edit", file_path: str = "src/test.ts", **kwargs):
        return {
            "tool_name": tool_name,
            "tool_input": {"file_path": file_path, **kwargs},
        }
    return _make


@pytest.fixture
def mock_posttool_input():
    """Factory for PostToolUse input data."""
    def _make(tool_name: str = "Edit", file_path: str = "src/test.ts",
              tool_output: str = "Success", **kwargs):
        return {
            "tool_name": tool_name,
            "tool_input": {"file_path": file_path, **kwargs},
            "tool_output": tool_output,
        }
    return _make


@pytest.fixture
def mock_stop_input():
    """Factory for Stop event input data."""
    def _make(stop_reason: str = "end_turn", **kwargs):
        return {
            "stop_reason": stop_reason,
            **kwargs,
        }
    return _make


@pytest.fixture
def complete_state():
    """State with all phases complete."""
    return {
        "version": "1.0.0",
        "status": "complete",
        "progress": {"currentPhase": "complete", "completedSteps": 14, "totalSteps": 14},
        "phases": {
            "research": {"complete": True},
            "interview": {"complete": True, "answers": {"key": "value"}},
            "schema": {"complete": True},
            "tdd-red": {"complete": True},
            "tdd-green": {"complete": True},
            "verify": {"complete": True},
            "docs": {"complete": True},
        },
        "metrics": {"turnCount": 10, "researchQueries": 5, "testsWritten": 3, "filesCreated": 8}
    }


@pytest.fixture
def incomplete_state():
    """State with phases incomplete."""
    return {
        "version": "1.0.0",
        "status": "in_progress",
        "progress": {"currentPhase": "research", "completedSteps": 1, "totalSteps": 14},
        "phases": {
            "research": {"complete": False},
            "interview": {"complete": False},
            "schema": {"complete": False},
        },
        "metrics": {"turnCount": 2, "researchQueries": 1, "testsWritten": 0, "filesCreated": 0}
    }
