# χ² Chi-Square Goodness-of-Fit Test Analyzer

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![SciPy](https://img.shields.io/badge/SciPy-1.14-8CAAE6?style=for-the-badge&logo=scipy&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Interactive web application for performing Chi-Square Goodness-of-Fit tests with step-by-step computation breakdown, real-time visualization, and pre-loaded sample datasets.**

[Live Demo](#deployment) · [Installation](#installation) · [Usage](#usage) · [Theory](#theory)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [Theory](#theory)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Team](#team)
- [References](#references)

---

## 📖 About

This project is developed as a **Mini-Project Code Challenge** for **Engineering Mathematics IV (BSC07)**, Semester 4, SE INFT at **Vidyalankar Institute of Technology (VIT), Mumbai**, under the guidance of **Dr. Uday Kashid**.

The application demonstrates the practical implementation of the **Chi-Square (χ²) Goodness-of-Fit Test** — a non-parametric statistical test used to determine whether observed categorical data conforms to an expected theoretical distribution.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧮 **Chi-Square Calculator** | Input observed frequencies and expected proportions to compute χ² statistic |
| 📊 **Visual Bar Chart** | Canvas-rendered side-by-side comparison of observed vs. expected values |
| 📝 **Step-by-Step Breakdown** | Detailed computation table showing (O−E), (O−E)², and (O−E)²/E for each category |
| 📦 **Sample Datasets** | 5 pre-loaded datasets (dice rolls, coin flips, blood types, surveys, traffic) |
| ✅ **Hypothesis Decision** | Automatic Accept/Reject H₀ decision with critical value comparison |
| 📱 **Responsive Design** | Fully responsive — works on desktop, tablet, and mobile |
| 🎨 **Premium Dark UI** | Glassmorphism design with animated backgrounds and micro-interactions |
| ⌨️ **Keyboard Shortcut** | Press `Ctrl+Enter` to run the test |

---

## 📸 Screenshots

*Screenshots will be added after deployment.*

---

## 🚀 Installation

### Prerequisites

- **Python 3.8+** — [Download here](https://www.python.org/downloads/)
- **pip** — Comes bundled with Python
- **Git** — [Download here](https://git-scm.com/downloads)

### Option 1: One-Click Setup (Recommended)

#### Windows
```bash
# Clone the repository
git clone https://github.com/<your-username>/chi-square-analyzer.git
cd chi-square-analyzer

# Double-click start.bat OR run:
start.bat
```

#### Mac / Linux
```bash
# Clone the repository
git clone https://github.com/<your-username>/chi-square-analyzer.git
cd chi-square-analyzer

# Run setup script
chmod +x start.sh
bash start.sh
```

### Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/chi-square-analyzer.git
cd chi-square-analyzer

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the application
python app.py

# 6. Open in browser
# Navigate to http://localhost:5000
```

### Option 3: Auto Setup Script

```bash
python download_project.py
```

This will automatically:
- Create a virtual environment
- Install all dependencies
- Verify project files
- Create a distributable ZIP file

---

## 📘 Usage

1. **Open the app** at `http://localhost:5000`
2. **Load a sample dataset** by clicking a chip (e.g., "Fair Dice") or enter your own data
3. **Add/remove categories** using the + and − buttons (2–20 categories supported)
4. **Enter observed frequencies** (whole numbers) and **expected proportions** (decimals that sum to any positive number — they'll be auto-normalized)
5. **Click "Run χ² Test"** or press `Ctrl+Enter`
6. **View results**: decision banner, statistics, step-by-step table, and bar chart

### Example: Testing a Fair Die

| Category | Observed | Expected Proportion |
|----------|----------|-------------------|
| Face 1   | 8        | 0.1667            |
| Face 2   | 12       | 0.1667            |
| Face 3   | 10       | 0.1667            |
| Face 4   | 14       | 0.1667            |
| Face 5   | 7        | 0.1667            |
| Face 6   | 9        | 0.1667            |

**Result**: χ² = 2.6000, df = 5, Critical = 11.0705 → **Accept H₀ (Good fit)** — the die is fair.

---

## 📐 Theory

### Chi-Square Goodness-of-Fit Test

The **Chi-Square Goodness-of-Fit Test** determines whether observed sample data is consistent with a hypothesized distribution.

#### Formula

$$\chi^2 = \sum_{i=1}^{k} \frac{(O_i - E_i)^2}{E_i}$$

Where:
- **O_i** = Observed frequency for category *i*
- **E_i** = Expected frequency for category *i*
- **k** = Number of categories

#### Hypotheses

- **H₀ (Null Hypothesis):** The observed data follows the expected distribution
- **H₁ (Alternative Hypothesis):** The observed data does NOT follow the expected distribution

#### Decision Rule (α = 0.05)

- **Degrees of freedom:** df = k − 1
- If **χ² > χ²_critical** → **Reject H₀** (data does not fit)
- If **χ² ≤ χ²_critical** → **Fail to reject H₀** (data fits)

#### Assumptions

1. Data must be categorical (nominal or ordinal)
2. Observations must be independent
3. Expected frequency for each category ≥ 5
4. Sample must be randomly drawn from the population

#### Applications

- Testing fairness of dice/coins
- Verifying genetic ratios (Mendel's experiments)
- Analyzing survey response distributions
- Quality control in manufacturing

---

## 📁 Project Structure

```
chi-square-analyzer/
├── app.py                  # Flask backend — API + routing
├── requirements.txt        # Python dependencies
├── config.json             # Sample datasets configuration
├── download_project.py     # Auto-setup script
├── start.bat               # Windows one-click launcher
├── start.sh                # Mac/Linux one-click launcher
├── deployment.yaml         # Render.com deployment config
├── README.md               # This file
├── .gitignore              # Git ignore rules
├── templates/
│   └── index.html          # Main HTML template
└── static/
    ├── css/
    │   └── style.css       # Complete design system
    ├── js/
    │   └── main.js         # Application logic + chart rendering
    └── screenshots/        # UI screenshots
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python 3.8+, Flask 3.0 | Web server, API endpoints |
| **Statistics** | SciPy 1.14, NumPy 2.1 | Chi-square computation, critical values |
| **Frontend** | HTML5, CSS3, JavaScript ES6+ | UI, interactivity, responsive layout |
| **Visualization** | Canvas API (native) | Bar chart rendering (zero dependencies) |
| **Design** | Glassmorphism, Inter font | Premium dark theme with animations |

---

## 🌐 Deployment

### Deploy on Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects the `deployment.yaml` config
5. Click **Deploy**

### Deploy on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Create a `vercel.json`:
```json
{
  "builds": [{"src": "app.py", "use": "@vercel/python"}],
  "routes": [{"src": "/(.*)", "dest": "app.py"}]
}
```
3. Run `vercel --prod`

### Local Deployment

Already covered in the [Installation](#installation) section above.

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| *Team Member 1* | *Role* | [@username](https://github.com/username) |
| *Team Member 2* | *Role* | [@username](https://github.com/username) |
| *Team Member 3* | *Role* | [@username](https://github.com/username) |
| *Team Member 4* | *Role* | [@username](https://github.com/username) |

> **Subject:** Engineering Mathematics IV (BSC07)  
> **Faculty:** Dr. Uday Kashid  
> **Institution:** Vidyalankar Institute of Technology, Mumbai  
> **Course:** SE INFT — Semester 4  

---

## 📚 References

1. **SciPy Documentation** — [scipy.stats.chisquare](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chisquare.html)
2. **NIST Engineering Statistics Handbook** — [Chi-Square Goodness-of-Fit Test](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm)
3. **Flask Documentation** — [flask.palletsprojects.com](https://flask.palletsprojects.com/)
4. **Walpole, R.E., Myers, R.H.** — *Probability & Statistics for Engineers and Scientists*, Pearson Education
5. **Khan Academy** — [Chi-Square Goodness-of-Fit Tests](https://www.khanacademy.org/math/statistics-probability/inference-categorical-data-chi-square-tests)

---

<div align="center">

**Made with ❤️ for Engineering Mathematics IV — VIT Mumbai © 2026**

</div>
