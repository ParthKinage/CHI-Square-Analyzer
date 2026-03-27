from flask import Flask, render_template, request, jsonify
import numpy as np
from scipy import stats

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        observed = np.array(data['observed'], dtype=float)
        expected_props = np.array(data['expected'], dtype=float)
        expected_props /= expected_props.sum()

        total = observed.sum()
        expected = expected_props * total

        if np.any(expected < 5):
            return jsonify({'error': 'Expected frequency < 5. Consider grouping categories for valid results.'})

        chi2, p_value = stats.chisquare(observed, expected)
        df = len(observed) - 1
        critical = stats.chi2.ppf(0.95, df)

        decision = 'Reject H₀ (No good fit)' if chi2 > critical else 'Accept H₀ (Good fit)'

        # Build step-by-step breakdown
        steps = []
        for i in range(len(observed)):
            o = observed[i]
            e = expected[i]
            diff = o - e
            sq = diff ** 2
            contrib = sq / e
            steps.append({
                'category': f'Category {i + 1}',
                'observed': round(o, 4),
                'expected': round(e, 4),
                'diff': round(diff, 4),
                'diff_sq': round(sq, 4),
                'contribution': round(contrib, 4)
            })

        return jsonify({
            'chi2': round(float(chi2), 4),
            'p_value': round(float(p_value), 6),
            'df': int(df),
            'critical': round(float(critical), 4),
            'decision': decision,
            'observed': observed.tolist(),
            'expected': [round(e, 4) for e in expected.tolist()],
            'steps': steps,
            'alpha': 0.05
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
