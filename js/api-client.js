/**
 * API Client for Footballive90 Landing Page
 * این فایل برای اتصال به API بک‌اند استفاده می‌شود
 * بدون نیاز به تغییر در بک‌اند یا فرانت‌اند اصلی
 */

// Base URL برای API - می‌تواند از محیط یا نسبت به صفحه فعلی باشد
const getAPIBaseURL = () => {
    // اگر در production است و base URL در environment تعریف شده
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }
    
    // تشخیص خودکار: اگر در localhost هستیم، از localhost استفاده کن
    // در غیر این صورت از همان origin استفاده کن
    const origin = window.location.origin;
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    if (isLocal) {
        // در development: بک‌اند معمولاً روی پورت 5000 اجرا می‌شود
        return 'http://localhost:5000/api';
    } else {
        // در production: از همان origin استفاده کن
        return `${origin}/api`;
    }
};

const API_BASE_URL = getAPIBaseURL();

/**
 * تابع عمومی برای fetch از API
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        ...options
    };
    
    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        // در صورت خطا، null برگردان تا بتوان fallback استفاده کرد
        return null;
    }
}

/**
 * دریافت مسابقات زنده
 */
async function getLiveMatches() {
    const data = await fetchAPI('/football/live');
    if (data && data.response && Array.isArray(data.response)) {
        return data.response;
    }
    return [];
}

/**
 * دریافت مسابقات یک روز خاص
 * @param {string} date - تاریخ به فرمت YYYY-MM-DD (اختیاری، پیش‌فرض امروز)
 */
async function getFixturesByDate(date = null) {
    if (!date) {
        // تاریخ امروز
        const today = new Date();
        date = today.toISOString().split('T')[0];
    }
    
    const data = await fetchAPI(`/football/fixtures?date=${date}&timezone=Asia/Tehran`);
    if (data && data.response && Array.isArray(data.response)) {
        return data.response;
    }
    return [];
}

/**
 * دریافت لیگ‌ها
 */
async function getLeagues() {
    const data = await fetchAPI('/football/leagues');
    if (data && data.response && Array.isArray(data.response)) {
        return data.response;
    }
    return [];
}

/**
 * تبدیل داده‌های API به فرمت مورد استفاده در لندینگ پیج
 */

/**
 * تبدیل fixture API به فرمت match card
 */
function formatFixtureForMatchCard(fixture) {
    const fixtureData = fixture.fixture || {};
    const teams = fixture.teams || {};
    const goals = fixture.goals || {};
    const league = fixture.league || {};
    const status = fixtureData.status || {};
    
    const isLive = status.short === 'LIVE' || status.short === '1H' || status.short === '2H' || status.short === 'HT';
    const isFinished = status.short === 'FT' || status.short === 'AET' || status.short === 'PEN';
    const isNotStarted = status.short === 'NS' || status.short === 'TBD';
    
    let scoreDisplay = '-';
    let timeDisplay = '';
    
    if (isLive) {
        scoreDisplay = `${goals.home || 0} - ${goals.away || 0}`;
        timeDisplay = status.elapsed ? `${status.elapsed}'` : 'LIVE';
    } else if (isFinished) {
        scoreDisplay = `${goals.home || 0} - ${goals.away || 0}`;
        timeDisplay = 'FT';
    } else if (isNotStarted) {
        const matchDate = new Date(fixtureData.date);
        const hours = matchDate.getHours().toString().padStart(2, '0');
        const minutes = matchDate.getMinutes().toString().padStart(2, '0');
        timeDisplay = `${hours}:${minutes}`;
    } else {
        timeDisplay = status.short || '';
    }
    
    return {
        id: fixtureData.id,
        league_en: league.name || 'Unknown League',
        league_fa: league.name || 'لیگ نامشخص', // می‌تواند از translation استفاده کند
        home_en: teams.home?.name || 'Home',
        home_fa: teams.home?.name || 'مهمان',
        away_en: teams.away?.name || 'Away',
        away_fa: teams.away?.name || 'مهمان',
        home_logo: teams.home?.logo || '',
        away_logo: teams.away?.logo || '',
        score: scoreDisplay,
        time: timeDisplay,
        status: isLive ? 'LIVE' : (isNotStarted ? 'NOT STARTED' : 'FINISHED'),
        league_logo: league.logo || ''
    };
}

