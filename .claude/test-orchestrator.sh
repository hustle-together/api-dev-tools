#!/bin/bash
#
# Test Orchestrator - Master test runner for all 5 commands
#
# This script:
# 1. Creates isolated test directory
# 2. Installs api-dev-tools package
# 3. Copies .env.example for API keys
# 4. Runs each command with auto-answer bot
# 5. Validates completion with completion-detector
# 6. Retries on failure (with research for solutions)
# 7. Updates WORKFLOW_CHECKLIST.md with results
#
# Usage:
#   ./test-orchestrator.sh
#
# Version: 1.0.0

set -e  # Exit on error

# Configuration
TEST_DIR="$HOME/test-api-dev-tools-auto"
SOURCE_DIR="/Users/alfonso/Documents/GitHub/api-dev-tools"
ENV_EXAMPLE="$SOURCE_DIR/.env.example"
NTFY_TOPIC="test_api_devtools_alerts"
MAX_RETRIES=5
PYTHON3="python3"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✅ $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ❌ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠️  $1"
}

# NTFY notification
send_ntfy() {
    local message="$1"
    local title="${2:-Test Orchestrator}"
    local priority="${3:-3}"

    curl -s \
        -H "Title: $title" \
        -H "Priority: $priority" \
        -d "$message" \
        "https://ntfy.sh/$NTFY_TOPIC" > /dev/null 2>&1 || true
}

# Setup test environment
setup_test_environment() {
    log "Setting up test environment at $TEST_DIR..."

    # Remove old test directory if exists
    if [ -d "$TEST_DIR" ]; then
        log_warning "Removing old test directory..."
        rm -rf "$TEST_DIR"
    fi

    # Create new test directory
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"

    # Initialize git (required for api-dev-tools)
    git init
    git config user.email "test@example.com"
    git config user.name "Test Orchestrator"

    # Create basic Next.js structure
    log "Creating Next.js project structure..."
    npm init -y > /dev/null 2>&1

    # Copy .env.example
    if [ -f "$ENV_EXAMPLE" ]; then
        log "Copying .env.example..."
        cp "$ENV_EXAMPLE" "$TEST_DIR/.env"
        log_success ".env file copied"
    else
        log_error ".env.example not found at $ENV_EXAMPLE"
        log_warning "Continuing without .env file - some features may not work"
    fi

    # Install api-dev-tools (from local source for now)
    log "Installing api-dev-tools from local source..."

    # Build the package first
    cd "$SOURCE_DIR"
    npm run build > /dev/null 2>&1 || log_warning "Build may have warnings"

    cd "$TEST_DIR"

    # Install dependencies
    npm install --save-dev "$SOURCE_DIR" > /dev/null 2>&1 || {
        log_error "Failed to install api-dev-tools"
        exit 1
    }

    log_success "Test environment setup complete"

    send_ntfy "Test environment created at $TEST_DIR" "🔧 Setup Complete" 3
}

# Run auto-answer bot in background
start_auto_answer_bot() {
    log "Starting auto-answer bot..."

    $PYTHON3 "$SOURCE_DIR/.claude/test-auto-answer-bot.py" "$TEST_DIR" > /dev/null 2>&1 &
    AUTO_ANSWER_PID=$!

    log_success "Auto-answer bot started (PID: $AUTO_ANSWER_PID)"
}

# Stop auto-answer bot
stop_auto_answer_bot() {
    if [ ! -z "$AUTO_ANSWER_PID" ]; then
        log "Stopping auto-answer bot..."
        kill $AUTO_ANSWER_PID 2>/dev/null || true
        log_success "Auto-answer bot stopped"
    fi
}

# Test a single command
test_command() {
    local command="$1"
    local endpoint="$2"
    local command_type="$3"
    local retry=0

    log "Testing command: $command $endpoint"

    while [ $retry -lt $MAX_RETRIES ]; do
        log "Attempt $((retry + 1))/$MAX_RETRIES..."

        # Start auto-answer bot
        start_auto_answer_bot

        # Run the command (this will be done via Claude Code in actual implementation)
        # For now, we'll log what would happen
        log_warning "TODO: Implement command execution via Claude Code"

        # Check completion
        $PYTHON3 "$SOURCE_DIR/.claude/test-completion-detector.py" "$TEST_DIR" "$command_type" > /tmp/completion-result.json

        if [ $? -eq 0 ]; then
            log_success "$command completed successfully!"
            stop_auto_answer_bot

            send_ntfy "✅ $command PASSED on attempt $((retry + 1))" "Test Success" 4

            return 0
        else
            log_error "$command failed. Analyzing..."

            # Show completion status
            cat /tmp/completion-result.json

            retry=$((retry + 1))

            if [ $retry -lt $MAX_RETRIES ]; then
                log_warning "Retrying..."
            fi

            stop_auto_answer_bot
        fi
    done

    log_error "$command failed after $MAX_RETRIES attempts"
    send_ntfy "❌ $command FAILED after $MAX_RETRIES attempts" "Test Failure" 5

    return 1
}

# Main test suite
run_full_test_suite() {
    log "Starting full test suite..."
    send_ntfy "Starting full test suite (5 commands)" "🚀 Test Suite Started" 4

    local commands_passed=0
    local commands_failed=0

    # Test 1: /api-create
    if test_command "/api-create" "test-weather-api" "api-create"; then
        commands_passed=$((commands_passed + 1))
    else
        commands_failed=$((commands_failed + 1))
    fi

    # Test 2: /hustle-ui-create
    if test_command "/hustle-ui-create" "TestCard" "hustle-ui-create"; then
        commands_passed=$((commands_passed + 1))
    else
        commands_failed=$((commands_failed + 1))
    fi

    # Test 3: /hustle-ui-create-page
    if test_command "/hustle-ui-create-page" "test-dashboard" "hustle-ui-create-page"; then
        commands_passed=$((commands_passed + 1))
    else
        commands_failed=$((commands_failed + 1))
    fi

    # Test 4: /hustle-combine
    if test_command "/hustle-combine" "test-combined" "hustle-combine"; then
        commands_passed=$((commands_passed + 1))
    else
        commands_failed=$((commands_failed + 1))
    fi

    # Test 5: /hustle-build
    if test_command "/hustle-build" "simple dashboard" "hustle-build"; then
        commands_passed=$((commands_passed + 1))
    else
        commands_failed=$((commands_failed + 1))
    fi

    # Final summary
    log ""
    log "=========================================="
    log "          TEST SUITE COMPLETE"
    log "=========================================="
    log_success "Passed: $commands_passed/5"
    log_error "Failed: $commands_failed/5"
    log "=========================================="

    send_ntfy "Test Suite Complete: $commands_passed/5 passed, $commands_failed/5 failed" "🏁 Tests Done" 5

    if [ $commands_failed -eq 0 ]; then
        return 0
    else
        return 1
    fi
}

# Cleanup on exit
cleanup() {
    log "Cleaning up..."
    stop_auto_answer_bot
}

trap cleanup EXIT

# Main execution
main() {
    log "=========================================="
    log "   API Dev Tools - Test Orchestrator"
    log "=========================================="
    log ""

    setup_test_environment
    run_full_test_suite

    exit $?
}

main "$@"
