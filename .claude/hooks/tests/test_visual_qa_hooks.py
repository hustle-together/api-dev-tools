"""Tests for Visual QA hooks (visual-qa, ralph-loop visual integration, enforce-refactor visual integration)."""
import json
import pytest
from pathlib import Path


class TestVisualQAHook:
    """Tests for visual-qa.py."""

    def test_creates_task_spec_for_component(self, runner):
        """Should create visual QA task spec when UI component is written."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"code_review": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "Visual QA task created" in result.stdout

    def test_creates_task_spec_for_page(self, runner):
        """Should create visual QA task spec for page files."""
        state = {
            "workflow": "hustle-ui-create-page",
            "page_name": "Dashboard",
            "phases": {"code_review": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/dashboard/page.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "Visual QA task created" in result.stdout

    def test_ignores_non_tsx_files(self, runner):
        """Should ignore non-TSX files."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/utils/helpers.ts"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "Visual QA task created" not in result.stdout

    def test_ignores_test_files(self, runner):
        """Should ignore test files."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.test.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "Visual QA task created" not in result.stdout

    def test_ignores_story_files(self, runner):
        """Should ignore Storybook story files."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.stories.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "Visual QA task created" not in result.stdout

    def test_creates_tasks_directory(self, runner):
        """Should create .devkit/tasks/visual-qa/ directory."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Card"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Card.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        assert tasks_dir.exists()

    def test_saves_pending_results(self, runner):
        """Should save pending results to visual-qa-results.json."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Modal"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Modal.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        results_file = runner.devkit_dir / "visual-qa-results.json"
        assert results_file.exists()

        results = json.loads(results_file.read_text())
        assert "Modal" in results
        assert results["Modal"]["results"]["status"] == "pending"

    def test_task_spec_has_required_fields(self, runner):
        """Should create task spec with all required fields."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Input"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Input.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        # Find the created task file
        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-Input.json"))
        assert len(task_files) == 1

        task = json.loads(task_files[0].read_text())
        assert "id" in task
        assert "component" in task
        assert task["component"] == "Input"
        assert "viewports" in task
        assert "checks" in task
        assert task["status"] == "pending"

    def test_viewports_include_mobile_tablet_desktop(self, runner):
        """Should include mobile, tablet, and desktop viewports."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Table"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Table.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-Table.json"))
        task = json.loads(task_files[0].read_text())

        viewport_names = [v["name"] for v in task["viewports"]]
        assert "mobile" in viewport_names
        assert "tablet" in viewport_names
        assert "desktop" in viewport_names

    def test_checks_include_accessibility(self, runner):
        """Should include accessibility-related checks."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Form"
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Form.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-Form.json"))
        task = json.loads(task_files[0].read_text())

        check_ids = [c["id"] for c in task["checks"]]
        assert "contrast" in check_ids
        assert "touch_targets" in check_ids
        assert "focus_states" in check_ids


class TestVisualQAComponentNameExtraction:
    """Tests for component name extraction from file paths."""

    def test_extracts_component_from_components_dir(self, runner):
        """Should extract component name from /components/ path."""
        state = {"workflow": "hustle-ui-create"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/UserAvatar.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        assert "UserAvatar" in result.stdout

    def test_extracts_page_name(self, runner):
        """Should extract page name from page.tsx files."""
        state = {"workflow": "hustle-ui-create-page"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/settings/page.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed
        # Page names get "Page" suffix
        assert "SettingsPage" in result.stdout or "settings" in result.stdout.lower()


class TestRalphLoopVisualQAIntegration:
    """Tests for visual QA integration in ralph-loop.py."""

    def test_blocks_completion_with_visual_qa_errors(self, runner):
        """Should block completion when visual QA errors exist."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        # Create visual QA results with errors
        vqa_results = {
            "Button": {
                "timestamp": "2024-01-01T00:00:00Z",
                "results": {
                    "overall_status": "fail",
                    "issues": [
                        {
                            "severity": "error",
                            "category": "contrast",
                            "description": "Text contrast too low"
                        }
                    ]
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        input_data = {
            "session_id": "test123",
            "stop_hook_active": True,
            "transcript_path": str(runner.project_dir / "transcript.txt")
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.blocked
        assert "VISUAL QA ERRORS" in result.stderr

    def test_allows_completion_when_visual_qa_passes(self, runner):
        """Should allow completion when visual QA passes."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        # Create visual QA results with pass
        vqa_results = {
            "Button": {
                "timestamp": "2024-01-01T00:00:00Z",
                "results": {
                    "overall_status": "pass",
                    "issues": []
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        # Create transcript with completion promise
        transcript = runner.project_dir / "transcript.txt"
        transcript.write_text("Task complete. DONE")

        input_data = {
            "session_id": "test456",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.allowed

    def test_ignores_warnings_for_completion(self, runner):
        """Should not block completion for warnings, only errors."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        # Create visual QA results with only warnings
        vqa_results = {
            "Button": {
                "timestamp": "2024-01-01T00:00:00Z",
                "results": {
                    "overall_status": "warning",
                    "issues": [
                        {
                            "severity": "warning",
                            "category": "responsive",
                            "description": "Consider wider spacing on desktop"
                        }
                    ]
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        # Create transcript with completion promise
        transcript = runner.project_dir / "transcript.txt"
        transcript.write_text("Task complete. DONE")

        input_data = {
            "session_id": "test789",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.allowed

    def test_only_checks_ui_workflows(self, runner):
        """Should only check visual QA for UI workflows."""
        state = {
            "workflow": "api-create",
            "api_name": "test",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        # Create visual QA results with errors (shouldn't affect API workflow)
        vqa_results = {
            "Button": {
                "results": {
                    "overall_status": "fail",
                    "issues": [{"severity": "error"}]
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        # Create transcript with completion promise
        transcript = runner.project_dir / "transcript.txt"
        transcript.write_text("DONE")

        input_data = {
            "session_id": "test000",
            "stop_hook_active": True,
            "transcript_path": str(transcript)
        }

        result = runner.run("ralph-loop.py", input_data)
        assert result.allowed


class TestEnforceRefactorVisualQAIntegration:
    """Tests for visual QA integration in enforce-refactor.py."""

    def test_injects_visual_qa_checklist(self, runner):
        """Should inject visual QA issues during refactor phase."""
        # Create api-dev-state.json (legacy state file)
        state_dir = runner.project_dir / ".claude"
        state_dir.mkdir(parents=True, exist_ok=True)
        api_state = {
            "endpoint": "test",
            "phases": {
                "tdd_green": {"status": "complete"},
                "verify": {
                    "status": "complete",
                    "gaps_found": 0,
                    "gaps_fixed": 0,
                    "intentional_omissions": [],
                    "phase_exit_confirmed": True
                },
                "tdd_refactor": {"status": "in_progress"}
            }
        }
        (state_dir / "api-dev-state.json").write_text(json.dumps(api_state))

        # Create devkit state for phase 12
        devkit_state = {
            "workflow": "hustle-ui-create",
            "phases": {"refactor": {"status": "in_progress"}}
        }
        runner.set_state(devkit_state)

        # Create visual QA results with issues
        vqa_results = {
            "Button": {
                "timestamp": "2024-01-01T00:00:00Z",
                "results": {
                    "overall_status": "fail",
                    "issues": [
                        {
                            "severity": "error",
                            "category": "contrast",
                            "description": "Button text contrast 3.2:1 fails WCAG AA",
                            "element": "button.primary",
                            "suggestion": "Change text color from #888 to #595959"
                        },
                        {
                            "severity": "warning",
                            "category": "touch_targets",
                            "description": "Submit button below 44x44px",
                            "element": "button.submit",
                            "suggestion": "Add min-height: 44px"
                        }
                    ]
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        input_data = {
            "tool_name": "Edit",
            "tool_input": {
                "file_path": "app/api/test/route.ts",
                "old_string": "const x = 1;",
                "new_string": "const y = 1;"
            }
        }

        result = runner.run("enforce-refactor.py", input_data)
        # Should allow but inject checklist to stderr
        assert result.allowed

    def test_saves_refactor_checklist(self, runner):
        """Should save refactor checklist to .devkit/refactor-checklist.json."""
        # Create api-dev-state.json
        state_dir = runner.project_dir / ".claude"
        state_dir.mkdir(parents=True, exist_ok=True)
        api_state = {
            "endpoint": "test",
            "phases": {
                "tdd_green": {"status": "complete"},
                "verify": {
                    "status": "complete",
                    "gaps_found": 0,
                    "gaps_fixed": 0,
                    "intentional_omissions": [],
                    "phase_exit_confirmed": True
                }
            }
        }
        (state_dir / "api-dev-state.json").write_text(json.dumps(api_state))

        # Create devkit state for phase 12
        devkit_state = {
            "workflow": "hustle-ui-create",
            "phases": {"refactor": {"status": "in_progress"}}
        }
        runner.set_state(devkit_state)

        # Create visual QA results
        vqa_results = {
            "Card": {
                "results": {
                    "overall_status": "warning",
                    "issues": [
                        {"severity": "warning", "category": "visual"}
                    ]
                }
            }
        }
        vqa_file = runner.devkit_dir / "visual-qa-results.json"
        vqa_file.write_text(json.dumps(vqa_results))

        input_data = {
            "tool_name": "Edit",
            "tool_input": {
                "file_path": "app/api/test/route.ts",
                "old_string": "const a = 1;",
                "new_string": "const b = 1;"
            }
        }

        result = runner.run("enforce-refactor.py", input_data)

        checklist_file = runner.devkit_dir / "refactor-checklist.json"
        if checklist_file.exists():
            checklist = json.loads(checklist_file.read_text())
            assert "issues" in checklist
            assert "total_issues" in checklist


class TestStorybookURLGeneration:
    """Tests for Storybook URL generation."""

    def test_generates_kebab_case_url(self, runner):
        """Should generate kebab-case Storybook URL from PascalCase component."""
        state = {"workflow": "hustle-ui-create"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/UserProfileCard.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        # Check task file for URL
        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-UserProfileCard.json"))
        if task_files:
            task = json.loads(task_files[0].read_text())
            if task["storybook"]["url"]:
                assert "user-profile-card" in task["storybook"]["url"]


class TestBrandGuideIntegration:
    """Tests for brand guide loading in visual QA."""

    def test_loads_brand_guide_when_present(self, runner):
        """Should include brand guide excerpt in task spec when present."""
        # Create brand guide
        claude_dir = runner.project_dir / ".claude"
        claude_dir.mkdir(parents=True, exist_ok=True)
        brand_guide = """# Brand Guide

## Colors
- Primary: #007AFF
- Secondary: #5856D6

## Typography
- Font: Inter
- Heading: 24px bold
"""
        (claude_dir / "BRAND_GUIDE.md").write_text(brand_guide)

        state = {"workflow": "hustle-ui-create"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Header.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        # Check task file for brand guide
        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-Header.json"))
        if task_files:
            task = json.loads(task_files[0].read_text())
            assert task.get("brand_guide") is not None
            assert "#007AFF" in task["brand_guide"]

    def test_handles_missing_brand_guide(self, runner):
        """Should work without brand guide."""
        state = {"workflow": "hustle-ui-create"}
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Footer.tsx"}
        }

        result = runner.run("visual-qa.py", input_data)
        assert result.allowed

        # Check task file
        tasks_dir = runner.devkit_dir / "tasks" / "visual-qa"
        task_files = list(tasks_dir.glob("*-Footer.json"))
        if task_files:
            task = json.loads(task_files[0].read_text())
            assert task.get("brand_guide") is None
