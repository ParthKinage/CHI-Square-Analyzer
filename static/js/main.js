/**
 * Chi-Square Analyzer — Main Application Logic
 * Handles data input, API communication, results rendering, and chart drawing.
 */

(function () {
    'use strict';

    // ============================================================
    // CONFIG & STATE
    // ============================================================
    const CONFIG = {
        MIN_ROWS: 2,
        MAX_ROWS: 500,
        DEFAULT_ROWS: 6,
        API_ENDPOINT: '/calculate',
    };

    let state = {
        rows: CONFIG.DEFAULT_ROWS,
        testsRun: 0,
        activeDataset: null,
        results: null,
    };

    // Sample datasets (loaded from config.json, fallback hardcoded)
    let DATASETS = {
        dice_rolls: {
            label: 'Fair Dice (60 Rolls)',
            observed: [8, 12, 10, 14, 7, 9],
            proportions: [0.1667, 0.1667, 0.1667, 0.1667, 0.1667, 0.1667],
            categories: ['Face 1', 'Face 2', 'Face 3', 'Face 4', 'Face 5', 'Face 6'],
        },
        coin_flips: {
            label: 'Fair Coin (100 Flips)',
            observed: [55, 45],
            proportions: [0.5, 0.5],
            categories: ['Heads', 'Tails'],
        },
        blood_types: {
            label: 'Blood Type Distribution',
            observed: [180, 160, 45, 15],
            proportions: [0.45, 0.40, 0.11, 0.04],
            categories: ['Type O', 'Type A', 'Type B', 'Type AB'],
        },
        customer_preference: {
            label: 'Customer Preference',
            observed: [120, 90, 60, 30],
            proportions: [0.40, 0.30, 0.20, 0.10],
            categories: ['Product A', 'Product B', 'Product C', 'Product D'],
        },
        traffic_accidents: {
            label: 'Traffic by Day',
            observed: [28, 32, 25, 30, 33, 42, 38],
            proportions: [0.1429, 0.1429, 0.1429, 0.1429, 0.1429, 0.1429, 0.1429],
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
    };

    // ============================================================
    // DOM REFERENCES
    // ============================================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const els = {
        tbody: $('#data-tbody'),
        totalObserved: $('#total-observed'),
        btnAdd: $('#btn-add-row'),
        btnRemove: $('#btn-remove-row'),
        btnClear: $('#btn-clear'),
        btnCalculate: $('#btn-calculate'),
        btnImportCsv: $('#btn-import-csv'),
        btnSaveCase: $('#btn-save-case'),
        btnProcessImport: $('#btn-process-import'),
        btnCloseImport: $('#btn-close-import'),
        importModal: $('#import-modal'),
        importTextarea: $('#import-textarea'),
        importFile: $('#import-file'),
        sampleChips: $('#sample-chips'),
        resultsCard: $('#results-card'),
        inputCard: $('#input-card'),
        decisionBanner: $('#decision-banner'),
        decisionIcon: $('#decision-icon'),
        decisionLabel: $('#decision-label'),
        decisionDetail: $('#decision-detail'),
        resultChi2: $('#result-chi2'),
        resultPvalue: $('#result-pvalue'),
        resultDf: $('#result-df'),
        resultCritical: $('#result-critical'),
        stepsTbody: $('#steps-tbody'),
        stepsTfoot: $('#steps-tfoot'),
        chartContainer: $('#chart-container'),
        barChart: $('#bar-chart'),
        statTests: $('#stat-tests'),
        navLinks: $$('.nav-link'),
    };

    // ============================================================
    // INITIALIZATION
    // ============================================================
    function init() {
        loadCustomCases();
        renderSampleChips();
        renderTableRows(CONFIG.DEFAULT_ROWS);
        bindEvents();
        loadConfig();
        updateTotal();
    }

    function loadCustomCases() {
        try {
            const saved = localStorage.getItem('customDatasets');
            if (saved) {
                const parsed = JSON.parse(saved);
                for (const key in parsed) {
                    parsed[key].isCustom = true;
                }
                DATASETS = { ...DATASETS, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load custom cases', e);
        }
    }

    async function loadConfig() {
        try {
            const res = await fetch('/static/../config.json');
            if (res.ok) {
                const data = await res.json();
                if (data.datasets) {
                    DATASETS = { ...DATASETS, ...mapConfigDatasets(data.datasets) };
                    renderSampleChips();
                }
            }
        } catch (e) {
            // Use hardcoded fallback
        }
    }

    function mapConfigDatasets(datasets) {
        const mapped = {};
        for (const [key, val] of Object.entries(datasets)) {
            mapped[key] = {
                label: val.label || key,
                observed: val.observed,
                proportions: val.proportions,
                categories: val.categories || val.observed.map((_, i) => `Cat ${i + 1}`),
            };
        }
        return mapped;
    }

    // ============================================================
    // SAMPLE CHIPS
    // ============================================================
    function renderSampleChips() {
        els.sampleChips.innerHTML = '';
        for (const [key, ds] of Object.entries(DATASETS)) {
            const chip = document.createElement('button');
            chip.className = ds.isCustom ? 'chip custom-chip' : 'chip';
            if (state.activeDataset === key) chip.classList.add('active');
            chip.dataset.key = key;
            chip.textContent = ds.label;
            chip.addEventListener('click', () => loadDataset(key));

            if (ds.isCustom) {
                const delBtn = document.createElement('button');
                delBtn.className = 'chip-delete';
                delBtn.innerHTML = '&times;';
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteCustomCase(key);
                });
                chip.appendChild(delBtn);
            }

            els.sampleChips.appendChild(chip);
        }
    }

    function deleteCustomCase(key) {
        if (!confirm('Delete this custom case?')) return;
        delete DATASETS[key];
        try {
            const saved = JSON.parse(localStorage.getItem('customDatasets') || '{}');
            delete saved[key];
            localStorage.setItem('customDatasets', JSON.stringify(saved));
        } catch(e) {}
        if (state.activeDataset === key) clearAll();
        renderSampleChips();
    }

    function loadDataset(key) {
        const ds = DATASETS[key];
        if (!ds) return;

        state.activeDataset = key;
        state.rows = ds.observed.length;

        // Highlight active chip
        $$('.chip').forEach((c) => c.classList.toggle('active', c.dataset.key === key));

        renderTableRows(state.rows, ds);
        updateTotal();
    }

    // ============================================================
    // TABLE RENDERING
    // ============================================================
    function renderTableRows(count, dataset = null) {
        els.tbody.innerHTML = '';
        state.rows = count;

        for (let i = 0; i < count; i++) {
            const tr = document.createElement('tr');

            const catVal = dataset ? dataset.categories[i] || `Category ${i + 1}` : `Category ${i + 1}`;
            const obsVal = dataset ? dataset.observed[i] : '';
            const expVal = dataset ? dataset.proportions[i] : '';

            tr.innerHTML = `
                <td><input type="text" class="input-category" value="${catVal}" placeholder="Category name" id="cat-${i}"></td>
                <td><input type="number" class="input-observed" value="${obsVal}" placeholder="e.g. 15" min="0" step="1" id="obs-${i}"></td>
                <td><input type="number" class="input-expected" value="${expVal}" placeholder="e.g. 0.1667" min="0" step="any" id="exp-${i}"></td>
            `;

            // Auto-update total on input change
            tr.querySelectorAll('.input-observed').forEach((inp) => {
                inp.addEventListener('input', updateTotal);
            });

            els.tbody.appendChild(tr);
        }
    }

    function addRow() {
        if (state.rows >= CONFIG.MAX_ROWS) {
            showToast(`Maximum ${CONFIG.MAX_ROWS} categories allowed`, 'error');
            return;
        }
        state.rows++;
        const tr = document.createElement('tr');
        const i = state.rows - 1;
        tr.innerHTML = `
            <td><input type="text" class="input-category" value="Category ${i + 1}" placeholder="Category name" id="cat-${i}"></td>
            <td><input type="number" class="input-observed" value="" placeholder="e.g. 15" min="0" step="1" id="obs-${i}"></td>
            <td><input type="number" class="input-expected" value="" placeholder="e.g. 0.1667" min="0" step="any" id="exp-${i}"></td>
        `;
        tr.querySelector('.input-observed').addEventListener('input', updateTotal);
        els.tbody.appendChild(tr);
        // Focus the new observed input
        tr.querySelector('.input-observed').focus();
    }

    function removeRow() {
        if (state.rows <= CONFIG.MIN_ROWS) {
            showToast('Minimum 2 categories required', 'error');
            return;
        }
        els.tbody.removeChild(els.tbody.lastElementChild);
        state.rows--;
        updateTotal();
    }

    function clearAll() {
        state.activeDataset = null;
        $$('.chip').forEach((c) => c.classList.remove('active'));
        renderTableRows(CONFIG.DEFAULT_ROWS);
        els.resultsCard.classList.add('hidden');
        updateTotal();
    }

    function updateTotal() {
        const inputs = els.tbody.querySelectorAll('.input-observed');
        let total = 0;
        inputs.forEach((inp) => {
            const val = parseFloat(inp.value);
            if (!isNaN(val)) total += val;
        });
        els.totalObserved.textContent = total;
    }

    // ============================================================
    // CUSTOM CASES & IMPORT
    // ============================================================
    function saveCustomCase() {
        const observed = [];
        const expected = [];
        const categories = [];

        const obsInputs = els.tbody.querySelectorAll('.input-observed');
        const expInputs = els.tbody.querySelectorAll('.input-expected');
        const catInputs = els.tbody.querySelectorAll('.input-category');

        for (let i = 0; i < state.rows; i++) {
            const o = parseFloat(obsInputs[i].value);
            const e = parseFloat(expInputs[i].value);
            const c = catInputs[i].value.trim() || `Category ${i + 1}`;
            
            if (isNaN(o) || isNaN(e)) {
                showToast('Please fill all observed and expected values before saving', 'error');
                return;
            }
            observed.push(o);
            expected.push(e);
            categories.push(c);
        }

        const label = prompt("Enter a name for this custom dataset:", "My Case");
        if (!label) return;

        const key = 'custom_' + Date.now();
        const ds = { label, observed, proportions: expected, categories, isCustom: true };

        DATASETS[key] = ds;
        
        try {
            const saved = JSON.parse(localStorage.getItem('customDatasets') || '{}');
            saved[key] = ds;
            localStorage.setItem('customDatasets', JSON.stringify(saved));
            showToast('Custom case saved!', 'success');
            renderSampleChips();
            loadDataset(key);
        } catch(e) {
            showToast('Failed to save case', 'error');
        }
    }

    function openImportModal() {
        els.importTextarea.value = '';
        els.importModal.classList.remove('hidden');
    }

    function closeImportModal() {
        els.importModal.classList.add('hidden');
        if (els.importFile) els.importFile.value = '';
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        els.btnProcessImport.classList.add('loading');
        els.btnProcessImport.textContent = 'Parsing...';

        const reader = new FileReader();
        reader.onload = function(evt) {
            const data = new Uint8Array(evt.target.result);
            try {
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                const rows = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
                
                const dataset = { categories: [], observed: [], proportions: [], isCustom: true };
                
                let rawStrings = [];
                let hasNumbers = false;

                for (let row of rows) {
                    if (!row || row.length === 0) continue;
                    
                    let parts = Array.isArray(row) ? row : [row];
                    if (parts.length === 1 && typeof parts[0] === 'string') {
                        parts = parts[0].split(/[,\\t]+/).map(s => s.trim());
                    }

                    let nums = [];
                    let cats = [];
                    for (let p of parts) {
                        let strP = String(p).trim();
                        if (strP === '') continue;
                        let n = parseFloat(strP);
                        if (!isNaN(n)) {
                            nums.push(n);
                            hasNumbers = true;
                        } else {
                            cats.push(strP);
                            rawStrings.push(strP);
                        }
                    }

                    if (nums.length > 0) {
                        dataset.categories.push(cats.length > 0 ? cats[0] : `Cat ${dataset.categories.length + 1}`);
                        dataset.observed.push(nums[0]);
                        dataset.proportions.push(nums.length > 1 ? nums[1] : null);
                    }
                }

                if (!hasNumbers && rawStrings.length > 1) {
                    const counts = {};
                    rawStrings.forEach(val => counts[val] = (counts[val] || 0) + 1);
                    for (const [cat, count] of Object.entries(counts)) {
                        dataset.categories.push(cat);
                        dataset.observed.push(count);
                        dataset.proportions.push(null);
                    }
                }
                
                let totalCats = dataset.categories.length;
                let defaultProp = totalCats > 0 ? (1 / totalCats) : 0;
                for (let i = 0; i < totalCats; i++) {
                    if (dataset.proportions[i] === null) {
                        dataset.proportions[i] = parseFloat(defaultProp.toFixed(4));
                    }
                }
                
                if (dataset.observed.length < 2) {
                    showToast('Could not parse at least 2 rows of data from file', 'error');
                    return;
                }
                
                let rowCount = dataset.observed.length;
                if (rowCount > CONFIG.MAX_ROWS) {
                    showToast(`Truncated to max ${CONFIG.MAX_ROWS} rows`, 'info');
                    rowCount = CONFIG.MAX_ROWS;
                    dataset.categories = dataset.categories.slice(0, rowCount);
                    dataset.observed = dataset.observed.slice(0, rowCount);
                    dataset.proportions = dataset.proportions.slice(0, rowCount);
                }
                
                // Use original file name without extension
                let label = file.name.replace(/\.[^/.]+$/, "");
                dataset.label = label;
                
                // Save it like saveCustomCase
                const key = 'custom_' + Date.now();
                DATASETS[key] = dataset;
                try {
                    const saved = JSON.parse(localStorage.getItem('customDatasets') || '{}');
                    saved[key] = dataset;
                    localStorage.setItem('customDatasets', JSON.stringify(saved));
                } catch(e) {}
                
                closeImportModal();
                showToast(`Loaded ${label}`, 'success');
                renderSampleChips();
                loadDataset(key);
                
                // Automatically run calculation
                setTimeout(() => runCalculation(), 200);

            } catch(error) {
                console.error(error);
                showToast('Failed to parse Excel/CSV file. Ensure it is a valid spreadsheet.', 'error');
            } finally {
                els.btnProcessImport.classList.remove('loading');
                els.btnProcessImport.textContent = 'Import';
                els.importFile.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function processImport() {
        const text = els.importTextarea.value.trim();
        if (!text) {
            showToast('Please enter some data', 'error');
            return;
        }

        const lines = text.split('\n');
        const dataset = { categories: [], observed: [], proportions: [] };

        for (let line of lines) {
            if (!line.trim()) continue;
            // Split by comma or tab
            const parts = line.split(/[,\\t]+/).map(s => s.trim());
            
            if (parts.length >= 3) {
                dataset.categories.push(parts[0]);
                const o = parseFloat(parts[1]);
                const e = parseFloat(parts[2]);
                dataset.observed.push(isNaN(o) ? 0 : o);
                dataset.proportions.push(isNaN(e) ? 0 : e);
            } else if (parts.length === 2) {
                dataset.categories.push(`Cat ${dataset.categories.length + 1}`);
                const o = parseFloat(parts[0]);
                const e = parseFloat(parts[1]);
                dataset.observed.push(isNaN(o) ? 0 : o);
                dataset.proportions.push(isNaN(e) ? 0 : e);
            }
        }

        if (dataset.observed.length < 2) {
            showToast('Could not parse at least 2 rows of data', 'error');
            return;
        }
        
        let rows = dataset.observed.length;
        if (rows > CONFIG.MAX_ROWS) {
            showToast(`Truncated to max ${CONFIG.MAX_ROWS} rows`, 'info');
            rows = CONFIG.MAX_ROWS;
            dataset.categories = dataset.categories.slice(0, rows);
            dataset.observed = dataset.observed.slice(0, rows);
            dataset.proportions = dataset.proportions.slice(0, rows);
        }

        state.activeDataset = null;
        $$('.chip').forEach(c => c.classList.remove('active'));
        renderTableRows(rows, dataset);
        updateTotal();
        closeImportModal();
        showToast('Data imported successfully', 'success');
    }

    // ============================================================
    // CALCULATION
    // ============================================================
    async function runCalculation() {
        // Gather data
        const observed = [];
        const expected = [];
        const categories = [];

        const obsInputs = els.tbody.querySelectorAll('.input-observed');
        const expInputs = els.tbody.querySelectorAll('.input-expected');
        const catInputs = els.tbody.querySelectorAll('.input-category');

        for (let i = 0; i < state.rows; i++) {
            const o = parseFloat(obsInputs[i].value);
            const e = parseFloat(expInputs[i].value);
            const c = catInputs[i].value.trim() || `Category ${i + 1}`;

            if (isNaN(o) || isNaN(e)) {
                showToast('Please fill all observed and expected values', 'error');
                els.inputCard.classList.add('shake');
                setTimeout(() => els.inputCard.classList.remove('shake'), 400);
                return;
            }

            if (o < 0 || e < 0) {
                showToast('Values cannot be negative', 'error');
                return;
            }

            observed.push(o);
            expected.push(e);
            categories.push(c);
        }

        if (expected.every((v) => v === 0)) {
            showToast('Expected proportions cannot all be zero', 'error');
            return;
        }

        // API call
        els.btnCalculate.classList.add('loading');

        try {
            const res = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ observed, expected }),
            });

            const data = await res.json();

            if (data.error) {
                showToast(data.error, 'error');
                els.btnCalculate.classList.remove('loading');
                return;
            }

            state.results = { ...data, categories };
            state.testsRun++;
            els.statTests.textContent = state.testsRun;

            renderResults(data, categories);
            els.resultsCard.classList.remove('hidden');

            // Scroll to results on mobile
            if (window.innerWidth < 900) {
                els.resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            showToast('χ² test completed successfully!', 'success');
        } catch (err) {
            showToast('Failed to connect to server', 'error');
        } finally {
            els.btnCalculate.classList.remove('loading');
        }
    }

    // ============================================================
    // RESULTS RENDERING
    // ============================================================
    function renderResults(data, categories) {
        // Decision banner
        const isAccept = data.decision.includes('Accept');
        els.decisionBanner.className = `decision-banner ${isAccept ? 'accept' : 'reject'}`;
        els.decisionIcon.textContent = isAccept ? '✅' : '❌';
        els.decisionLabel.textContent = data.decision;
        els.decisionDetail.textContent = isAccept
            ? `χ² (${data.chi2}) ≤ Critical (${data.critical}) — Data fits expected distribution at α=0.05`
            : `χ² (${data.chi2}) > Critical (${data.critical}) — Data does NOT fit expected distribution at α=0.05`;

        // Stat cards
        els.resultChi2.textContent = data.chi2;
        els.resultPvalue.textContent = data.p_value;
        els.resultDf.textContent = data.df;
        els.resultCritical.textContent = data.critical;

        // Steps table
        renderStepsTable(data.steps, data.chi2);

        // Chart
        drawChart(data, categories);
    }

    function renderStepsTable(steps, totalChi2) {
        els.stepsTbody.innerHTML = '';
        els.stepsTfoot.innerHTML = '';

        steps.forEach((s) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family:var(--font-main);color:var(--text-0)">${s.category}</td>
                <td>${s.observed}</td>
                <td>${s.expected}</td>
                <td>${s.diff}</td>
                <td>${s.diff_sq}</td>
                <td>${s.contribution}</td>
            `;
            els.stepsTbody.appendChild(tr);
        });

        const tfoot = document.createElement('tr');
        tfoot.innerHTML = `
            <td colspan="5" style="text-align:right;font-family:var(--font-main)">Σ (O−E)²/E =</td>
            <td>${totalChi2}</td>
        `;
        els.stepsTfoot.appendChild(tfoot);
    }

    // ============================================================
    // CHART (Pure Canvas — no external library)
    // ============================================================
    function drawChart(data, categories) {
        const canvas = els.barChart;
        const ctx = canvas.getContext('2d');

        // Hi-DPI scaling
        const container = els.chartContainer;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const W = rect.width;
        const H = rect.height;
        const pad = { top: 30, right: 30, bottom: 50, left: 55 };
        const chartW = W - pad.left - pad.right;
        const chartH = H - pad.top - pad.bottom;

        const observed = data.observed;
        const expected = data.expected;
        const n = observed.length;
        const maxVal = Math.max(...observed, ...expected) * 1.15;

        const groupW = chartW / n;
        const barW = groupW * 0.32;
        const gap = groupW * 0.06;

        ctx.clearRect(0, 0, W, H);

        // Y-axis gridlines
        const yTicks = 5;
        ctx.strokeStyle = 'rgba(196,245,74,0.06)';
        ctx.lineWidth = 1;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'right';

        for (let i = 0; i <= yTicks; i++) {
            const val = (maxVal / yTicks) * i;
            const y = pad.top + chartH - (val / maxVal) * chartH;
            ctx.beginPath();
            ctx.moveTo(pad.left, y);
            ctx.lineTo(W - pad.right, y);
            ctx.stroke();
            ctx.fillText(Math.round(val), pad.left - 8, y + 4);
        }

        // Bars
        for (let i = 0; i < n; i++) {
            const x = pad.left + groupW * i + (groupW - barW * 2 - gap) / 2;
            const oH = (observed[i] / maxVal) * chartH;
            const eH = (expected[i] / maxVal) * chartH;

            // Observed bar — sharp edges, lime green
            const oY = pad.top + chartH - oH;
            ctx.fillStyle = '#c4f54a';
            ctx.fillRect(x, oY, barW, oH);

            // Expected bar — sharp edges, muted white
            const eX = x + barW + gap;
            const eY = pad.top + chartH - eH;
            ctx.fillStyle = 'rgba(232,232,232,0.35)';
            ctx.fillRect(eX, eY, barW, eH);
            ctx.strokeStyle = 'rgba(232,232,232,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(eX, eY, barW, eH);

            // Value labels on bars
            ctx.fillStyle = '#e8e8e8';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(observed[i], x + barW / 2, oY - 5);
            ctx.fillStyle = '#666666';
            ctx.fillText(Math.round(expected[i] * 10) / 10, eX + barW / 2, eY - 5);

            // Category labels
            ctx.fillStyle = '#666666';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            const catLabel = categories[i] || `Cat ${i + 1}`;
            const truncated = catLabel.length > 8 ? catLabel.substring(0, 7) + '…' : catLabel;
            ctx.fillText(truncated.toUpperCase(), pad.left + groupW * i + groupW / 2, pad.top + chartH + 18);
        }

        // Legend
        const legendY = pad.top + chartH + 34;
        const legendX = W / 2 - 80;

        ctx.fillStyle = '#c4f54a';
        ctx.fillRect(legendX, legendY, 10, 10);
        ctx.fillStyle = '#666666';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('OBSERVED', legendX + 16, legendY + 9);

        ctx.fillStyle = 'rgba(232,232,232,0.35)';
        ctx.fillRect(legendX + 100, legendY, 10, 10);
        ctx.strokeStyle = 'rgba(232,232,232,0.5)';
        ctx.strokeRect(legendX + 100, legendY, 10, 10);
        ctx.fillStyle = '#666666';
        ctx.fillText('EXPECTED', legendX + 116, legendY + 9);
    }

    function roundedRect(ctx, x, y, w, h, r) {
        if (h <= 0) return;
        r = Math.min(r, h / 2, w / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    function showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach((t) => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================================
    // NAVIGATION
    // ============================================================
    function setupNav() {
        els.navLinks.forEach((link) => {
            link.addEventListener('click', function (e) {
                els.navLinks.forEach((l) => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Active section tracking on scroll
        const sections = ['hero', 'calculator', 'theory', 'about'];
        window.addEventListener(
            'scroll',
            debounce(() => {
                const scrollY = window.scrollY + 100;
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = document.getElementById(sections[i]);
                    if (section && scrollY >= section.offsetTop) {
                        els.navLinks.forEach((l) => l.classList.remove('active'));
                        const target = sections[i] === 'hero' ? 'calculator' : sections[i];
                        const activeLink = document.querySelector(`.nav-link[data-section="${target}"]`);
                        if (activeLink) activeLink.classList.add('active');
                        break;
                    }
                }
            }, 50)
        );
    }

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // ============================================================
    // EVENT BINDING
    // ============================================================
    function bindEvents() {
        els.btnAdd.addEventListener('click', addRow);
        els.btnRemove.addEventListener('click', removeRow);
        els.btnClear.addEventListener('click', clearAll);
        els.btnCalculate.addEventListener('click', runCalculation);
        
        if (els.btnSaveCase) els.btnSaveCase.addEventListener('click', saveCustomCase);
        if (els.btnImportCsv) els.btnImportCsv.addEventListener('click', openImportModal);
        if (els.btnProcessImport) els.btnProcessImport.addEventListener('click', processImport);
        if (els.btnCloseImport) els.btnCloseImport.addEventListener('click', closeImportModal);
        if (els.importModal) {
            els.importModal.addEventListener('click', (e) => {
                if (e.target === els.importModal) closeImportModal();
            });
        }
        if (els.importFile) {
            els.importFile.addEventListener('change', handleFileUpload);
        }

        setupNav();

        // Redraw chart on resize
        window.addEventListener(
            'resize',
            debounce(() => {
                if (state.results) {
                    drawChart(state.results, state.results.categories);
                }
            }, 200)
        );

        // Keyboard shortcut: Enter to calculate
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                runCalculation();
            }
        });
    }

    // ============================================================
    // BOOT
    // ============================================================
    document.addEventListener('DOMContentLoaded', init);
})();
