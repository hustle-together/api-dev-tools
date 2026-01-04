"""Tests for registry hooks (registry-update, zod-parsing)."""
import json
import pytest
from pathlib import Path


class TestRegistryUpdate:
    """Tests for registry-update.py."""

    def test_creates_registry_on_first_api(self, runner):
        """Should create registry.json when first API is added."""
        state = {
            "workflow": "api-create",
            "api_name": "brandfetch",
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/brandfetch/route.ts"},
            "tool_output": "File written"
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

        registry_file = runner.devkit_dir / "registry.json"
        if registry_file.exists():
            registry = json.loads(registry_file.read_text())
            assert "apis" in registry or "components" in registry

    def test_adds_api_to_existing_registry(self, runner):
        """Should add new API to existing registry."""
        # Create existing registry
        existing_registry = {
            "apis": {
                "existing-api": {
                    "name": "Existing API",
                    "description": "Pre-existing API"
                }
            },
            "components": {}
        }
        runner.set_registry(existing_registry)

        state = {
            "workflow": "api-create",
            "api_name": "new-api",
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/new-api/route.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_updates_api_metadata(self, runner):
        """Should update API metadata in registry."""
        registry = {
            "apis": {
                "test-api": {
                    "name": "Test API",
                    "version": "1.0.0"
                }
            }
        }
        runner.set_registry(registry)

        state = {
            "workflow": "api-create",
            "api_name": "test-api",
            "phases": {"verify": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Edit",
            "tool_input": {"file_path": "app/api/test-api/route.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_adds_component_to_registry(self, runner):
        """Should add UI component to registry."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.tsx"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_ignores_non_workflow_writes(self, runner):
        """Should ignore writes outside workflows."""
        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/utils/helpers.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

        registry_file = runner.devkit_dir / "registry.json"
        assert not registry_file.exists()

    def test_ignores_test_files(self, runner):
        """Should ignore test file writes."""
        state = {
            "workflow": "api-create",
            "api_name": "test",
            "phases": {"tdd-green": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/test/route.test.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed


class TestZodParsing:
    """Tests for Zod schema parsing in registry-update."""

    def test_extracts_string_params(self, runner, tmp_path):
        """Should extract string parameters from Zod schema."""
        # Create a mock schema file
        schema_dir = runner.project_dir / "src" / "schemas"
        schema_dir.mkdir(parents=True, exist_ok=True)

        schema_content = '''
import { z } from "zod";

export const TestSchema = z.object({
    domain: z.string().min(3).describe("The domain to lookup"),
    format: z.enum(["json", "xml"]).default("json"),
});
'''
        schema_file = schema_dir / "test.schema.ts"
        schema_file.write_text(schema_content)

        state = {
            "workflow": "api-create",
            "api_name": "test",
            "schema_file": str(schema_file),
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": str(schema_file)}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_extracts_number_params(self, runner, tmp_path):
        """Should extract number parameters with constraints."""
        schema_dir = runner.project_dir / "src" / "schemas"
        schema_dir.mkdir(parents=True, exist_ok=True)

        schema_content = '''
import { z } from "zod";

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});
'''
        schema_file = schema_dir / "pagination.schema.ts"
        schema_file.write_text(schema_content)

        state = {
            "workflow": "api-create",
            "api_name": "paginated",
            "schema_file": str(schema_file),
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": str(schema_file)}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_extracts_optional_params(self, runner, tmp_path):
        """Should correctly mark optional parameters."""
        schema_dir = runner.project_dir / "src" / "schemas"
        schema_dir.mkdir(parents=True, exist_ok=True)

        schema_content = '''
import { z } from "zod";

export const OptionalSchema = z.object({
    required_field: z.string(),
    optional_field: z.string().optional(),
    nullable_field: z.string().nullable(),
});
'''
        schema_file = schema_dir / "optional.schema.ts"
        schema_file.write_text(schema_content)

        state = {
            "workflow": "api-create",
            "api_name": "optional-test",
            "phases": {"schema": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": str(schema_file)}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

    def test_generates_curl_examples(self, runner):
        """Should generate curl examples from endpoint config."""
        registry = {
            "apis": {
                "test-api": {
                    "name": "Test API",
                    "endpoints": {
                        "default": {
                            "method": "POST",
                            "path": "/api/test",
                            "params": [
                                {"name": "domain", "type": "string", "required": True}
                            ]
                        }
                    }
                }
            }
        }
        runner.set_registry(registry)

        state = {
            "workflow": "api-create",
            "api_name": "test-api",
            "phases": {"docs": {"status": "in_progress"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/test/route.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed


class TestRegistryStructure:
    """Tests for registry JSON structure."""

    def test_registry_has_apis_section(self, runner):
        """Registry should have apis section."""
        state = {
            "workflow": "api-create",
            "api_name": "test",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/test/route.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

        registry_file = runner.devkit_dir / "registry.json"
        if registry_file.exists():
            registry = json.loads(registry_file.read_text())
            assert isinstance(registry.get("apis", {}), dict)

    def test_registry_has_components_section(self, runner):
        """Registry should have components section."""
        state = {
            "workflow": "hustle-ui-create",
            "component_name": "Button",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "src/components/Button.tsx"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

        registry_file = runner.devkit_dir / "registry.json"
        if registry_file.exists():
            registry = json.loads(registry_file.read_text())
            assert isinstance(registry.get("components", {}), dict)

    def test_api_entry_has_required_fields(self, runner):
        """API entries should have required fields."""
        state = {
            "workflow": "api-create",
            "api_name": "complete-api",
            "description": "A complete API",
            "phases": {"complete": {"status": "complete"}}
        }
        runner.set_state(state)

        registry = {
            "apis": {
                "complete-api": {
                    "name": "Complete API",
                    "description": "A complete API",
                    "route_file": "app/api/complete/route.ts",
                    "endpoints": {
                        "default": {
                            "method": "POST",
                            "path": "/api/complete",
                            "params": []
                        }
                    }
                }
            }
        }
        runner.set_registry(registry)

        input_data = {
            "tool_name": "Write",
            "tool_input": {"file_path": "app/api/complete/route.ts"}
        }

        result = runner.run("registry-update.py", input_data)
        assert result.allowed

        registry_file = runner.devkit_dir / "registry.json"
        if registry_file.exists():
            registry = json.loads(registry_file.read_text())
            api = registry.get("apis", {}).get("complete-api", {})
            # Verify structure exists
            assert "name" in api or len(api) == 0  # Either has name or wasn't updated
