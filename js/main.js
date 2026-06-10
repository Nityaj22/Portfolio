// ============================================================
// Nitya Jhaveri — portfolio
// The page is one lap.
// ============================================================

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// Start lights — five on, hold, lights out, away we go
// ============================================================
(function initLights() {
    const hero = document.getElementById('hero');
    const lights = document.querySelectorAll('.start-light');
    if (!hero) return;

    if (reducedMotion || !lights.length) {
        hero.classList.add('go');
        return;
    }

    lights.forEach((l, i) => {
        setTimeout(() => l.classList.add('on'), 380 + i * 340);
    });

    // random-ish hold after the fifth light, like the real start procedure
    const allOn = 380 + 5 * 340;
    setTimeout(() => {
        lights.forEach(l => l.classList.remove('on'));
        hero.classList.add('go');
    }, allOn + 650);
})();

// ============================================================
// The racing line — car follows scroll
// ============================================================
(function initTrack() {
    if (reducedMotion) return;

    const NS = 'http://www.w3.org/2000/svg';
    const railHost = document.getElementById('track-rail');
    const topHost = document.getElementById('track-top');
    if (!railHost || !topHost) return;

    function el(name, attrs) {
        const n = document.createElementNS(NS, name);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        return n;
    }

    // a simple top-down open-wheel car, pointing "up" (-y)
    function buildCar(scale) {
        const g = el('g', { class: 'car' });
        const s = scale;
        const shapes = [
            // tyres
            el('rect', { class: 'tyre', x: -9 * s, y: -12 * s, width: 4 * s, height: 7 * s, rx: 1.5 * s }),
            el('rect', { class: 'tyre', x: 5 * s, y: -12 * s, width: 4 * s, height: 7 * s, rx: 1.5 * s }),
            el('rect', { class: 'tyre', x: -10 * s, y: 5 * s, width: 5 * s, height: 8 * s, rx: 1.5 * s }),
            el('rect', { class: 'tyre', x: 5 * s, y: 5 * s, width: 5 * s, height: 8 * s, rx: 1.5 * s }),
            // wings
            el('rect', { class: 'wing', x: -8 * s, y: -19 * s, width: 16 * s, height: 3 * s, rx: 1 * s }),
            el('rect', { class: 'wing', x: -8 * s, y: 13.5 * s, width: 16 * s, height: 3.5 * s, rx: 1 * s }),
            // body
            el('path', { class: 'body', d:
                `M0,${-17 * s} L${2.6 * s},${-8 * s} L${2.6 * s},${1 * s} L${5 * s},${5 * s} L${5 * s},${12 * s} ` +
                `L${-5 * s},${12 * s} L${-5 * s},${5 * s} L${-2.6 * s},${1 * s} L${-2.6 * s},${-8 * s} Z` }),
            // cockpit
            el('circle', { class: 'cockpit', cx: 0, cy: 2.5 * s, r: 1.9 * s })
        ];
        shapes.forEach(sh => g.appendChild(sh));
        return g;
    }

    function checkeredFlag(scale) {
        const g = el('g', { class: 'track-finish' });
        const sq = 4 * scale;
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 6; c++) {
                g.appendChild(el('rect', {
                    x: (c - 3) * sq, y: r * sq, width: sq, height: sq,
                    fill: (r + c) % 2 === 0 ? 'var(--ink)' : 'var(--paper)',
                    stroke: 'var(--ink)', 'stroke-width': 0.4
                }));
            }
        }
        return g;
    }

    function makeTrack(host, mode) {
        host.innerHTML = '';
        const w = mode === 'rail' ? host.clientWidth : window.innerWidth;
        const h = mode === 'rail' ? host.clientHeight : 34;
        if (!w || !h) return null;

        const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h });

        // wavy path: vertical for the rail, horizontal for the top bar
        let d = '';
        if (mode === 'rail') {
            const cx = w * 0.5, amp = Math.min(24, w * 0.22), wl = 340;
            d = `M ${cx + amp * Math.sin(0)} 0`;
            for (let y = 14; y <= h; y += 14) {
                d += ` L ${cx + amp * Math.sin((y / wl) * Math.PI * 2)} ${y}`;
            }
        } else {
            const cy = h * 0.5, amp = 6, wl = 420;
            d = `M 0 ${cy + amp * Math.sin(0)}`;
            for (let x = 12; x <= w; x += 12) {
                d += ` L ${x} ${cy + amp * Math.sin((x / wl) * Math.PI * 2)}`;
            }
        }

        const asphalt = el('path', { class: 'track-asphalt', d });
        const center = el('path', { class: 'track-center', d });
        if (mode === 'top') {
            asphalt.setAttribute('stroke-width', 14);
            center.setAttribute('stroke-dasharray', '5 7');
        }
        svg.appendChild(asphalt);
        svg.appendChild(center);

        const len = center.getTotalLength();

        // finish flag at the end of the line
        const endPt = center.getPointAtLength(len);
        const beforeEnd = center.getPointAtLength(Math.max(0, len - 4));
        const endAng = Math.atan2(endPt.y - beforeEnd.y, endPt.x - beforeEnd.x) * 180 / Math.PI;
        const flag = checkeredFlag(mode === 'rail' ? 1 : 0.7);
        flag.setAttribute('transform', `translate(${endPt.x}, ${endPt.y}) rotate(${endAng + 90})`);
        svg.appendChild(flag);

        // turn markers
        const markers = [];
        document.querySelectorAll('[data-turn]').forEach(sec => {
            const dot = el('circle', { class: 'track-turn-dot', r: mode === 'rail' ? 4.5 : 3 });
            svg.appendChild(dot);
            let label = null;
            if (mode === 'rail') {
                label = el('text', { class: 'track-turn-label' });
                label.textContent = sec.dataset.turn;
                svg.appendChild(label);
            }
            markers.push({ sec, dot, label, p: 0 });
        });

        const car = buildCar(mode === 'rail' ? 1 : 0.62);
        svg.appendChild(car);
        host.appendChild(svg);

        return { svg, path: center, len, car, markers, mode };
    }

    let tracks = [];

    function maxScroll() {
        return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }

    function placeMarkers() {
        const ms = maxScroll();
        tracks.forEach(t => {
            if (!t) return;
            t.markers.forEach(m => {
                m.p = Math.min(1, Math.max(0, (m.sec.offsetTop - 90) / ms));
                const pt = t.path.getPointAtLength(m.p * t.len);
                m.dot.setAttribute('cx', pt.x);
                m.dot.setAttribute('cy', pt.y);
                if (m.label) {
                    m.label.setAttribute('x', pt.x + 14);
                    m.label.setAttribute('y', pt.y + 3.5);
                }
            });
        });
    }

    function build() {
        tracks = [
            makeTrack(railHost, 'rail'),
            makeTrack(topHost, 'top')
        ];
        placeMarkers();
    }

    build();
    window.addEventListener('load', placeMarkers);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 180);
    });

    // recompute marker positions when content height changes (details open/close)
    document.querySelectorAll('details').forEach(d =>
        d.addEventListener('toggle', () => setTimeout(placeMarkers, 50))
    );

    // ---- drive the car ----
    let current = 0;

    function frame() {
        const target = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
        current += (target - current) * 0.085;
        if (Math.abs(target - current) < 0.0004) current = target;

        tracks.forEach(t => {
            if (!t) return;
            const at = current * t.len;
            const pt = t.path.getPointAtLength(at);
            const ahead = t.path.getPointAtLength(Math.min(t.len, at + 6));
            let ang;
            if (ahead.x === pt.x && ahead.y === pt.y) {
                ang = t.mode === 'rail' ? 180 : 90; // pointing down / right
            } else {
                ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI + 90;
            }
            t.car.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${ang})`);
            t.markers.forEach(m => m.dot.classList.toggle('passed', current >= m.p));
        });

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();

// ============================================================
// Regime timeline — my four years, classified
// ============================================================
const regimeData = {
    foundation: {
        name: 'Foundation',
        years: '2023',
        prob: 'p(regime) = 0.97 · features: java, c++, one_macro_class',
        color: 'var(--rg-foundation)',
        text: 'The summer before Purdue, I taught Java to 30 students back home in Ahmedabad — 100% pass rate — then landed in West Lafayette as a pure CS major, determined not to spend my life just coding 9-to-5. First semester I took macroeconomics on a whim, watched the Fed steer entire markets with a rate decision, and that was that: minor, then double major. At Purdue I also cracked the top 200 of 12,000+ in the IMC Prosperity trading challenge — confirmation that markets were the noisy system I wanted to work on.'
    },
    data: {
        name: 'Data',
        years: '2024',
        prob: 'p(regime) = 0.94 · features: clustering, tableau, real_stakes',
        color: 'var(--rg-data)',
        text: 'First dataset with real stakes: The Data Mine partnership with AgReliant Genetics. Engineered 80+ features down to ~20, raced K-means against DBSCAN against hierarchical clustering, and learned the lesson that defines my work since — a model nobody can act on is just an expensive chart. Also one of 12–15 students selected for the Economic Scholars Program, researching digital currencies.'
    },
    build: {
        name: 'Build',
        years: '2025',
        prob: 'p(regime) = 0.96 · features: shipping, monte_carlo, fastf1',
        color: 'var(--rg-build)',
        text: 'The shipping year. Industry internship at Cygnet.One migrating legacy systems and building KPI dashboards. Built the Monte Carlo portfolio simulator and both F1 strategy projects — the year I proved to myself that a pit-wall call and a portfolio call are the same math. Joined Purdue\u2019s Federal Reserve Challenge team, became a macro TA, and took over the books at F1@Purdue.'
    },
    analyst: {
        name: 'Analyst',
        years: '2026',
        prob: 'p(regime) = 0.99 · features: gmm, lasso, rtds, healthcare_data',
        color: 'var(--rg-analyst)',
        text: 'Everything converges. Built the Macro Regime Dashboard — GMM on 30 years of FRED data — while forecasting the U.S. alcohol market for Molson Coors, where I owned the Beer and RTD categories and helped show that RTDs are recession-resistant. Now: Business Analyst Intern at Abacus Insights, pointing the same toolkit at healthcare.'
    },
    launch: {
        name: 'Launch',
        years: '2027 →',
        prob: 'p(regime) = out-of-sample · target: data × strategy',
        color: 'var(--rg-launch)',
        text: 'Graduation, May 2027. The forecast: a Business Analyst, Data Analyst, or consulting seat where models meet real decisions — fintech, tech, healthcare, or consulting. Every regime above was training data for this one.'
    }
};

(function initRegimes() {
    const buttons = document.querySelectorAll('.regime');
    const detail = document.getElementById('regime-detail');
    if (!buttons.length || !detail) return;

    function render(key) {
        const r = regimeData[key];
        if (!r) return;
        detail.style.setProperty('--rg-active', r.color);
        detail.innerHTML = `
            <h3>${r.name} · ${r.years}</h3>
            <span class="rd-prob">${r.prob}</span>
            <p>${r.text}</p>
        `;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            render(btn.dataset.regime);
        });
    });

    render('foundation');
})();

// ============================================================
// Reveal on scroll
// ============================================================
(function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        els.forEach(e => e.classList.add('in'));
        return;
    }
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(e => obs.observe(e));
})();

// ============================================================
// Mobile nav
// ============================================================
(function initNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelectorAll('.nav-link');
    if (!nav || !toggle) return;

    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.forEach(l => l.addEventListener('click', () => {
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
    }));
})();

// ============================================================
// Project filters
// ============================================================
(function initFilters() {
    const filters = document.querySelectorAll('.filter');
    const cards = document.querySelectorAll('.project');
    filters.forEach(f => {
        f.addEventListener('click', () => {
            filters.forEach(x => x.classList.remove('is-active'));
            f.classList.add('is-active');
            const val = f.dataset.filter;
            cards.forEach(card => {
                const cats = (card.dataset.category || '').split(' ');
                card.style.display = (val === 'all' || cats.includes(val)) ? '' : 'none';
            });
        });
    });
})();

// ============================================================
// Modal
// ============================================================
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

if (modal) {
    modal.querySelectorAll('[data-close]').forEach(e => e.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ============================================================
// Experience data
// ============================================================
const experienceData = {
    f1purdue: {
        title: 'Treasurer — F1@Purdue',
        content: `
            <h4>Role overview</h4>
            <p>Financial operations for Purdue's Formula 1 student organization — the budget gets the same treatment as a pit-stop plan: every line accounted for, no time lost.</p>
            <h4>Responsibilities</h4>
            <ul>
                <li>Budget planning and transparent expense tracking for club activities and events</li>
                <li>Fundraising campaigns and grant applications with the executive board</li>
                <li>Allocating funds for race-event trips, an industry speaker series, and F1 sim competitions</li>
            </ul>
        `
    },
    molsoncoors: {
        title: 'U.S. Alcohol Market Forecast — The Data Mine × Molson Coors',
        content: `
            <h4>The ask</h4>
            <p>Molson Coors has historically struggled to forecast the U.S. alcohol market — the industry is shifting fast and traditional approaches weren't capturing it. They asked our 7-student Data Mine team for a fresh, data-driven 5-year forecast across all four major categories: Beer, Wine, Spirits, and RTDs.</p>
            <h4>The foundation</h4>
            <p>We consolidated 35 years of alcohol market data alongside macroeconomic indicators — DPI, unemployment, Fed Funds, CPI, GDP — into one master dataset. A significant lift given how messy and inconsistent the raw sources were, and the base everything else was built on. Each category then got the modeling method that fit it, not one approach forced across the board.</p>
            <h4>My categories — Beer &amp; RTDs</h4>
            <ul>
                <li><strong>Beer:</strong> declining-trend analysis with LASSO regression on economic drivers. Beer's story is straightforward — it's losing share, mostly to RTDs, and the model confirms continued decline through 2030. The hard part was the Beer Institute data itself: participating brewers change every few years, and full blackout periods (first 7 months of 2021, last 6 of 2024) forced workarounds.</li>
                <li><strong>RTDs:</strong> the most interesting category and the most technically stubborn. SARIMAX and XGBoost both failed outright (R² of −0.75 and −4.43) — ~35 annual data points just isn't ML territory. Pivoted to LASSO with macroeconomic features, which worked.</li>
            </ul>
            <h4>What the RTD model found</h4>
            <ul>
                <li>RTDs grow from 12% to 17% market share by 2030</li>
                <li>Economic forces explain 64% of year-to-year variation — but structural generational preference drives the long-term trend</li>
                <li>The strategic headline: RTDs hold ~54,000 barrels across all three economic scenarios. In a recession the total market shrinks 4% but RTDs hold their volume — so their share actually <em>rises</em> (19.3% in recession vs 17.7% in boom). Recession-resistant.</li>
            </ul>
            <h4>Team findings I'm proud to have been around</h4>
            <ul>
                <li>A 0.78 correlation between childhood sugar consumption and adult RTD preference at a 21-year lag — what kids ate in 1990 predicted RTD consumption in 2011. The boom isn't a fad; it's a generational shift already baked in.</li>
                <li>An experimental "vibes" analysis using Spotify and Billboard trends to quantify cultural drivers of beer consumption. It didn't work — and the null result is itself the finding: beer's decline is driven by cultural forces that are genuinely hard to measure.</li>
                <li>Teammates handled Wine (Holt-Winters, R²=0.9943) and Spirits (SARIMAX on the Iowa Liquor Sales transaction data).</li>
            </ul>
            <h4>Deliverables</h4>
            <p>52-slide final presentation, the master dataset, all model scripts, a 3-minute Data Mine Symposium trailer, and full technical documentation — built with TA Elisabeth Dunch and Molson Coors mentors Erin Schmidt and Nyssa Bulkes-McMurray.</p>
        `
    },
    teaching: {
        title: 'Teaching Assistant — ECON 252 Macroeconomics, Purdue',
        content: `
            <h4>Role overview</h4>
            <p>Supported course instruction for undergraduate macroeconomics across two semesters (Aug 2025 – May 2026).</p>
            <h4>Responsibilities</h4>
            <ul>
                <li>Weekly office hours and one-on-one support for challenging economic concepts</li>
                <li>Developed and graded assignments with detailed feedback</li>
                <li>Supported lecture materials and classroom activities</li>
            </ul>
            <h4>Topics</h4>
            <p>Aggregate demand and supply, inflation, unemployment, monetary and fiscal policy, international trade</p>
        `
    },
    cygnet: {
        title: 'Data Science & SWE Intern — Cygnet.One',
        content: `
            <h4>Role overview</h4>
            <p>Led front-end migration and dashboard development, working across ASP.NET MVC and SQL.</p>
            <h4>Key achievements</h4>
            <ul>
                <li>Migrated complex legacy ASPX modules to modern ASP.NET MVC — Razor views, controllers, and data models</li>
                <li>Built interactive delivery-status dashboards with real-time updates, dramatically improving stakeholder visibility</li>
                <li>Created KPI dashboards with role-based permissions for HR and management decision-making</li>
                <li>Integrated C# controllers with complex SQL stored procedures, with robust validation and conflict detection</li>
            </ul>
            <h4>Environment</h4>
            <p>ASP.NET MVC, C#, SQL Server, HTML/CSS/JavaScript, CI/CD pipeline</p>
        `
    },
    datamine: {
        title: 'Customer Segmentation — The Data Mine × AgReliant Genetics',
        content: `
            <h4>Project overview</h4>
            <p>Customer segmentation and predictive behavior modeling on real agricultural sales data — my first year in Purdue's Data Mine corporate-partners program.</p>
            <h4>Key achievements</h4>
            <ul>
                <li>Feature engineering: streamlined 80+ attributes to ~20 significant features</li>
                <li>Implemented K-means, DBSCAN, and hierarchical clustering with silhouette-score validation</li>
                <li>Delivered an 88%-accurate model for predicting customer purchasing patterns</li>
                <li>Built Tableau dashboards translating complex data into actionable business insights</li>
            </ul>
            <h4>Stack</h4>
            <p>Python (scikit-learn), R, Snowflake, Tableau</p>
        `
    },
    tutor: {
        title: 'Tutor — Shyam Sir Classes, Ahmedabad',
        content: `
            <h4>Role overview</h4>
            <p>Java programming instructor for a class of 30 students during an intensive summer course, back home in Ahmedabad.</p>
            <h4>Impact</h4>
            <ul>
                <li>100% pass rate on final Java assessments</li>
                <li>95% improvement in student proficiency on pre/post evaluations</li>
                <li>Recognized by the institution for exceptional teaching effectiveness</li>
            </ul>
            <h4>Approach</h4>
            <p>Hands-on learning with immediate feedback, real-world exercises, and personalized plans for different learning styles</p>
        `
    }
};

// ============================================================
// Project data
// ============================================================
const projectData = {
    'macro-regime': {
        title: 'Macro Regime Dashboard',
        tags: ['Python', 'GMM', 'scikit-learn', 'FRED API', 'yfinance', 'pandas'],
        github: 'https://github.com/Nityaj22/AI_ML_Projects/tree/main/Macro_Regime',
        content: `
            <h4>Overview</h4>
            <p>A full regime-classification pipeline that identifies which of four economic environments — Expansion, Slowdown, Stagflation, or Recession — the economy is in, across 352 months of Federal Reserve data (1996–2026), with a live dashboard showing the current regime and probability breakdown.</p>
            <h4>Regime timeline, 1996–2026</h4>
            <img src="https://raw.githubusercontent.com/Nityaj22/AI_ML_Projects/main/Macro_Regime/outputs/charts/regime_timeline.png" alt="Regime timeline chart" loading="lazy">
            <p class="img-caption">green = expansion · orange = slowdown · purple = stagflation · red = recession</p>
            <h4>Method</h4>
            <ul>
                <li>Gaussian Mixture Model with full covariance, n_init=10; BIC analysis to select regime count (tested 2–7)</li>
                <li>5 features: yield-curve spread (T10Y2Y), CPI YoY, unemployment MoM change, INDPRO YoY, high-yield credit spread</li>
                <li>Soft probabilities per month instead of hard labels; StandardScaler with unscaled values kept for interpretability</li>
                <li>Sector rotation: average monthly returns per ETF across 9 S&amp;P 500 sectors, by regime</li>
            </ul>
            <h4>Feature heatmap</h4>
            <img src="https://raw.githubusercontent.com/Nityaj22/AI_ML_Projects/main/Macro_Regime/outputs/charts/regime_heatmap.png" alt="Feature heatmap" loading="lazy">
            <h4>Sector rotation</h4>
            <img src="https://raw.githubusercontent.com/Nityaj22/AI_ML_Projects/main/Macro_Regime/outputs/charts/sector_returns.png" alt="Sector returns by regime" loading="lazy">
            <h4>Results</h4>
            <ul>
                <li>Correctly identifies the 2008 crisis, 2020 COVID crash, and 2022 stagflation</li>
                <li>Stagflation regime: energy (XLE) +2.1%/month while financials and discretionary turn negative — consistent with theory</li>
                <li>Phase 2 planned: Hidden Markov Models + FOMC sentiment via NLP</li>
            </ul>
        `
    },
    'monte-carlo': {
        title: 'Monte Carlo Portfolio Simulation',
        tags: ['Python', 'NumPy', 'GBM', 'yfinance', 'Risk'],
        github: 'https://github.com/Nityaj22/AI_ML_Projects/tree/main/Monte_Carlo_Models',
        content: `
            <h4>Overview</h4>
            <p>A financial modeling suite that simulates thousands of portfolio outcomes with Geometric Brownian Motion, helping evaluate risk and return probabilities with real market parameters.</p>
            <h4>Components</h4>
            <ul>
                <li>Basic simulation: 1,000 portfolio paths over 252 trading days</li>
                <li>GBM modeling with drift and volatility estimated from historical data</li>
                <li>Single-name analysis (NVDA) using realized returns and volatility</li>
                <li>Multi-asset comparison of SPY, QQQ, and DIA across 10,000 simulations</li>
            </ul>
            <h4>Risk metrics</h4>
            <ul>
                <li>Value at Risk (VaR) and maximum drawdown</li>
                <li>Probability of hitting price targets or avoiding loss thresholds</li>
                <li>Multi-asset correlation handling in portfolio paths</li>
            </ul>
        `
    },
    'f1-undercut': {
        title: 'F1 Undercut Strategy Analysis',
        tags: ['Python', 'FastF1', 'pandas', 'matplotlib', 'seaborn'],
        github: 'https://github.com/Nityaj22/AI_ML_Projects/tree/main/f1_undercut',
        content: `
            <h4>Overview</h4>
            <p>When a driver pits early to leapfrog a rival — the undercut — when does it actually work? This project extracts real race data via FastF1 to quantify undercut success across tracks, conditions, and tire compounds.</p>
            <h4>Visualization suite</h4>
            <ul>
                <li>Stint degradation: median lap time with IQR shading per compound — the core tire-wear deliverable</li>
                <li>Pit timeline: every stop per driver, colored by compound, exposing overlapping strategies</li>
                <li>Undercut heatmap: success probability binned by gap and tire age — effectively a playbook for when to trigger the call</li>
                <li>Plus lap-time distributions, gap-to-ahead traces, success breakdowns, and compound-change bar charts — nine visuals total</li>
            </ul>
            <h4>Why it matters beyond racing</h4>
            <p>It's the same problem as a portfolio rebalance: act early on incomplete information, or wait and risk losing the window. The data answers it either way.</p>
        `
    },
    'f1-race-replay': {
        title: 'F1 Race Replay Visualization',
        tags: ['Python', 'FastF1', 'Arcade', 'NumPy', 'Multiprocessing'],
        github: '',
        content: `
            <h4>Overview</h4>
            <p>Transforms raw F1 telemetry into interactive race replays — pause, rewind, and analyze every strategic decision. Click any driver for live speed, gear, DRS, and tire compound; qualifying mode maps throttle and braking against the circuit.</p>
            <h4>Technical highlights</h4>
            <ul>
                <li>Multiprocessing pipeline handles 20+ drivers in parallel — 80% faster compute, with pickle caching for instant reloads</li>
                <li>Resampling engine interpolates irregular telemetry onto a unified 25 fps timeline, handling pit stops, retirements, and gaps</li>
                <li>Scalable Arcade rendering that auto-rotates the circuit to the optimal viewing angle at any window size</li>
                <li>Live leaderboard via along-track distance projection; track status, weather, and 0.5×–4× playback controls</li>
            </ul>
        `
    },
    'unix-shell': {
        title: 'Custom Unix Shell',
        tags: ['C/C++', 'Systems', 'Processes', 'Signals'],
        github: '',
        content: `
            <h4>Overview</h4>
            <p>A fully functional Unix shell built from scratch — replicating and extending bash/csh behavior through direct OS interaction.</p>
            <h4>Features</h4>
            <ul>
                <li>Pipelines (ls | grep txt | wc -l), full I/O redirection, foreground and background processes</li>
                <li>Built-ins: cd, exit, setenv, unsetenv, printenv; environment variables, wildcards, and subshells</li>
                <li>Interactive line editor with history, tab completion, and cursor movement</li>
            </ul>
            <h4>Under the hood</h4>
            <ul>
                <li>Fork-exec process model with proper SIGINT/SIGCHLD handling to prevent zombies</li>
                <li>Custom lexer and parser for shell syntax, quoting, and escaping</li>
                <li>Careful file-descriptor management for pipes and redirection</li>
            </ul>
        `
    },
    'agreliant-dashboard': {
        title: 'Customer Segmentation — AgReliant Genetics',
        tags: ['Python', 'K-means', 'PCA', 'Tableau', 'Snowflake'],
        github: '',
        content: `
            <h4>Overview</h4>
            <p>Unsupervised customer segmentation on real agricultural sales data, built during The Data Mine partnership.</p>
            <h4>Method</h4>
            <ul>
                <li>Feature engineering from 80+ attributes down to ~20 key features</li>
                <li>K-means with elbow-method k selection, validated against DBSCAN and hierarchical clustering</li>
                <li>Silhouette score, Davies-Bouldin index, and WCSS for cluster quality</li>
                <li>PCA for structure and visualization; Tableau for the business-facing story</li>
            </ul>
            <h4>Impact</h4>
            <p>Distinct, actionable customer segments that gave AgReliant a data-driven foundation for targeted marketing and improved conversion.</p>
        `
    },
    'kra-kpi-platform': {
        title: 'KRA-KPI Management Platform',
        tags: ['MVC', 'JavaScript', 'HTML/CSS'],
        github: '',
        content: `
            <h4>Overview</h4>
            <p>A performance-management platform with role-specific interfaces for HR, managers, and employees — tracking Key Result Areas and KPIs end to end.</p>
            <h4>Features</h4>
            <ul>
                <li>Role-based dashboards: HR administration, manager team views, employee self-assessment</li>
                <li>KRA assignment, KPI tracking with progress visualization, and review workflows</li>
                <li>Reporting and analytics for data-driven evaluation</li>
            </ul>
            <h4>Architecture</h4>
            <p>Clean MVC separation — models for metrics and definitions, role-specific views, controllers coordinating the two — built for maintainability and scale.</p>
        `
    }
};

// ============================================================
// Wire up modals
// ============================================================
document.querySelectorAll('.xp').forEach(card => {
    const btn = card.querySelector('.xp-more');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const d = experienceData[card.dataset.experience];
        if (d) openModal(d.title, d.content);
    });
});

document.querySelectorAll('.project').forEach(card => {
    const btn = card.querySelector('.project-more');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const d = projectData[card.dataset.project];
        if (!d) return;
        const tags = d.tags.map(t => `<span>${t}</span>`).join('');
        const gh = d.github
            ? `<a class="link-btn modal-gh" href="${d.github}" target="_blank" rel="noopener"><i class="fab fa-github"></i> View on GitHub</a>`
            : '';
        openModal(d.title, `<div class="modal-tags">${tags}</div>${gh}${d.content}`);
    });
});

// ============================================================
// Active nav link on scroll
// ============================================================
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    if (!sections.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 160) current = s.id;
        });
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
    }, { passive: true });
})();
