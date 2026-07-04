/**
 * Shared header, footer, download links from SITE_CONFIG
 */
(function () {
    const NAV_ITEMS = [
        { href: 'index.html', key: 'navHome', pages: ['index', 'home'] },
        { href: 'matches.html', key: 'navMatches', pages: ['matches'] },
        { href: 'news.html', key: 'navNews', pages: ['news'] },
        { href: 'about.html', key: 'navAbout', pages: ['about'] },
        { href: 'contact.html', key: 'navContact', pages: ['contact'] },
    ];

    function cfg() {
        return window.SITE_CONFIG || {};
    }

    function getPageId() {
        return document.body.getAttribute('data-page') || 'home';
    }

    function assetUrl(path) {
        const c = cfg();
        const ver = c.assetVersion || '2';
        let url = (path || '').trim();
        if (!url) return '';
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
            url = '/' + url;
        }
        const join = url.includes('?') ? '&' : '?';
        return `${url}${join}v=${ver}`;
    }

    function logoUrl() {
        const c = cfg();
        return assetUrl(c.logoUrl || c.faviconUrl || 'icons/logo.png');
    }

    function renderHeader() {
        const page = getPageId();
        const c = cfg();
        const appUrl = c.appUrl || c.pwaUrl || 'index.html';

        const navLinks = NAV_ITEMS.map((item) => {
            const active = item.pages.includes(page) ? ' active' : '';
            const href = window.SiteI18n?.withContextUrl
                ? SiteI18n.withContextUrl(item.href)
                : item.href;
            return `<a href="${href}" class="nav-link${active}" data-i18n="${item.key}"></a>`;
        }).join('');

        return `
        <header class="site-header">
            <a href="index.html" class="logo" aria-label="Footballive90">
                <img src="${logoUrl()}" alt="Footballive90" class="logo-img" width="44" height="44">
                <span class="logo-text">Football<span>live90</span></span>
            </a>
            <button class="hamburger" id="menu-toggle" aria-label="Menu" type="button">☰</button>
            <nav class="nav-links" id="main-nav">
                ${navLinks}
                <a href="${appUrl}" class="nav-link nav-cta" data-i18n="navApp" target="_blank" rel="noopener"></a>
            </nav>
            <button class="lang-switch" id="lang-switch-btn" type="button">FA</button>
        </header>`;
    }

    function renderFooter() {
        const year = cfg().copyrightYear || new Date().getFullYear();
        const socials = [];
        const c = cfg();
        if (c.instagramUrl) socials.push(`<a href="${c.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram">IG</a>`);
        if (c.telegramUrl) socials.push(`<a href="${c.telegramUrl}" target="_blank" rel="noopener" aria-label="Telegram">TG</a>`);
        if (c.twitterUrl) socials.push(`<a href="${c.twitterUrl}" target="_blank" rel="noopener" aria-label="X">X</a>`);

        return `
        <footer class="site-footer">
            <div class="footer-inner">
                <div class="footer-brand">
                    <div class="footer-logo-row">
                        <img src="${logoUrl()}" alt="Footballive90" class="logo-img logo-img-sm" width="36" height="36">
                        <span class="logo-text">Football<span>live90</span></span>
                    </div>
                    <p>© ${year} Footballive90. <span data-i18n="footerRights"></span></p>
                </div>
                <div class="footer-links">
                    <a href="privacy.html" data-i18n="footerPrivacy"></a>
                    <a href="contact.html" data-i18n="footerContact"></a>
                    <a href="install.html" data-i18n="footerInstall"></a>
                    <a href="faq.html" data-i18n="footerFaq"></a>
                </div>
                ${socials.length ? `<div class="footer-social">${socials.join('')}</div>` : ''}
            </div>
        </footer>`;
    }

    function applyDownloadLinks() {
        const c = cfg();
        const map = [
            { sel: '[data-link="android"]', url: c.androidUrl },
            { sel: '[data-link="ios"]', url: c.iosUrl },
            { sel: '[data-link="pwa"]', url: c.pwaUrl || 'install.html' },
        ];
        map.forEach(({ sel, url }) => {
            document.querySelectorAll(sel).forEach((el) => {
                if (!url) {
                    el.style.display = 'none';
                    return;
                }
                el.href = url;
                if (sel.includes('android') || sel.includes('ios')) {
                    el.target = '_blank';
                    el.rel = 'noopener';
                }
            });
        });
    }

    function applyFavicon() {
        const url = logoUrl();
        if (!url) return;
        let link = document.querySelector('link[rel="icon"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
        let apple = document.querySelector('link[rel="apple-touch-icon"]');
        if (!apple) {
            apple = document.createElement('link');
            apple.rel = 'apple-touch-icon';
            document.head.appendChild(apple);
        }
        apple.href = url;
    }

    function initMenu() {
        const toggle = document.getElementById('menu-toggle');
        const nav = document.getElementById('main-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => nav.classList.toggle('active'));
        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => nav.classList.remove('active'));
        });
    }

    function initBackToTop() {
        if (document.getElementById('back-to-top-btn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'back-to-top-btn';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '↑';
        document.body.appendChild(btn);

        const threshold = 400;
        let ticking = false;

        function updateLabel() {
            const t = window.SiteI18n?.t?.('backToTop');
            const label = t || (window.SiteI18n?.lang === 'fa' ? 'برگشت به بالا' : 'Back to top');
            btn.setAttribute('aria-label', label);
            btn.title = label;
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                btn.classList.toggle('visible', window.scrollY > threshold);
                ticking = false;
            });
        }

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('langchange', updateLabel);
        updateLabel();
        onScroll();
    }

    function mount() {
        const headerEl = document.getElementById('site-header');
        const footerEl = document.getElementById('site-footer');
        if (headerEl) headerEl.innerHTML = renderHeader();
        if (footerEl) footerEl.innerHTML = renderFooter();
        applyFavicon();
        applyDownloadLinks();
        initMenu();
        if (window.SiteI18n) SiteI18n.applyLangToDOM();

        const langBtn = document.getElementById('lang-switch-btn');
        if (langBtn && !langBtn.dataset.bound) {
            langBtn.dataset.bound = '1';
            langBtn.addEventListener('click', () => SiteI18n.toggleLanguage());
        }
        initBackToTop();
    }

    document.addEventListener('DOMContentLoaded', mount);
    window.SiteLayout = { mount, applyDownloadLinks, cfg };
})();
