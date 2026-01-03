#!/usr/bin/env python3
"""
Hook Test Runner

Runs all hook tests and reports results.

Usage:
    python run_tests.py              # Run all tests
    python run_tests.py -v           # Verbose output
    python run_tests.py -k gate      # Run only gate hook tests
    python run_tests.py --coverage   # Run with coverage report
"""
import subprocess
import sys
from pathlib import Path


def main():
    tests_dir = Path(__file__).parent
    hooks_dir = tests_dir.parent

    # Build pytest command
    cmd = [
        sys.executable, "-m", "pytest",
        str(tests_dir),
        "-v",
        "--tb=short",
    ]

    # Add any additional arguments
    cmd.extend(sys.argv[1:])

    # Check if coverage requested
    if "--coverage" in sys.argv:
        cmd.remove("--coverage")
        cmd.extend([
            "--cov=" + str(hooks_dir),
            "--cov-report=term-missing",
            "--cov-report=html:coverage_html"
        ])

    print(f"Running: {' '.join(cmd)}")
    print("-" * 60)

    result = subprocess.run(cmd)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
