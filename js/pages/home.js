(function () {
    const pageT = {
        en: {
            heroTitle: 'Live Scores & Football News',
            heroDesc: 'The fastest app for live scores, match details, and news. Available on Android, iOS, and web.',
            btnAndroid: 'Download Android',
            btnIOS: 'Download iOS',
            btnPWA: 'Install App',
            sectionNews: 'Latest Updates',
            readAll: 'Read All News',
            feat1Title: 'Live Scores',
            feat1Desc: 'Real-time results from 850+ leagues worldwide.',
            feat2Title: 'Match Details',
            feat2Desc: 'Lineups, stats, and head-to-head data.',
            feat3Title: 'Notifications',
            feat3Desc: 'Never miss a goal with instant alerts.',
            feat4Title: 'Bilingual',
            feat4Desc: 'Full support for English and Persian.',
            featuresTitle: 'Why Footballive90?',
            heroBadge: 'LIVE NOW',
        },
        fa: {
            heroTitle: 'نتایج زنده و اخبار فوتبال',
            heroDesc: 'سریع‌ترین اپلیکیشن نتیجه زنده، جزئیات بازی و اخبار. برای اندروید، iOS و وب.',
            btnAndroid: 'دانلود اندروید',
            btnIOS: 'دانلود آیفون',
            btnPWA: 'نصب اپلیکیشن',
            sectionNews: 'آخرین به‌روزرسانی‌ها',
            readAll: 'مشاهده همه',
            feat1Title: 'نتایج زنده',
            feat1Desc: 'نتایج لحظه‌ای از بیش از ۸۵۰ لیگ در سراسر جهان.',
            feat2Title: 'جزئیات بازی',
            feat2Desc: 'ترکیب، آمار و سابقه بازی‌های قبلی.',
            feat3Title: 'اعلان‌ها',
            feat3Desc: 'هیچ گلی را از دست ندهید با هشدار فوری.',
            feat4Title: 'دو زبانه',
            feat4Desc: 'پشتیبانی کامل از فارسی و انگلیسی.',
            featuresTitle: 'چرا فوتبال لایو ۹۰؟',
            heroBadge: 'پخش زنده',
        },
    };

    let NEWS_DATA = [];

    function pt(key) {
        const lang = SiteI18n.lang;
        return pageT[lang][key] || pageT.en[key];
    }

    function applyPageText() {
        document.querySelectorAll('[data-page-i18n]').forEach((el) => {
            const key = el.getAttribute('data-page-i18n');
            if (pageT[SiteI18n.lang][key]) el.textContent = pageT[SiteI18n.lang][key];
        });
        renderNews();
        if (window.SiteLayout) SiteLayout.applyDownloadLinks();
    }

    function newsCategory(item) {
        const league = item.leagueName || '';
        if (item.categoryKey === 'LIVE') return `${SiteI18n.t('live')} — ${league}`;
        if (item.categoryKey === 'FT') return `${SiteI18n.t('result')} — ${league}`;
        return league;
    }

    function renderNewsCard(item) {
        const lang = SiteI18n.lang;
        const title = lang === 'fa' ? item.title_fa : item.title_en;
        const cat = newsCategory(item);
        const imgClass = item.isLogo ? 'news-img logo-fit' : 'news-img';
        const readMore = SiteI18n.t('readMore');
        return `
        <a href="${item.link || 'news.html'}" class="news-card">
            <div class="news-img-wrap">
                <img src="${item.image}" alt="${title}" class="${imgClass}" onerror="this.src='https://picsum.photos/seed/fb/400/200'">
            </div>
            <div class="news-content">
                <span class="news-cat">${cat || ''}</span>
                <h3 class="news-headline">${title}</h3>
                <span class="news-read">${readMore} →</span>
            </div>
        </a>`;
    }

    function renderNews() {
        const container = document.getElementById('dynamic-news-grid');
        if (!container) return;
        if (!NEWS_DATA.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noData')}</div>`;
            return;
        }
        container.innerHTML = NEWS_DATA.map(renderNewsCard).join('');
    }

    async function loadHero() {
        if (!window.FootballAPI) return;
        const match = await FootballAPI.getHeroMatch();
        const el = document.getElementById('hero-live-score');
        if (!match || !el) return;

        const lang = SiteI18n.lang;
        const home = lang === 'fa' ? match.home_fa : match.home_en;
        const away = lang === 'fa' ? match.away_fa : match.away_en;
        const isLive = match.status === 'LIVE';

        el.innerHTML = `
            ${isLive ? `<span class="live-label">● ${SiteI18n.t('live')}</span>` : ''}
            <div class="score-big">${match.score}</div>
            <div class="match-teams-text">${home} vs ${away}</div>`;

        const badge = document.getElementById('hero-badge');
        if (badge) badge.style.display = isLive ? 'inline-flex' : 'none';
    }

    async function loadTicker() {
        const track = document.getElementById('ticker-track');
        if (!track || !window.FootballAPI) return;

        const matches = await FootballAPI.getTickerMatches(10);
        if (!matches.length) {
            document.querySelector('.live-ticker')?.remove();
            return;
        }

        const lang = SiteI18n.lang;
        const items = matches.map((m) => {
            const home = lang === 'fa' ? m.home_fa : m.home_en;
            const away = lang === 'fa' ? m.away_fa : m.away_en;
            const live = m.status === 'LIVE' ? `<span class="ticker-live">● ${SiteI18n.t('live')}</span>` : '';
            return `<span class="ticker-item">${live} <strong>${home}</strong> ${m.score} <strong>${away}</strong></span>`;
        });

        track.innerHTML = [...items, ...items].join('');
    }

    async function loadNews() {
        const container = document.getElementById('dynamic-news-grid');
        if (!container) return;
        container.innerHTML = `<div class="loading-box">${SiteI18n.t('loading')}</div>`;

        try {
            if (window.FootballAPI) {
                const items = await FootballAPI.getNewsItems(6);
                if (items?.length) {
                    NEWS_DATA = items;
                    renderNews();
                    return;
                }
            }
        } catch (e) {
            console.error(e);
        }
        NEWS_DATA = [];
        renderNews();
    }

    function init() {
        applyPageText();
        loadHero();
        loadTicker();
        loadNews();
    }

    window.addEventListener('langchange', () => {
        applyPageText();
        loadHero();
        loadTicker();
    });

    document.addEventListener('DOMContentLoaded', init);
})();
