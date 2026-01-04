#!/usr/bin/env python3
"""
Greptile Code Review Helper

Shared library for AI-powered code review via Greptile API.
Used in Phase 14 of the API development workflow.

Usage:
    from lib.greptile import submit_review, check_review_status, get_review_feedback

Environment Variables:
    GREPTILE_API_KEY: Your Greptile API key (get from https://app.greptile.com)
    GITHUB_TOKEN: GitHub Personal Access Token with repo access

API Documentation:
    https://docs.greptile.com/api-reference

Version: 1.0.0
"""
import os
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, List, Any
from pathlib import Path


# Greptile API base URL
GREPTILE_API_BASE = "https://api.greptile.com/v2"


def get_config() -> dict:
    """Get Greptile configuration from environment or .env file."""
    config = {
        "api_key": os.environ.get("GREPTILE_API_KEY", ""),
        "github_token": os.environ.get("GITHUB_TOKEN", ""),
        "enabled": False,
    }

    # Try to read from .env if not in environment
    if not config["api_key"] or not config["github_token"]:
        env_file = Path.cwd() / ".env"
        if env_file.exists():
            try:
                for line in env_file.read_text().splitlines():
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, _, value = line.partition("=")
                        key = key.strip()
                        value = value.strip().strip('"').strip("'")
                        if key == "GREPTILE_API_KEY":
                            config["api_key"] = value
                        elif key == "GITHUB_TOKEN":
                            config["github_token"] = value
            except IOError:
                pass

    config["enabled"] = bool(config["api_key"] and config["github_token"])
    return config


def _make_request(
    endpoint: str,
    method: str = "GET",
    data: Optional[dict] = None
) -> Optional[dict]:
    """Make authenticated request to Greptile API."""
    config = get_config()

    if not config["enabled"]:
        return None

    url = f"{GREPTILE_API_BASE}{endpoint}"

    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "X-GitHub-Token": config["github_token"],
        "Content-Type": "application/json",
    }

    body = None
    if data:
        body = json.dumps(data).encode("utf-8")

    try:
        req = urllib.request.Request(
            url,
            data=body,
            headers=headers,
            method=method
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"Greptile API error: {e}")
        return None
    except json.JSONDecodeError:
        return None


def index_repository(
    repo_owner: str,
    repo_name: str,
    branch: str = "main"
) -> Optional[dict]:
    """
    Index a repository for Greptile to analyze.

    Args:
        repo_owner: GitHub repository owner
        repo_name: GitHub repository name
        branch: Branch to index (default: main)

    Returns:
        Repository status dict or None if failed
    """
    data = {
        "remote": "github",
        "repository": f"{repo_owner}/{repo_name}",
        "branch": branch
    }

    return _make_request("/repositories", method="POST", data=data)


def query_codebase(
    repo_owner: str,
    repo_name: str,
    question: str,
    branch: str = "main"
) -> Optional[dict]:
    """
    Query the codebase using natural language.

    Args:
        repo_owner: GitHub repository owner
        repo_name: GitHub repository name
        question: Natural language question about the codebase
        branch: Branch to query (default: main)

    Returns:
        Query response with sources and answer
    """
    data = {
        "messages": [
            {"role": "user", "content": question}
        ],
        "repositories": [
            {
                "remote": "github",
                "repository": f"{repo_owner}/{repo_name}",
                "branch": branch
            }
        ],
        "stream": False
    }

    return _make_request("/query", method="POST", data=data)


def review_changes(
    repo_owner: str,
    repo_name: str,
    files_changed: List[str],
    diff_content: str,
    pr_number: Optional[int] = None
) -> Optional[dict]:
    """
    Submit code changes for AI review.

    Args:
        repo_owner: GitHub repository owner
        repo_name: GitHub repository name
        files_changed: List of changed file paths
        diff_content: The actual diff content
        pr_number: Optional PR number for context

    Returns:
        Review results with suggestions and issues
    """
    review_prompt = f"""Review the following code changes for:
1. Potential bugs or logic errors
2. Security vulnerabilities (OWASP top 10)
3. Performance issues
4. Code quality and maintainability
5. Adherence to TypeScript/JavaScript best practices

Files changed: {', '.join(files_changed)}

Provide specific, actionable feedback with file and line references.
"""

    data = {
        "messages": [
            {"role": "user", "content": review_prompt},
            {"role": "user", "content": f"```diff\n{diff_content}\n```"}
        ],
        "repositories": [
            {
                "remote": "github",
                "repository": f"{repo_owner}/{repo_name}",
                "branch": "main"
            }
        ],
        "stream": False
    }

    return _make_request("/query", method="POST", data=data)


