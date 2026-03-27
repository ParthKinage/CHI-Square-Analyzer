#!/bin/bash
echo "============================================"
echo "   Chi-Square Goodness-of-Fit Analyzer"
echo "   Engineering Mathematics IV - VIT Mumbai"
echo "============================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed."
    echo "Install it: sudo apt install python3 python3-venv (Ubuntu) or brew install python (macOS)"
    exit 1
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "[1/3] Creating virtual environment..."
    python3 -m venv venv
    echo "      Done!"
fi

# Install dependencies
echo "[2/3] Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "      Done!"

# Create directories
mkdir -p static/screenshots

# Launch
echo "[3/3] Starting server..."
echo ""
echo "============================================"
echo "   App running at: http://localhost:5000"
echo "   Press Ctrl+C to stop the server"
echo "============================================"
echo ""
python app.py
