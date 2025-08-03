#!/bin/bash
# 🔄 Automatisches Speicher-Skript für EndlessRunner
# Läuft im Hintergrund und committed alle 5 Minuten bei Änderungen

REPO_PATH="/Users/doriangrey/Desktop/coding/EndlessRunner"
INTERVAL=300 # 5 Minuten in Sekunden

echo "🚀 Autosave-Daemon gestartet für: $REPO_PATH"
echo "⏱️ Speichert alle $INTERVAL Sekunden bei Änderungen"
echo "🛑 Zum Stoppen: Ctrl+C"

while true; do
    cd "$REPO_PATH"
    
    # Prüfe ob es Änderungen gibt
    if [[ -n $(git status -s) ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - 💾 Änderungen gefunden, speichere..."
        
        # Alle Änderungen stagen
        git add -A
        
        # Automatischer Commit mit Timestamp
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        git commit -m "🔄 Auto-Save: $TIMESTAMP" --no-verify
        
        # Optional: Automatisch pushen (auskommentiert für Sicherheit)
        # git push origin main --quiet
        
        echo "✅ Gespeichert!"
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') - ⏳ Keine Änderungen"
    fi
    
    sleep $INTERVAL
done