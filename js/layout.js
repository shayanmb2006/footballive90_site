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

    function renderHeader() {
        const page = getPageId();
        const c = cfg();
        const appUrl = c.appUrl || c.pwaUrl || 'index.html';

        const navLinks = NAV_ITEMS.map((item) => {
            const active = item.pages.includes(page) ? ' active' : '';
            return `<a href="${item.href}" class="nav-link${active}" data-i18n="${item.key}"></a>`;
        }).join('');

        return `
        <header class="site-header">
            <a href="index.html" class="logo" aria-label="Footballive90">
                <span class="logo-ball" aria-hidden="true">⚽</span>
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
                    <span class="logo-text">Football<span>live90</span></span>
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
        const url = cfg().faviconUrl;
        if (!url) return;
        let link = document.querySelector('link[rel="icon"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
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
    }

    document.addEventListener('DOMContentLoaded', mount);
    window.SiteLayout = { mount, applyDownloadLinks, cfg };
})();
