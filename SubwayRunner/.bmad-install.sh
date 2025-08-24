#!/bin/bash
# BMAD Method Installation Script

echo "Installing BMAD Method with Infrastructure DevOps Pack..."

cd /Users/doriangrey/Desktop/coding/EndlessRunner/SubwayRunner

# Create BMAD directory structure
mkdir -p .bmad-core
mkdir -p .bmad-infrastructure-devops

# Create basic BMAD configuration
cat > .bmad-config.json << 'EOF'
{
  "version": "4.40.0",
  "expansions": [
    "infrastructure-devops"
  ],
  "project": {
    "name": "subway-runner",
    "type": "web-game",
    "tech": ["three.js", "vanilla-js", "mediapipe"],
    "goals": [
      "mobile-performance-optimization",
      "supabase-integration",
      "gesture-control-enhancement"
    ]
  },
  "agents": {
    "performance-tuner": {
      "focus": ["webgl", "mobile", "60fps"],
      "metrics": ["fps", "memory", "load-time"]
    },
    "cloud-architect": {
      "focus": ["supabase", "leaderboards", "analytics"],
      "database": "postgresql"
    },
    "sre-expert": {
      "focus": ["monitoring", "error-tracking", "performance"]
    },
    "devops": {
      "focus": ["ci-cd", "deployment", "testing"]
    }
  }
}
EOF

echo "✅ BMAD Method configuration created"
echo "📦 Ready to use BMAD agents for optimization!"