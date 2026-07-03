(function () {
    const pageT = {
        en: { title: "Today's Matches", filterAll: 'All', filterLive: 'Live' },
            fa: { title: 'بازی‌های امروز', filterAll: 'همه', filterLive: 'زنده', liveOnly: 'فقط بازی‌های زنده لیگ‌های مطرح' },
        };

    let MATCHES_DATA = [];
    let filter = 'all';

    function pt(key) {
        return pageT[SiteI18n.lang][key] || pageT.en[key];
    }

    function applyPageText() {
        const title = document.getElementById('page-title');
        if (title) title.textContent = pt('title');
        document.querySelectorAll('[data-page-i18n]').forEach((el) => {
            const key = el.getAttribute('data-page-i18n');
            if (pageT[SiteI18n.lang][key]) el.textContent = pageT[SiteI18n.lang][key];
        });
        renderMatches();
    }

    function renderMatches() {
        const container = document.getElementById('matches-list');
        if (!container) return;

        let data = MATCHES_DATA;
        if (filter === 'live') data = data.filter((m) => m.status === 'LIVE');

        if (!data.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noData')}</div>`;
            return;
        }

        let html = '';
        let currentLeague = '';

        data.forEach((match) => {
            const lang = SiteI18n.lang;
            const league = lang === 'fa' ? match.league_fa : match.league_en;
            const home = lang === 'fa' ? match.home_fa : match.home_en;
            const away = lang === 'fa' ? match.away_fa : match.away_en;
            const isLive = match.status === 'LIVE';
            const statusClass = isLive ? 'live' : (match.status === 'FINISHED' ? 'finished' : '');
            const liveHTML = isLive ? '<span class="live-indicator"></span>' : '';

            if (league !== currentLeague) {
                const leagueLogo = match.league_logo
                    ? `<img src="${match.league_logo}" alt="" class="league-logo" onerror="this.remove()">`
                    : '';
                html += `<div class="league-header">${leagueLogo}${league}</div>`;
                currentLeague = league;
            }

            const homeLogo = match.home_logo
                ? `<img src="${match.home_logo}" alt="" class="team-logo" onerror="this.style.display='none'">`
                : '';
            const awayLogo = match.away_logo
                ? `<img src="${match.away_logo}" alt="" class="team-logo" onerror="this.style.display='none'">`
                : '';

            html += `
            <div class="match-card" id="match-${match.id}">
                <div class="match-teams">
                    <div class="team-side home">${homeLogo}<span class="team-name">${home}</span></div>
                    <div class="score-pill">${match.score}</div>
                    <div class="team-side away">${awayLogo}<span class="team-name">${away}</span></div>
                </div>
                <div class="match-status ${statusClass}">${liveHTML}${match.time}</div>
            </div>`;
        });

        container.innerHTML = html;
    }

    async function loadMatches() {
        const container = document.getElementById('matches-list');
        if (!container) return;
        container.innerHTML = `<div class="loading-box">${SiteI18n.t('loading')}</div>`;

        try {
            if (window.FootballAPI) {
                const [featuredFixtures, liveFixtures] = await Promise.all([
                    FootballAPI.getFeaturedFixtures(),
                    FootballAPI.getLiveMatches(true),
                ]);
                const seen = new Set();
                const merged = [];
                [...liveFixtures, ...featuredFixtures].forEach((f) => {
                    const id = f.fixture?.id;
                    if (!id || seen.has(id)) return;
                    seen.add(id);
                    merged.push(FootballAPI.formatFixtureForMatchCard(f));
                });
                if (merged.length) {
                    MATCHES_DATA = merged;
                    renderMatches();
                    scrollToHash();
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        }
        MATCHES_DATA = [];
        renderMatches();
    }

    function scrollToHash() {
        if (!location.hash) return;
        requestAnimationFrame(() => {
            const el = document.querySelector(location.hash);
            if (el) {
                el.classList.add('match-card-highlight');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    function initFilters() {
        document.querySelectorAll('[data-filter]').forEach((btn) => {
            btn.addEventListener('click', () => {
                filter = btn.getAttribute('data-filter');
                document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                renderMatches();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyPageText();
        initFilters();
        loadMatches();
        setInterval(() => {
            if (MATCHES_DATA.some((m) => m.status === 'LIVE')) loadMatches();
        }, 30000);
    });

    window.addEventListener('langchange', () => {
        applyPageText();
        loadMatches();
    });
})();
