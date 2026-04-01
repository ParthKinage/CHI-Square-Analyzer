from flask import Flask, render_template, request, jsonify, Response
import numpy as np
from scipy import stats
import csv
import io

app = Flask(__name__)

VALID_ALPHA_LEVELS = {0.01, 0.05, 0.10}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        observed = np.array(data['observed'], dtype=float)
        expected_props = np.array(data['expected'], dtype=float)

        # Configurable significance level — default 0.05
        alpha = float(data.get('alpha', 0.05))
        if alpha not in VALID_ALPHA_LEVELS:
            alpha = 0.05  # fallback to standard level

        expected_props /= expected_props.sum()

        total = observed.sum()
        expected = expected_props * total

        # Guard: zero or negative frequencies
        if np.any(expected <= 0):
            return jsonify({'error': 'Expected frequency must be greater than zero for all categories.'})

        if np.any(expected < 5):
            return jsonify({'error': 'Expected frequency < 5. Consider grouping categories for valid results.'})

        chi2, p_value = stats.chisquare(observed, expected)
        df = len(observed) - 1
        critical = stats.chi2.ppf(1 - alpha, df)

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
            'alpha': alpha
        })

    except Exception as e:
        return jsonify({'error': str(e)})


@app.route('/export', methods=['POST'])
def export_csv():
    """Export the chi-square test results as a downloadable CSV file."""
    try:
        data = request.json

        output = io.StringIO()
        writer = csv.writer(output)

        # Summary header
        writer.writerow(['Chi-Square Goodness-of-Fit Test — Results Export'])
        writer.writerow([])
        writer.writerow(['Statistic', 'Value'])
        writer.writerow(['Chi-Square (χ²)', data.get('chi2', '')])
        writer.writerow(['Degrees of Freedom (df)', data.get('df', '')])
        writer.writerow(['Critical Value', data.get('critical', '')])
        writer.writerow(['p-value', data.get('p_value', '')])
        writer.writerow(['Significance Level (α)', data.get('alpha', 0.05)])
        writer.writerow(['Decision', data.get('decision', '')])
        writer.writerow([])

        # Step-by-step table
        writer.writerow(['Category', 'Observed (O)', 'Expected (E)', 'O − E', '(O − E)²', '(O − E)² / E'])
        for step in data.get('steps', []):
            writer.writerow([
                step['category'],
                step['observed'],
                step['expected'],
                step['diff'],
                step['diff_sq'],
                step['contribution']
            ])

        csv_data = output.getvalue()
        output.close()

        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=chi_square_results.csv'}
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
