#!/bin/bash
# API Dev Tools - Post-Install Setup
# Installs hooks, settings, and initializes state files

set -e

echo "🚀 Installing API Dev Tools v3.11.0..."
echo ""

# Determine installation directory
if [ -d ".claude" ]; then
  INSTALL_DIR=".claude"
  INSTALL_TYPE="project"
  echo "📁 Installing to project: .claude/"
else
  INSTALL_DIR="$HOME/.claude"
  INSTALL_TYPE="user"
  echo "📁 Installing to user directory: ~/.claude/"
fi

# Create directories
echo "📂 Creating directories..."
mkdir -p "$INSTALL_DIR/hooks"
mkdir -p "$INSTALL_DIR/research"
mkdir -p "$INSTALL_DIR/commands"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SKILLS_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Copy hooks
if [ -d "$SKILLS_DIR/.skills/_shared/hooks" ]; then
  echo "🔗 Installing enforcement hooks..."
  cp -r "$SKILLS_DIR/.skills/_shared/hooks"/* "$INSTALL_DIR/hooks/" 2>/dev/null || true
  chmod +x "$INSTALL_DIR/hooks/"*.py 2>/dev/null || true
  echo "   ✓ 18 enforcement hooks installed"
fi

# Copy settings
if [ -f "$SKILLS_DIR/.skills/_shared/settings.json" ]; then
  if [ -f "$INSTALL_DIR/settings.json" ]; then
    echo "⚙️  Settings.json already exists"
    read -p "   Overwrite? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cp "$SKILLS_DIR/.skills/_shared/settings.json" "$INSTALL_DIR/settings.json"
      echo "   ✓ Settings updated"
    else
      echo "   ⏭️  Skipped settings.json"
    fi
  else
    echo "⚙️  Installing settings..."
    cp "$SKILLS_DIR/.skills/_shared/settings.json" "$INSTALL_DIR/settings.json"
    echo "   ✓ Settings installed"
  fi
fi

# Initialize state file
if [ ! -f "$INSTALL_DIR/api-dev-state.json" ]; then
  echo "📊 Initializing state file..."
  cat > "$INSTALL_DIR/api-dev-state.json" << 'EOF'
{
  "version": "3.0.0",
  "endpoint": null,
  "turn_count": 0,
  "phases": {},
  "research_index": {}
}
EOF
  echo "   ✓ State file created"
else
  echo "📊 State file already exists"
fi

# Initialize research index
if [ ! -f "$INSTALL_DIR/research/index.json" ]; then
  echo "🔍 Initializing research cache..."
  cat > "$INSTALL_DIR/research/index.json" << 'EOF'
{
  "version": "1.0.0",
  "cache": {}
}
EOF
  echo "   ✓ Research index created"
else
  echo "🔍 Research index already exists"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "  1. Install MCP servers in Claude Code:"
echo "     • Context7 (for documentation search)"
echo "     • GitHub (for PR and issue integration)"
echo ""
echo "  2. Verify installation:"
echo "     /api-status"
echo ""
echo "  3. Start creating APIs:"
echo "     /api-create my-endpoint"
echo ""
echo "  4. Read documentation:"
echo "     • Quick start: .claude/commands/README.md"
echo "     • Skills guide: .skills/README.md"
echo "     • Full roadmap: ENHANCEMENT_ROADMAP_v3.11.0.md"
echo ""
echo "📦 Installed to: $INSTALL_DIR ($INSTALL_TYPE)"
echo "🎯 23 skills available"
echo "🔗 18 enforcement hooks active"
echo ""
echo "💡 Tip: Run '/help' in Claude Code to see all available skills"
echo ""
