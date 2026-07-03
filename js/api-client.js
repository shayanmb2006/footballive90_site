/**

 * API Client for Footballive90 Landing Page

 */

(function () {

    const getAPIBaseURL = () => {

        if (window.SITE_CONFIG?.apiBaseUrl) {

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



    function getLang() {

        return window.SiteI18n?.lang || (window.location.hostname.includes('.ir') ? 'fa' : 'en');

    }



    function withLang(endpoint, extra = {}) {

        const params = new URLSearchParams({ lang: getLang(), ...extra });

        const join = endpoint.includes('?') ? '&' : '?';

        return `${endpoint}${join}${params.toString()}`;

    }



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



    function buildMatchUrl(fixtureId) {

        if (!fixtureId) return 'matches.html';

        const app = (window.SITE_CONFIG?.appUrl || '').replace(/\/$/, '');

        if (app) {

            return `${app}/?page=all-matches#fixture-${fixtureId}`;

        }

        return `matches.html#match-${fixtureId}`;

    }



    function buildNewsUrl(item) {

        if (item.external_link) return item.external_link;

        if (item.fixture_id) return buildMatchUrl(item.fixture_id);

        if (item.link) return item.link;

        return 'news.html';

    }



    function pickName(entity, lang) {

        if (!entity) return '';

        if (lang === 'fa') return entity.name_fa || entity.name || entity.name_en || '';

        return entity.name_en || entity.name || entity.name_fa || '';

    }



    /** Extract both EN/FA labels from API entity (localized or indexed). */

    function entityLabels(entity, fallbackEn, fallbackFa) {

        if (!entity) return { en: fallbackEn, fa: fallbackFa };

        const name = (entity.name || '').trim();

        const nameEn = (entity.name_en || '').trim();

        const nameFa = (entity.name_fa || '').trim();



        if (nameFa) {

            return {

                en: nameEn || name || nameFa,

                fa: nameFa,

            };

        }



        if (nameEn && name && name !== nameEn) {

            return { en: nameEn, fa: name };

        }



        return {

            en: nameEn || name || fallbackEn,

            fa: nameFa || name || fallbackFa,

        };

    }



    function pickMatchTeamName(match, side, lang) {

        const l = lang || getLang();

        const fa = (match[`${side}_fa`] || '').trim();

        const en = (match[`${side}_en`] || '').trim();

        if (l === 'fa') return fa || en || '';

        return en || fa || '';

    }



    async function getLiveMatches(featured = true) {

        const data = await fetchAPI(withLang('/football/live', featured ? { featured: 'true' } : {}));

        return data?.response && Array.isArray(data.response) ? data.response : [];

    }



    async function getFeaturedFixtures(date = null) {

        const extra = { timezone: 'Asia/Tehran' };

        if (date) extra.date = date;

        const data = await fetchAPI(withLang('/football/fixtures/featured', extra));

        return data?.response && Array.isArray(data.response) ? data.response : [];

    }



    async function getFixturesByDate(date = null) {

        return getFeaturedFixtures(date);

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



        const home = teams.home || {};

        const away = teams.away || {};

        const leagueLabels = entityLabels(league, 'Unknown League', 'لیگ');

        const homeLabels = entityLabels(home, 'Home', 'میزبان');

        const awayLabels = entityLabels(away, 'Away', 'مهمان');



        return {

            id: fixtureData.id,

            league_en: leagueLabels.en,

            league_fa: leagueLabels.fa,

            home_en: homeLabels.en,

            home_fa: homeLabels.fa,

            away_en: awayLabels.en,

            away_fa: awayLabels.fa,

            home_logo: home.logo || '',

            away_logo: away.logo || '',

            score: scoreDisplay,

            time: timeDisplay,

            status: isLive ? 'LIVE' : (isNotStarted ? 'NOT STARTED' : 'FINISHED'),

            league_logo: league.logo || '',

        };

    }



    function formatFixtureForNewsCard(fixture) {

        const card = formatFixtureForMatchCard(fixture);

        const fixtureData = fixture.fixture || {};

        const status = fixtureData.status || {};

        const lang = getLang();



        let categoryKey = 'UPCOMING';

        let title_en = `${card.home_en} vs ${card.away_en}`;

        let title_fa = `${card.home_fa} مقابل ${card.away_fa}`;



        if (['LIVE', '1H', '2H', 'HT'].includes(status.short)) {

            categoryKey = 'LIVE';

            title_en = `${card.home_en} ${card.score} ${card.away_en}`;

            title_fa = `${card.home_fa} ${card.score} ${card.away_fa}`;

        } else if (status.short === 'FT') {

            categoryKey = 'FT';

            title_en = `${card.home_en} ${card.score} ${card.away_en}`;

            title_fa = `${card.home_fa} ${card.score} ${card.away_fa}`;

        }



        const imageUrl = card.league_logo || card.home_logo || '';

        return {

            categoryKey,

            leagueName: lang === 'fa' ? card.league_fa : card.league_en,

            title_en,

            title_fa,

            image: imageUrl || 'https://picsum.photos/seed/football/400/200',

            isLogo: Boolean(imageUrl),

            link: buildMatchUrl(fixtureData.id),

            fixture_id: fixtureData.id,

            is_external: false,

        };

    }



    function normalizeRssNewsItem(item) {

        return {

            categoryKey: item.categoryKey || 'NEWS',

            leagueName: item.leagueName || item.source || 'News',

            title_en: item.title_en || item.title || '',

            title_fa: item.title_fa || item.title_en || item.title || '',

            image: item.image || '',

            isLogo: false,

            external_link: item.external_link || item.link || '',

            link: item.external_link || item.link || 'news.html',

            is_external: true,

            source: item.source || '',

        };

    }



    async function getTodayMatches() {

        const fixtures = await getFeaturedFixtures();

        return fixtures.map(formatFixtureForMatchCard);

    }



    async function getFixtureNewsFallback(limit = 6) {

        const [liveFixtures, todayFixtures] = await Promise.all([

            getLiveMatches(true),

            getFeaturedFixtures(),

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



    async function getNewsItems(limit = 6) {

        const data = await fetchAPI(withLang('/news', { limit: String(limit) }));

        if (data?.response?.length) {

            return data.response.map(normalizeRssNewsItem).filter(isRealNewsItem);

        }

        const fallback = await fetchAPI(withLang('/site/news', { limit: String(limit) }));

        if (fallback?.response?.length && fallback.source && fallback.source !== 'none') {

            return fallback.response.map(normalizeRssNewsItem).filter(isRealNewsItem);

        }

        return [];

    }



    function isRealNewsItem(item) {

        if (!item) return false;

        if (item.is_external === true) return true;

        if (item.categoryKey === 'NEWS') return true;

        return Boolean(item.external_link || item.link);

    }



    async function getHeroMatch() {

        const live = await getLiveMatches(true);

        if (live.length > 0) return formatFixtureForMatchCard(live[0]);

        const today = await getFeaturedFixtures();

        if (today.length > 0) return formatFixtureForMatchCard(today[0]);

        return null;

    }



    async function getTickerMatches(limit = 12) {

        const [live, today] = await Promise.all([getLiveMatches(true), getFeaturedFixtures()]);

        const seen = new Set();

        return [...live, ...today]

            .filter((f) => {

                const id = f.fixture?.id;

                if (!id || seen.has(id)) return false;

                seen.add(id);

                return true;

            })

            .slice(0, limit)

            .map(formatFixtureForMatchCard);

    }



    window.FootballAPI = {

        getLiveMatches,

        getFeaturedFixtures,

        getFixturesByDate,

        getTodayMatches,

        getNewsItems,

        getHeroMatch,

        getTickerMatches,

        formatFixtureForMatchCard,

        formatFixtureForNewsCard,

        buildMatchUrl,

        buildNewsUrl,

        pickName,

        entityLabels,

        pickMatchTeamName,

        getLang,

        API_BASE_URL,

    };

})();

