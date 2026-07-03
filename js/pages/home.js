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
            featLangCta: 'Tap to switch language',
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
            featLangCta: 'برای تغییر زبان بزنید',
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

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function newsCategory(item) {
        const fallback = SiteI18n.lang === 'fa' ? 'اخبار' : 'News';
        if (item && item.categoryKey === 'NEWS') {
            return item.leagueName || item.source || item.source_name || fallback;
        }
        const league = (item && item.leagueName) || '';
        if (item && item.categoryKey === 'LIVE') return `${SiteI18n.t('live')} — ${league}`;
        if (item && item.categoryKey === 'FT') return `${SiteI18n.t('result')} — ${league}`;
        return league || fallback;
    }

    function newsExcerpt(item, maxLen = 120) {
        const lang = SiteI18n.lang;
        const text = (lang === 'fa'
            ? (item.summary_fa || item.summary_en || item.summary)
            : (item.summary_en || item.summary_fa || item.summary)) || '';
        const clean = String(text).replace(/\s+/g, ' ').trim();
        if (!clean) return '';
        if (clean.length <= maxLen) return clean;
        return `${clean.slice(0, maxLen)}…`;
    }

    function renderNewsCard(item) {
        const lang = SiteI18n.lang;
        const title = lang === 'fa' ? item.title_fa : item.title_en;
        const cat = newsCategory(item);
        const excerpt = newsExcerpt(item);
        const imgClass = item.isLogo ? 'news-img logo-fit' : 'news-img';
        const href = window.FootballAPI ? FootballAPI.buildNewsUrl(item) : (item.link || 'news.html');
        const target = item.is_external ? ' target="_blank" rel="noopener noreferrer"' : '';
        const readMore = SiteI18n.t('readMore');
        const img = (window.NewsFallback && window.NewsFallback.resolveNewsImage(item)) || item.image || '';
        const seed = item.id || item.external_link || title;
        return `
        <a href="${href}" class="news-card"${target}>
            <div class="news-img-wrap">
                <img src="${img}" alt="${escapeHtml(title)}" class="${imgClass}" loading="lazy" data-fallback-seed="${escapeHtml(String(seed))}" onerror="NewsFallback.onImgError(this, this.dataset.fallbackSeed)">
            </div>
            <div class="news-content">
                <span class="news-cat">${escapeHtml(cat)}</span>
                <h3 class="news-headline">${escapeHtml(title)}</h3>
                ${excerpt ? `<p class="news-excerpt">${escapeHtml(excerpt)}</p>` : ''}
                <span class="news-read">${readMore} →</span>
            </div>
        </a>`;
    }

    function renderNews() {
        const container = document.getElementById('dynamic-news-grid');
        if (!container) return;
        if (!NEWS_DATA.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noNews')}</div>`;
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
        const home = FootballAPI.pickMatchTeamName(match, 'home', lang);
        const away = FootballAPI.pickMatchTeamName(match, 'away', lang);
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
            const home = FootballAPI.pickMatchTeamName(m, 'home', lang);
            const away = FootballAPI.pickMatchTeamName(m, 'away', lang);
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

    function initFeatureCards() {
        const langBtn = document.getElementById('feature-lang-toggle');
        if (langBtn && window.SiteI18n) {
            langBtn.addEventListener('click', () => SiteI18n.toggleLanguage());
        }
    }

    function init() {
        applyPageText();
        initFeatureCards();
        loadHero();
        loadTicker();
        loadNews();
    }

    window.addEventListener('langchange', () => {
        applyPageText();
        loadHero();
        loadTicker();
        loadNews();
    });

    document.addEventListener('DOMContentLoaded', init);
})();