/**
 * تبدیل fixture API به فرمت news card
 * برای نمایش مسابقات مهم به عنوان اخبار
 */
function formatFixtureForNewsCard(fixture) {
    const fixtureData = fixture.fixture || {};
    const teams = fixture.teams || {};
    const goals = fixture.goals || {};
    const league = fixture.league || {};
    const status = fixtureData.status || {};
    
    const homeTeam = teams.home?.name || 'Home';
    const awayTeam = teams.away?.name || 'Away';
    const leagueName = league.name || 'Unknown League';
    
    // برای اخبار، مسابقات مهم را انتخاب می‌کنیم:
    // - مسابقات زنده
    // - مسابقات تمام شده با گل‌های زیاد
    // - مسابقات لیگ‌های مهم
    
    const isImportant = 
        status.short === 'LIVE' || 
        status.short === 'FT' ||
        (league.id && [39, 140, 78, 135, 61].includes(league.id)); // Premier League, La Liga, Bundesliga, Serie A, Ligue 1
    
    if (!isImportant) {
        return null;
    }
    
    let title_en = '';
    let title_fa = '';
    let category = leagueName;
    
    if (status.short === 'LIVE' || status.short === 'FT') {
        const score = `${goals.home || 0} - ${goals.away || 0}`;
        title_en = `${homeTeam} ${score} ${awayTeam}`;
        title_fa = `${homeTeam} ${score} ${awayTeam}`;
        
        if (status.short === 'LIVE') {
            category = `LIVE - ${leagueName}`;
        } else {
            category = `Result - ${leagueName}`;
        }
    } else {
        title_en = `${homeTeam} vs ${awayTeam}`;
        title_fa = `${homeTeam} مقابل ${awayTeam}`;
    }
    
    // استفاده از لوگوی لیگ یا تیم به عنوان تصویر
    const imageUrl = league.logo || teams.home?.logo || 'https://picsum.photos/400/200';
    
    return {
        category: category,
        title_en: title_en,
        title_fa: title_fa,
        image: imageUrl,
        link: `#match-${fixtureData.id}`,
        fixture_id: fixtureData.id,
        date: fixtureData.date
    };
}

/**
 * دریافت و فرمت کردن مسابقات امروز برای نمایش
 */
async function getTodayMatches() {
    const fixtures = await getFixturesByDate();
    return fixtures.map(formatFixtureForMatchCard);
}

/**
 * دریافت و فرمت کردن اخبار (مسابقات مهم) برای نمایش
 */
async function getNewsItems(limit = 6) {
    // دریافت مسابقات زنده و امروز
    const [liveFixtures, todayFixtures] = await Promise.all([
        getLiveMatches(),
        getFixturesByDate()
    ]);
    
    // ترکیب و مرتب‌سازی
    const allFixtures = [...liveFixtures, ...todayFixtures];
    
    // تبدیل به news items و فیلتر کردن موارد مهم
    const newsItems = allFixtures
        .map(formatFixtureForNewsCard)
        .filter(item => item !== null)
        .sort((a, b) => {
            // اولویت: مسابقات زنده، سپس مسابقات تمام شده، سپس بقیه
            if (a.category.includes('LIVE')) return -1;
            if (b.category.includes('LIVE')) return 1;
            if (a.category.includes('Result')) return -1;
            if (b.category.includes('Result')) return 1;
            return 0;
        })
        .slice(0, limit);
    
    return newsItems;
}

// Export برای استفاده در سایر فایل‌ها
window.FootballAPI = {
    getLiveMatches,
    getFixturesByDate,
    getTodayMatches,
    getNewsItems,
    getLeagues,
    formatFixtureForMatchCard,
    formatFixtureForNewsCard,
    API_BASE_URL
};
