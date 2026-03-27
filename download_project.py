"""
download_project.py — Auto-Setup Script for Chi-Square Analyzer

Run this script to:
1. Create a Python virtual environment
2. Install all dependencies
3. Set up project directories
4. Generate a distributable ZIP file
5. Launch the application

Usage:
    python download_project.py
"""

import os
import sys
import subprocess
import zipfile
import json

BANNER = """
╔═══════════════════════════════════════════════════════════╗
║         χ²  Chi-Square Analyzer — Auto Setup             ║
║         Engineering Mathematics IV — VIT Mumbai           ║
╚═══════════════════════════════════════════════════════════╝
"""

def run_cmd(cmd, desc=""):
    """Run a shell command with error handling."""
    if desc:
        print(f"  → {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ✗ Error: {result.stderr.strip()}")
        return False
    return True

def create_venv():
    """Create Python virtual environment."""
    print("\n[1/5] Creating virtual environment...")
    if os.path.exists("venv"):
        print("  ✓ Virtual environment already exists, skipping.")
        return True
    return run_cmd(
        [sys.executable, "-m", "venv", "venv"],
        "python -m venv venv"
    )

def install_deps():
    """Install Python dependencies from requirements.txt."""
    print("\n[2/5] Installing dependencies...")
    if os.name == 'nt':
        pip = os.path.join("venv", "Scripts", "pip.exe")
    else:
        pip = os.path.join("venv", "bin", "pip")
    
    if not os.path.exists(pip):
        print("  ✗ pip not found in venv. Trying system pip...")
        pip = "pip"
    
    return run_cmd(
        [pip, "install", "-r", "requirements.txt", "--quiet"],
        "Installing Flask, SciPy, NumPy..."
    )

def setup_directories():
    """Create required project directories."""
    print("\n[3/5] Setting up directories...")
    dirs = [
        "static/screenshots",
        "static/css",
        "static/js",
        "templates",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"  ✓ {d}/")
    return True

def verify_files():
    """Check that all required project files exist."""
    print("\n[4/5] Verifying project files...")
    required = [
        "app.py",
        "requirements.txt",
        "config.json",
        "templates/index.html",
        "static/css/style.css",
        "static/js/main.js",
    ]
    all_ok = True
    for f in required:
        if os.path.exists(f):
            print(f"  ✓ {f}")
        else:
            print(f"  ✗ MISSING: {f}")
            all_ok = False
    return all_ok

def create_zip():
    """Create distributable ZIP archive."""
    print("\n[5/5] Creating distributable ZIP...")
    zip_name = "chi-square-analyzer.zip"
    
    exclude = {
        "venv", "__pycache__", ".git", zip_name,
        ".env", "chi-square-complete.zip"
    }
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude]
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, '.')
                if file not in exclude and not file.endswith('.pyc'):
                    zf.write(filepath, arcname)
    
    size_kb = os.path.getsize(zip_name) / 1024
    print(f"  ✓ Created {zip_name} ({size_kb:.1f} KB)")
    return True

def main():
    print(BANNER)
    
    steps = [
        ("Virtual Environment", create_venv),
        ("Dependencies", install_deps),
        ("Directories", setup_directories),
        ("File Verification", verify_files),
        ("ZIP Archive", create_zip),
    ]
    
    all_passed = True
    for name, func in steps:
        try:
            result = func()
            if not result:
                print(f"\n⚠️  Step '{name}' had issues but continuing...")
                all_passed = False
        except Exception as e:
            print(f"\n✗ Step '{name}' failed: {e}")
            all_passed = False
    
    # Summary
    print("\n" + "=" * 55)
    if all_passed:
        print("✅ Setup complete! All checks passed.")
    else:
        print("⚠️  Setup completed with some warnings.")
    
    print(f"""
To start the application:
  Windows:   start.bat (double-click)
  Mac/Linux: bash start.sh

Or manually:
  1. Activate venv:
     Windows:   venv\\Scripts\\activate
     Mac/Linux: source venv/bin/activate
  2. Run: python app.py
  3. Open: http://localhost:5000

A distributable ZIP has been created: chi-square-analyzer.zip
""")
    print("=" * 55)

if __name__ == "__main__":
    main()
