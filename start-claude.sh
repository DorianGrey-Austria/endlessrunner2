#!/bin/bash
# start-claude.sh - Auto-start Claude with dangerous permissions for this project

echo "🚀 Starting Claude Code for EndlessRunner with --dangerously-skip-permissions"
echo "⚠️  This enables automatic operations without permission prompts!"
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Start Claude with dangerous permissions
claude --dangerously-skip-permissions

# Alternative: If you want to pass additional arguments
# claude --dangerously-skip-permissions "$@"