(function () {
    const pageT = {
        en: { title: 'Latest Updates' },
        fa: { title: 'آخرین به‌روزرسانی‌ها' },
    };

    let NEWS_DATA = [];

    function applyPageText() {
        const title = document.getElementById('page-title');
        if (title) title.textContent = pageT[SiteI18n.lang].title;
        renderNews();
    }

    function newsCategory(item) {
        if (item.categoryKey === 'NEWS') {
            return item.leagueName || (SiteI18n.lang === 'fa' ? 'اخبار' : 'News');
        }
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
        const href = window.FootballAPI ? FootballAPI.buildNewsUrl(item) : (item.link || 'news.html');
        const target = item.is_external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `
        <a href="${href}" class="news-card"${target}>
            <div class="news-img-wrap">
                <img src="${item.image}" alt="${title}" class="${imgClass}" onerror="this.src='https://picsum.photos/seed/fb/400/200'">
            </div>
            <div class="news-content">
                <span class="news-cat">${cat || ''}</span>
                <h3 class="news-headline">${title}</h3>
                <span class="news-read">${SiteI18n.t('readMore')} →</span>
            </div>
        </a>`;
    }

    function renderNews() {
        const container = document.getElementById('news-full-grid');
        if (!container) return;
        if (!NEWS_DATA.length) {
            container.innerHTML = `<div class="empty-box">${SiteI18n.t('noNews')}</div>`;
            return;
        }
        container.innerHTML = NEWS_DATA.map(renderNewsCard).join('');
    }

    async function loadNews() {
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
