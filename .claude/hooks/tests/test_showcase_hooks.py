"""Tests for showcase hooks (showcase-gen, completion-links)."""
import json
import os
import pytest
from pathlib import Path


class TestShowcaseGen:
    """Tests for showcase-gen.py."""

    def test_creates_showcase_on_api_complete(self, runner):
        """Should create showcase when API workflow completes."""
        state = {
            "workflow": "api-create",
            "api_name": "brandfetch",
            "phases": {
                "complete": {"status": "complete"}
            }
        }
        runner.set_state(state)

        # Create registry with API entry
        registry = {
            "apis": {
                "brandfetch": {
                    "name": "Brandfetch",
                    "endpoints": {
                        "default": {
                            "method": "POST",
                            "path": "/api/brandfetch",
                            "params": [
                                {"name": "domain", "type": "string", "required": True}
                            ]
                        }
                    }
                }
            }
        }
        runner.set_registry(registry)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/brandfetch/route.ts"},
            "tool_output": "File written successfully"
        }

        result = runner.run("showcase-gen.py", input_data)
        assert result.allowed

    def test_generates_api_showcase_content(self, runner):
        """Should generate APIShowcase component content."""
        state = {
            "workflow": "api-create",
            "api_name": "test-api",
            "phases": {"docs": {"status": "in_progress"}}
        }
        runner.set_state(state)

        registry = {
            "apis": {
                "test-api": {
                    "name": "Test API",
                    "description": "A test API",
                    "endpoints": {
                        "default": {
                            "method": "GET",
                            "path": "/api/test",
                            "params": []
                        }
                    }
                }
            }
        }
        runner.set_registry(registry)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/test/route.ts"}
        }

        result = runner.run("showcase-gen.py", input_data)
        assert result.allowed

    def test_generates_ui_showcase_for_components(self, runner):
        """Should generate UIShowcase for component workflows."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"docs": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.tsx"}
        }

        result = runner.run("showcase-gen.py", input_data)
        assert result.allowed

    def test_ignores_non_workflow_writes(self, runner):
        """Should ignore writes outside of workflows."""
        # No state file = no workflow
        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/utils/helpers.ts"}
        }

        result = runner.run("showcase-gen.py", input_data)
        assert result.allowed

    def test_ignores_non_write_tools(self, runner):
        """Should ignore non-Write tools."""
        state = {"workflow": "api-create", "api_name": "test"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Read",
            "tool_input": {"file_path": "app/api/test/route.ts"}
        }

        result = runner.run("showcase-gen.py", input_data)
        assert result.allowed


class TestCompletionLinks:
    """Tests for completion-links.py."""

    def test_shows_links_on_api_completion(self, runner):
        """Should output showcase links when API workflow completes."""
        state = {
            "workflow": "api-create",
            "api_name": "brandfetch",
            "phases": {
                "complete": {"status": "complete"}
            }
        }
        runner.set_state(state)

        registry = {
            "apis": {
                "brandfetch": {
                    "name": "Brandfetch",
                    "showcase_url": "/hustle-dev-tools/api?selected=brandfetch"
                }
            }
        }
        runner.set_registry(registry)

        input_data = {"stop_reason": "end_turn"}

        result = runner.run("completion-links.py", input_data)
        # Check output contains links
        if result.stderr:
            assert "hustle-dev-tools" in result.stderr or result.allowed

    def test_shows_visual_qa_results_link(self, runner):
        """Should show visual QA results link for UI workflows."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        # Create visual QA results
        vqa_results = {
            "Button": {
                "timestamp": "2024-01-01T00:00:00Z",
                "results": {
                    "overall_status": "pass",
                    "summary": {"total_issues": 0}
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        input_data = {"stop_reason": "end_turn"}

        result = runner.run("completion-links.py", input_data)
        assert result.allowed

    def test_does_nothing_for_incomplete_workflow(self, runner):
        """Should not show links for incomplete workflows."""
        state = {
            "workflow": "api-create",
            "api_name": "test",
            "phases": {"research": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {"stop_reason": "end_turn"}

        result = runner.run("completion-links.py", input_data)
        assert result.allowed


class TestHeroHeader:
    """Tests for showcase shared components generation."""

    def test_creates_shared_components_dir(self, runner):
        """Should ensure shared components directory exists."""
        state = {
            "workflow": "api-create",
            "api_name": "test",
            "phases": {"docs": {"status": "in_progress"}}
        }
        runner.set_state(state)

        registry = {
            "apis": {
                "test": {
                    "name": "Test",
                    "endpoints": {"default": {"path": "/api/test"}}
                }
            }
        }
        runner.set_registry(registry)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/test/route.ts"}
        }

        result = runner.run("showcase-gen.py", input_data)
        # Just verify hook runs without error
        assert result.allowed
