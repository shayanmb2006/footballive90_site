/**
 * API Client for Footballive90 Landing Page
 */
(function () {
    const getAPIBaseURL = () => {
        if (window.SITE_CONFIG && window.SITE_CONFIG.apiBaseUrl) {
            return window.SITE_CONFIG.apiBaseUrl.replace(/\/$/, '');
        }
        if (window.API_BASE_URL) {
            return window.API_BASE_URL.replace(/\/$/, '');
        }
        const origin = window.location.origin;
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
        return isLocal ? 'http://localhost:5000/api' : `${origin}/api`;
    };

    const API_BASE_URL = getAPIBaseURL();

    async function fetchAPI(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                ...options,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            return null;
        }
    }

    async function getLiveMatches() {
        const data = await fetchAPI('/football/live');
        return data?.response && Array.isArray(data.response) ? data.response : [];
    }

    async function getFixturesByDate(date = null) {
        if (!date) {
            date = new Date().toISOString().split('T')[0];
        }
        const data = await fetchAPI(`/football/fixtures?date=${date}&timezone=Asia/Tehran`);
        return data?.response && Array.isArray(data.response) ? data.response : [];
    }

    async function getLeagues() {
        const data = await fetchAPI('/football/leagues');
        return data?.response && Array.isArray(data.response) ? data.response : [];
    }

    function formatFixtureForMatchCard(fixture) {
        const fixtureData = fixture.fixture || {};
        const teams = fixture.teams || {};
        const goals = fixture.goals || {};
        const league = fixture.league || {};
        const status = fixtureData.status || {};

        const isLive = ['LIVE', '1H', '2H', 'HT'].includes(status.short);
        const isFinished = ['FT', 'AET', 'PEN'].includes(status.short);
        const isNotStarted = ['NS', 'TBD'].includes(status.short);

        let scoreDisplay = '-';
        let timeDisplay = '';

        if (isLive) {
            scoreDisplay = `${goals.home ?? 0} - ${goals.away ?? 0}`;
            timeDisplay = status.elapsed ? `${status.elapsed}'` : 'LIVE';
        } else if (isFinished) {
            scoreDisplay = `${goals.home ?? 0} - ${goals.away ?? 0}`;
            timeDisplay = 'FT';
        } else if (isNotStarted) {
            const matchDate = new Date(fixtureData.date);
            timeDisplay = `${String(matchDate.getHours()).padStart(2, '0')}:${String(matchDate.getMinutes()).padStart(2, '0')}`;
        } else {
            timeDisplay = status.short || '';
        }

        const leagueName = league.name || 'Unknown League';

        return {
            id: fixtureData.id,
            league_en: leagueName,
            league_fa: leagueName,
            home_en: teams.home?.name || 'Home',
            home_fa: teams.home?.name || 'Home',
            away_en: teams.away?.name || 'Away',
            away_fa: teams.away?.name || 'Away',
            home_logo: teams.home?.logo || '',
            away_logo: teams.away?.logo || '',
            score: scoreDisplay,
            time: timeDisplay,
            status: isLive ? 'LIVE' : (isNotStarted ? 'NOT STARTED' : 'FINISHED'),
            league_logo: league.logo || '',
        };
    }

    function formatFixtureForNewsCard(fixture) {
        const fixtureData = fixture.fixture || {};
        const teams = fixture.teams || {};
        const goals = fixture.goals || {};
        const league = fixture.league || {};
        const status = fixtureData.status || {};
        const homeTeam = teams.home?.name || 'Home';
        const awayTeam = teams.away?.name || 'Away';
        const leagueName = league.name || 'Unknown League';

        const isImportant =
            ['LIVE', 'FT', '1H', '2H'].includes(status.short) ||
            (league.id && [39, 140, 78, 135, 61, 2, 3].includes(league.id));

        if (!isImportant) return null;

        const score = `${goals.home ?? 0} - ${goals.away ?? 0}`;
        let title_en = '';
        let title_fa = '';
        let categoryKey = leagueName;

        if (['LIVE', '1H', '2H', 'HT'].includes(status.short)) {
            title_en = `${homeTeam} ${score} ${awayTeam}`;
            title_fa = `${homeTeam} ${score} ${awayTeam}`;
            categoryKey = 'LIVE';
        } else if (status.short === 'FT') {
            title_en = `${homeTeam} ${score} ${awayTeam}`;
            title_fa = `${homeTeam} ${score} ${awayTeam}`;
            categoryKey = 'FT';
        } else {
            title_en = `${homeTeam} vs ${awayTeam}`;
            title_fa = `${homeTeam} مقابل ${awayTeam}`;
        }

        const imageUrl = league.logo || teams.home?.logo || '';
        const isLogo = Boolean(league.logo || teams.home?.logo);

        return {
            categoryKey,
            leagueName,
            title_en,
            title_fa,
            image: imageUrl || 'https://picsum.photos/seed/football/400/200',
            isLogo,
            link: `matches.html#match-${fixtureData.id}`,
            fixture_id: fixtureData.id,
        };
    }

    async function getTodayMatches() {
        const fixtures = await getFixturesByDate();
        return fixtures.map(formatFixtureForMatchCard);
    }

    async function getNewsItems(limit = 6) {
        const [liveFixtures, todayFixtures] = await Promise.all([
            getLiveMatches(),
            getFixturesByDate(),
        ]);

        const seen = new Set();
        const allFixtures = [...liveFixtures, ...todayFixtures].filter((f) => {
            const id = f.fixture?.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        return allFixtures
            .map(formatFixtureForNewsCard)
            .filter(Boolean)
            .sort((a, b) => {
                if (a.categoryKey === 'LIVE') return -1;
                if (b.categoryKey === 'LIVE') return 1;
                if (a.categoryKey === 'FT') return -1;
                if (b.categoryKey === 'FT') return 1;
                return 0;
            })
            .slice(0, limit);
    }

    async function getHeroMatch() {
        const live = await getLiveMatches();
        if (live.length > 0) return formatFixtureForMatchCard(live[0]);
        const today = await getFixturesByDate();
        if (today.length > 0) return formatFixtureForMatchCard(today[0]);
        return null;
    }

    async function getTickerMatches(limit = 12) {
        const [live, today] = await Promise.all([getLiveMatches(), getFixturesByDate()]);
        const seen = new Set();
        const items = [...live, ...today]
            .filter((f) => {
                const id = f.fixture?.id;
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            })
            .slice(0, limit)
            .map(formatFixtureForMatchCard);
        return items;
    }

    window.FootballAPI = {
        getLiveMatches,
        getFixturesByDate,
        getTodayMatches,
        getNewsItems,
        getLeagues,
        getHeroMatch,
        getTickerMatches,
        formatFixtureForMatchCard,
        formatFixtureForNewsCard,
        API_BASE_URL,
    };
})();
