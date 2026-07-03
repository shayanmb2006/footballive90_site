(function () {

    const pageT = {

        en: { title: "Today's Matches", filterAll: 'All', filterLive: 'Live' },

        fa: { title: 'بازی‌های امروز', filterAll: 'همه', filterLive: 'زنده', liveOnly: 'فقط بازی‌های زنده لیگ‌های مطرح' },

    };



    const LIVE_POLL_MS = 45000;



    let MATCHES_DATA = [];

    let filter = 'all';

    let pollTimer = null;

    let initialLoadDone = false;



    function pt(key) {

        return pageT[SiteI18n.lang][key] || pageT.en[key];

    }



    function applyPageText() {

        const title = document.getElementById('page-title');

        if (title) title.textContent = pt('title');

        updateFilterLabels();

        renderMatches();

    }



    function getMatchCounts() {

        const total = MATCHES_DATA.length;

        const live = MATCHES_DATA.filter((m) => m.status === 'LIVE').length;

        return { total, live };

    }



    function updateFilterLabels() {

        const { total, live } = getMatchCounts();

        document.querySelectorAll('[data-filter]').forEach((btn) => {

            const key = btn.getAttribute('data-filter');

            if (key === 'all') {

                btn.textContent = `${pt('filterAll')} (${total})`;

            } else if (key === 'live') {

                btn.textContent = `${pt('filterLive')} (${live})`;

            }

        });

    }



    function hasLiveMatches() {

        return MATCHES_DATA.some((m) => m.status === 'LIVE');

    }



    function buildMatchCardHtml(match) {

        const lang = SiteI18n.lang;

        const league = lang === 'fa' ? match.league_fa : match.league_en;

        const home = lang === 'fa' ? match.home_fa : match.home_en;

        const away = lang === 'fa' ? match.away_fa : match.away_en;

        const isLive = match.status === 'LIVE';

        const statusClass = isLive ? 'live' : (match.status === 'FINISHED' ? 'finished' : '');

        const liveHTML = isLive ? '<span class="live-indicator"></span>' : '';

        const homeLogo = match.home_logo

            ? `<img src="${match.home_logo}" alt="" class="team-logo" onerror="this.style.display='none'">`

            : '';

        const awayLogo = match.away_logo

            ? `<img src="${match.away_logo}" alt="" class="team-logo" onerror="this.style.display='none'">`

            : '';



        return `

            <div class="match-card" id="match-${match.id}" data-match-id="${match.id}">

                <div class="match-teams">

                    <div class="team-side home">${homeLogo}<span class="team-name">${home}</span></div>

                    <div class="score-pill">${match.score}</div>

                    <div class="team-side away">${awayLogo}<span class="team-name">${away}</span></div>

                </div>

                <div class="match-status ${statusClass}">${liveHTML}${match.time}</div>

            </div>`;

    }



    function renderMatches() {

        const container = document.getElementById('matches-list');

        if (!container) return;



        let data = MATCHES_DATA;

        if (filter === 'live') data = data.filter((m) => m.status === 'LIVE');



        if (!data.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noData')}</div>`;
            updateFilterLabels();
            return;
        }



        let html = '';

        let currentLeague = '';



        data.forEach((match) => {

            const lang = SiteI18n.lang;

            const league = lang === 'fa' ? match.league_fa : match.league_en;



            if (league !== currentLeague) {

                const leagueLogo = match.league_logo

                    ? `<img src="${match.league_logo}" alt="" class="league-logo" onerror="this.remove()">`

                    : '';

                html += `<div class="league-header" data-league="${league}">${leagueLogo}${league}</div>`;

                currentLeague = league;

            }



            html += buildMatchCardHtml(match);

        });



        container.innerHTML = html;
        updateFilterLabels();
    }



    function updateMatchCardDom(match) {

        const card = document.getElementById(`match-${match.id}`);

        if (!card) return false;



        const pill = card.querySelector('.score-pill');

        const statusEl = card.querySelector('.match-status');

        let changed = false;



        if (pill && pill.textContent !== match.score) {

            pill.textContent = match.score;

            pill.classList.add('score-updated');

            setTimeout(() => pill.classList.remove('score-updated'), 1200);

            changed = true;

        }



        if (statusEl) {

            const isLive = match.status === 'LIVE';

            const statusClass = isLive ? 'live' : (match.status === 'FINISHED' ? 'finished' : '');

            const liveHTML = isLive ? '<span class="live-indicator"></span>' : '';

            const nextHtml = `${liveHTML}${match.time}`;

            if (statusEl.innerHTML !== nextHtml || statusEl.className !== `match-status ${statusClass}`) {

                statusEl.className = `match-status ${statusClass}`;

                statusEl.innerHTML = nextHtml;

                changed = true;

            }

        }



        return changed;

    }



    function stopLivePoll() {

        if (pollTimer) {

            clearInterval(pollTimer);

            pollTimer = null;

        }

    }



    function scheduleLivePoll() {

        stopLivePoll();

        if (!hasLiveMatches()) return;

        pollTimer = setInterval(refreshLiveScores, LIVE_POLL_MS);

    }



    async function refreshLiveScores() {

        if (!window.FootballAPI || !initialLoadDone) return;

        if (!hasLiveMatches()) {

            stopLivePoll();

            return;

        }



        try {

            const liveFixtures = await FootballAPI.getLiveMatches(true);

            const liveCards = liveFixtures.map((f) => FootballAPI.formatFixtureForMatchCard(f));

            const liveById = new Map(liveCards.map((m) => [m.id, m]));

            let structuralChange = false;



            MATCHES_DATA.forEach((m, idx) => {

                if (m.status !== 'LIVE') return;



                const live = liveById.get(m.id);

                if (live) {

                    if (m.score !== live.score || m.time !== live.time || m.status !== live.status) {

                        MATCHES_DATA[idx] = { ...m, score: live.score, time: live.time, status: live.status };

                        updateMatchCardDom(MATCHES_DATA[idx]);

                    }

                } else {

                    MATCHES_DATA[idx] = { ...m, status: 'FINISHED', time: 'FT' };

                    updateMatchCardDom(MATCHES_DATA[idx]);

                }

            });



            liveCards.forEach((live) => {

                if (live.status !== 'LIVE') return;

                const exists = MATCHES_DATA.some((m) => m.id === live.id);

                if (!exists) structuralChange = true;

            });



            if (structuralChange) {

                await loadMatches(false);

            } else {

                updateFilterLabels();

                scheduleLivePoll();

            }

        } catch (e) {

            console.error('Live score refresh failed:', e);

        }

    }



    async function loadMatches(showLoading = true) {

        const container = document.getElementById('matches-list');

        if (!container) return;



        if (showLoading) {

            container.innerHTML = `<div class="loading-box">${SiteI18n.t('loading')}</div>`;

        }



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
                    initialLoadDone = true;
                    updateFilterLabels();
                    renderMatches();

                    scrollToHash();

                    scheduleLivePoll();

                    return;

                }

            }

        } catch (e) {

            console.error(e);

        }



        MATCHES_DATA = [];
        initialLoadDone = true;
        updateFilterLabels();
        renderMatches();

        stopLivePoll();

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

        loadMatches(true);

    });



    window.addEventListener('langchange', () => {

        applyPageText();

        loadMatches(true);

    });



    document.addEventListener('visibilitychange', () => {

        if (document.visibilityState === 'visible' && hasLiveMatches()) {

            refreshLiveScores();

        }

    });

})();


