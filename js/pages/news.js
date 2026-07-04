(function () {
    const pageT = {
        en: { title: 'Latest Updates', articleTitle: 'News' },
        fa: { title: 'آخرین به‌روزرسانی‌ها', articleTitle: 'خبر' },
    };

    let NEWS_DATA = [];

    function pt(key) {
        return pageT[SiteI18n.lang][key] || pageT.en[key];
    }

    function getArticleIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('id');
        const id = parseInt(raw, 10);
        return Number.isFinite(id) && id > 0 ? id : null;
    }

    function getAppReturnUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') !== 'app') return null;
        const returnUrl = params.get('return');
        if (!returnUrl) return null;
        try {
            const host = new URL(returnUrl).hostname.replace(/^www\./, '');
            const ok = ['footballive90.com', 'footballive90.ir', 'football-live.app', 'localhost', '127.0.0.1'].includes(host)
                || host.endsWith('.footballive90.com') || host.endsWith('.footballive90.ir');
            return ok ? returnUrl : null;
        } catch {
            return null;
        }
    }

    function getBackLink() {
        const appReturn = getAppReturnUrl();
        if (appReturn) {
            return {
                href: appReturn,
                label: SiteI18n.lang === 'fa' ? 'بازگشت به اپلیکیشن' : 'Back to app',
            };
        }
        return {
            href: window.SiteI18n?.withContextUrl ? SiteI18n.withContextUrl('news.html') : 'news.html',
            label: SiteI18n.t('backToNews'),
        };
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function applyPageText() {
        const title = document.getElementById('page-title');
        if (title && !getArticleIdFromUrl()) title.textContent = pt('title');
        renderNews();
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

    function newsExcerpt(item, maxLen = 140) {
        const lang = SiteI18n.lang;
        const text = (window.FootballAPI && FootballAPI.pickNewsSummary)
            ? FootballAPI.pickNewsSummary(item, lang)
            : ((lang === 'fa'
                ? (item.summary_fa || item.summary_en || item.summary)
                : (item.summary_en || item.summary_fa || item.summary)) || '');
        const clean = String(text).replace(/\s+/g, ' ').trim();
        if (!clean) return '';
        if (clean.length <= maxLen) return clean;
        return `${clean.slice(0, maxLen)}…`;
    }

    function formatArticleBody(item) {
        const lang = SiteI18n.lang;
        const raw = window.FootballAPI && FootballAPI.pickNewsSummary
            ? FootballAPI.pickNewsSummary(item, lang)
            : (lang === 'fa'
                ? (item.summary_fa || item.summary_en || item.summary)
                : (item.summary_en || item.summary_fa || item.summary));
        const text = String(raw || '').trim();
        if (!text) return '';
        const parts = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length <= 1) return `<p>${escapeHtml(text)}</p>`;
        return parts.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
    }

    function renderNewsCard(item) {
        const lang = SiteI18n.lang;
        const title = window.FootballAPI && FootballAPI.pickNewsTitle
            ? FootballAPI.pickNewsTitle(item, lang)
            : (lang === 'fa' ? (item.title_fa || item.title_en) : (item.title_en || item.title_fa));
        const cat = newsCategory(item);
        const excerpt = newsExcerpt(item);
        const imgClass = item.isLogo ? 'news-img logo-fit' : 'news-img';
        const href = window.FootballAPI ? FootballAPI.buildNewsUrl(item) : (item.link || 'news.html');
        const target = item.is_external ? ' target="_blank" rel="noopener noreferrer"' : '';
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
                <span class="news-read">${SiteI18n.t('readMore')} →</span>
            </div>
        </a>`;
    }

    function renderNews() {
        const container = document.getElementById('news-full-grid');
        if (!container || getArticleIdFromUrl()) return;
        if (!NEWS_DATA.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noNews')}</div>`;
            return;
        }
        container.innerHTML = NEWS_DATA.map(renderNewsCard).join('');
    }

    function renderArticleView(item) {
        const listWrap = document.getElementById('news-list-wrap');
        const articleView = document.getElementById('news-article-view');
        const pageTitle = document.getElementById('page-title');
        if (!articleView) return;

        if (listWrap) listWrap.hidden = true;
        articleView.hidden = false;

        const lang = SiteI18n.lang;
        const title = escapeHtml(
            window.FootballAPI && FootballAPI.pickNewsTitle
                ? FootballAPI.pickNewsTitle(item, lang)
                : (lang === 'fa' ? item.title_fa : item.title_en)
        );
        const bodyHtml = formatArticleBody(item);
        const cat = escapeHtml(newsCategory(item));
        const sourceUrl = item.external_link || '';
        const img = (window.NewsFallback && window.NewsFallback.resolveNewsImage(item)) || item.image || '';
        const seed = item.id || item.external_link || item.title_en || item.title_fa || '';

        if (pageTitle) pageTitle.textContent = title;
        document.title = `${title} - Footballive90`;

        const back = getBackLink();
        articleView.innerHTML = `
            <a href="${back.href}" class="news-back-link">← ${escapeHtml(back.label)}</a>
            <article class="news-article">
                <span class="news-cat">${cat || ''}</span>
                <h1 class="news-article-title">${title}</h1>
                <div class="news-article-img-wrap">
                    <img src="${img}" alt="${title}" class="news-article-img" data-fallback-seed="${seed}" onerror="NewsFallback.onImgError(this, this.dataset.fallbackSeed)">
                </div>
                <div class="news-article-body">${bodyHtml || `<p class="news-no-summary">${SiteI18n.lang === 'fa' ? 'خلاصه کامل در منبع اصلی موجود است.' : 'Full summary is on the original source.'}</p>`}</div>
                ${sourceUrl ? `
                <footer class="news-article-footer">
                    <a href="${sourceUrl}" class="btn btn-outline news-source-link" target="_blank" rel="noopener noreferrer">
                        ${SiteI18n.t('readOriginal')} →
                    </a>
                </footer>` : ''}
            </article>`;
    }

    function showArticleNotFound() {
        const listWrap = document.getElementById('news-list-wrap');
        const articleView = document.getElementById('news-article-view');
        if (listWrap) listWrap.hidden = true;
        if (!articleView) return;
        articleView.hidden = false;
        const back = getBackLink();
        articleView.innerHTML = `
            <a href="${back.href}" class="news-back-link">← ${escapeHtml(back.label)}</a>
            <div class="empty-box">${SiteI18n.t('noNews')}</div>`;
    }

    async function loadNews() {
        const articleId = getArticleIdFromUrl();
        if (articleId) {
            const articleView = document.getElementById('news-article-view');
            if (articleView) {
                articleView.hidden = false;
                articleView.innerHTML = `<div class="loading-box">${SiteI18n.t('loading')}</div>`;
            }
            try {
                if (window.FootballAPI) {
                    const item = await FootballAPI.getNewsArticle(articleId);
                    if (item) {
                        renderArticleView(item);
                        return;
                    }
                }
            } catch (e) {
                console.error(e);
            }
            showArticleNotFound();
            return;
        }

        const container = document.getElementById('news-full-grid');
        if (!container) return;
        container.innerHTML = `<div class="loading-box">${SiteI18n.t('loading')}</div>`;

        try {
            if (window.FootballAPI) {
                const items = await FootballAPI.getNewsItems(15);
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

    document.addEventListener('DOMContentLoaded', () => {
        applyPageText();
        loadNews();
    });

    window.addEventListener('langchange', () => {
        applyPageText();
        loadNews();
    });
})();
