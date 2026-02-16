#!/bin/bash
# Generate NBA picks and save to static JSON file for API consumption

cd "$(dirname "$0")"

# Load API key
source ~/.edgeforce-odds-api.env

# Generate picks
echo "🎯 Generating NBA picks..."
python3 generate_picks_json.py basketball_nba > ../../apps/web/public/picks-today.json

if [ $? -eq 0 ]; then
    echo "✅ Picks saved to apps/web/public/picks-today.json"
    echo ""
    echo "Preview:"
    head -20 ../../apps/web/public/picks-today.json
    echo ""
    echo "Next steps:"
    echo "  1. Review picks: cat ~/projects/edgeforce/apps/web/public/picks-today.json"
    echo "  2. Commit and deploy: cd ~/projects/edgeforce && git add . && git commit -m 'update picks' && git push"
    echo "  3. View on site: https://edgeforce-three.vercel.app/admin/picks"
else
    echo "❌ Failed to generate picks"
    exit 1
fi
