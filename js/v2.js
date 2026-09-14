/* ==========================================================================
   v2.js — case-study content for the featured projects.
   Loads AFTER main.js and overrides/extends projectData in place.
   v1 (index.html) never loads this file, so it's unaffected.
   ========================================================================== */

(function () {
    if (typeof projectData === 'undefined') return;

    const step = (n, title, body) => `
        <div class="cs-step">
            <h4 data-n="${n}">${title}</h4>
            ${body}
        </div>`;

    /* ---------- 01 · Molson Coors ---------- */
    projectData['molson-coors'] = {
        title: 'Forecasting the U.S. Alcohol Market — The Data Mine × Molson Coors',
        tags: ['Python', 'R', 'LASSO', 'SARIMAX', 'XGBoost', 'Forecasting'],
        content:
            step('01', 'Problem',
                `<p>Molson Coors wanted a five-year forecast of the U.S. alcohol market across four categories — Beer, Wine, Spirits, and Ready-to-Drink (RTDs) — and, more usefully, an answer to <em>how macroeconomic conditions change what people drink</em>. A number is easy. A number that survives a recession scenario is the actual ask.</p>`) +
            step('02', 'Data',
                `<p>Annual category data going back roughly 35 years, integrated with macroeconomic indicators and two sets of drivers most forecasts skip:</p>
                <ul>
                    <li><strong>Behavioral trends</strong> — "vibe-based" consumption patterns that don't show up in price and income alone</li>
                    <li><strong>Cross-industry indicators</strong> — sugar content in the broader food supply, which turned out to correlate with RTD demand</li>
                </ul>
                <p>Thirty-five annual observations is a very small dataset. That constraint shaped every decision after it.</p>`) +
            step('03', 'Approach',
                `<p>I owned the Beer and RTD categories end to end. For each I benchmarked three model families against held-out years: SARIMAX for the seasonal time-series baseline, XGBoost for a non-linear tree ensemble, and LASSO regression with macroeconomic drivers.</p>`) +
            step('04', 'Why LASSO',
                `<p>SARIMAX and XGBoost both underperformed on 35 data points — XGBoost overfit the small sample and SARIMAX couldn't estimate seasonal structure from annual data. LASSO's L1 penalty did two things the others couldn't: it selected a handful of macro drivers from a long candidate list without overfitting, and it produced coefficients a business audience could read. When the client needs to know <em>which</em> conditions move the market, an interpretable model beats a marginally more accurate black box.</p>`) +
            step('05', 'Results',
                `<div class="cs-result"><p><strong>RTDs are recession-resistant.</strong> Across downturn scenarios, RTD demand held while Beer softened — a finding that changes where a category manager puts marginal dollars.</p></div>
                <p>Delivered five-year forecasts, market-share and forecast visualizations, and a three-minute showcase trailer presented at the Data Mine Showcase.</p>`) +
            step('06', 'What I learned',
                `<p>On small data, the model matters less than the features and the honesty about uncertainty. Also: the drivers that made the forecast interesting — sugar content, behavioral trends — came from asking what <em>else</em> might explain the series, not from the standard macro list.</p>`) +
            step('07', 'Stack',
                `<p>Python · R · LASSO · SARIMAX · XGBoost · matplotlib</p>`)
    };

    /* ---------- 02 · Macro Regime Dashboard ---------- */
    projectData['macro-regime'] = {
        title: 'Macro Regime Dashboard',
        tags: ['Python', 'GMM', 'scikit-learn', 'FRED API', 'yfinance', 'pandas'],
        github: 'https://github.com/Nityaj22/AI_ML_Projects/tree/main/Macro_Regime',
        content:
            step('01', 'Problem',
                `<p>"What state is the economy in?" gets answered qualitatively — a Fed statement, a headline, a vibe. I wanted a quantitative answer for every month since 1996, and then the follow-up that actually matters for allocation: <em>which S&amp;P sectors outperform in each state?</em></p>`) +
            step('02', 'Data',
                `<p>Thirty years of macroeconomic series from the FRED API — growth, inflation, labor, and rates — paired with S&amp;P sector returns pulled through yfinance. Everything converted to year-over-year changes and standardized so no single series dominates by scale.</p>`) +
            step('03', 'Approach',
                `<p>A Gaussian Mixture Model fit on the standardized macro features. Model selection by BIC across candidate cluster counts; four regimes minimized it cleanly. Each month gets a regime label and a probability, which feed a timeline, a regime-transition heatmap, and a sector-return table. The whole pipeline — ingestion, feature engineering, classification, visualization — runs end to end into a live dashboard.</p>`) +
            step('04', 'Why GMM',
                `<p>There are no ground-truth labels for "stagflation" — it's unsupervised by nature. GMM over k-means because regimes aren't spherical or equal-sized, and because soft membership is the point: a month that's 60% Slowdown, 40% Recession is more informative than a hard boundary. BIC gave a principled answer to "how many regimes" instead of picking four because it sounded right.</p>`) +
            step('05', 'Results',
                `<div class="cs-result"><p>Four regimes — <strong>Expansion, Slowdown, Stagflation, Recession</strong> — that correctly flag 2008, 2020, and the 2022 stagflation without being told where they were.</p></div>
                <p>The sector map shows which parts of the S&amp;P historically outperform in each regime, which is the piece a portfolio decision actually needs.</p>`) +
            step('06', 'What I learned',
                `<p>Feature engineering decided the outcome more than the model did. Raw levels produced garbage; year-over-year changes produced regimes that matched history. Also learned to trust BIC over intuition on cluster count — I expected three.</p>`) +
            step('07', 'Stack',
                `<p>Python · scikit-learn (GaussianMixture) · FRED API · yfinance · pandas · matplotlib</p>`)
    };

    /* ---------- 03 · F1 Undercut Strategy ---------- */
    projectData['f1-undercut'] = {
        title: 'F1 Undercut Strategy Analysis',
        tags: ['Python', 'FastF1', 'pandas', 'matplotlib', 'seaborn'],
        github: 'https://github.com/Nityaj22/AI_ML_Projects/tree/main/f1_undercut',
        content:
            step('01', 'Problem',
                `<p>The undercut — pitting before the car ahead so fresh tires gain you the position on their in-lap — is the most common strategic call in Formula 1, and it's made in seconds on incomplete information. I wanted to know, from data rather than commentary: <em>when does it actually work?</em></p>`) +
            step('02', 'Data',
                `<p>Real race telemetry via the FastF1 API — lap times, tire compounds, stint lengths, pit-stop timing, and gap-to-car-ahead at every lap. This is the same data the pit wall sees, minus the radio.</p>`) +
            step('03', 'Approach',
                `<p>Nine visualizations built in sequence, each answering one question the previous one raised: lap-time distributions by compound, gap-over-laps, pit timelines, stint degradation curves, undercut attempts by compound, a success-probability heatmap across tire age and gap, a position-gain scatter, a success breakdown, and an undercut timeline.</p>`) +
            step('04', 'Why descriptive first',
                `<p>The temptation was to jump to a predictive model. But the value here was in the empirical shape of the problem — degradation is non-linear, gap thresholds vary by compound, and success depends on the car ahead's tire age as much as your own. Getting that structure visible mattered more than a model score. The heatmap <em>is</em> the decision tool.</p>`) +
            step('05', 'Results',
                `<div class="cs-result"><p>An undercut success-probability heatmap that reads directly as a pit-window guide: <strong>given this gap and this tire age, here's your probability of gaining the position.</strong></p></div>
                <p>Plus degradation curves that show when a stint stops being worth extending — the other half of the call.</p>`) +
            step('06', 'What I learned',
                `<p>A pit-stop call and a portfolio rebalance are the same decision: act early on incomplete data, or lose the window. Both punish waiting for certainty.</p>`) +
            step('07', 'Stack',
                `<p>Python · FastF1 · pandas · matplotlib · seaborn</p>`)
    };
})();