def get_review_summary(review_result: dict) -> dict:
    """
    Parse Greptile review results into a structured summary.

    Args:
        review_result: Raw response from review_changes()

    Returns:
        Structured summary with issues, suggestions, and score
    """
    if not review_result:
        return {
            "success": False,
            "error": "No review result received",
            "issues": [],
            "suggestions": [],
            "score": 0
        }

    message = review_result.get("message", "")
    sources = review_result.get("sources", [])

    # Parse issues and suggestions from the response
    issues = []
    suggestions = []

    # Simple parsing - look for common patterns
    lines = message.split("\n")
    for line in lines:
        line_lower = line.lower()
        if any(word in line_lower for word in ["bug", "error", "issue", "problem", "vulnerability"]):
            issues.append(line.strip("- "))
        elif any(word in line_lower for word in ["suggest", "consider", "recommend", "could", "should"]):
            suggestions.append(line.strip("- "))

    # Calculate a simple score
    issue_count = len(issues)
    if issue_count == 0:
        score = 10
    elif issue_count <= 2:
        score = 8
    elif issue_count <= 5:
        score = 6
    else:
        score = 4

    return {
        "success": True,
        "message": message,
        "sources": sources,
        "issues": issues,
        "suggestions": suggestions,
        "issue_count": issue_count,
        "suggestion_count": len(suggestions),
        "score": score
    }


def format_review_for_display(summary: dict) -> str:
    """
    Format review summary for display in terminal.

    Args:
        summary: Parsed review summary from get_review_summary()

    Returns:
        Formatted string for display
    """
    if not summary.get("success"):
        return f"Review failed: {summary.get('error', 'Unknown error')}"

    output = []
    output.append("=" * 60)
    output.append("GREPTILE CODE REVIEW - Phase 14")
    output.append("=" * 60)
    output.append("")
    output.append(f"Score: {summary['score']}/10")
    output.append(f"Issues Found: {summary['issue_count']}")
    output.append(f"Suggestions: {summary['suggestion_count']}")
    output.append("")

    if summary["issues"]:
        output.append("ISSUES:")
        for i, issue in enumerate(summary["issues"], 1):
            output.append(f"  {i}. {issue}")
        output.append("")

    if summary["suggestions"]:
        output.append("SUGGESTIONS:")
        for i, suggestion in enumerate(summary["suggestions"], 1):
            output.append(f"  {i}. {suggestion}")
        output.append("")

    output.append("-" * 60)
    output.append("Full Review:")
    output.append(summary.get("message", "No detailed message"))
    output.append("=" * 60)

    return "\n".join(output)


def is_configured() -> bool:
    """Check if Greptile is properly configured."""
    config = get_config()
    return config["enabled"]


def get_status() -> dict:
    """Get current Greptile configuration status."""
    config = get_config()
    return {
        "enabled": config["enabled"],
        "api_key_set": bool(config["api_key"]),
        "github_token_set": bool(config["github_token"]),
        "message": "Greptile is configured and ready" if config["enabled"]
                   else "Missing GREPTILE_API_KEY or GITHUB_TOKEN"
    }


if __name__ == "__main__":
    # Test configuration
    import sys

    status = get_status()
    print(f"Greptile Status: {'Configured' if status['enabled'] else 'Not Configured'}")
    print(f"  API Key: {'Set' if status['api_key_set'] else 'Missing'}")
    print(f"  GitHub Token: {'Set' if status['github_token_set'] else 'Missing'}")

    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        if status["enabled"]:
            print("\nTesting codebase query...")
            result = query_codebase(
                "hustle-together",
                "api-dev-tools",
                "What is the main purpose of this repository?"
            )
            if result:
                print("Query successful!")
                print(result.get("message", "No message"))
            else:
                print("Query failed - check API credentials")
        else:
            print("\nConfigure GREPTILE_API_KEY and GITHUB_TOKEN to test")
