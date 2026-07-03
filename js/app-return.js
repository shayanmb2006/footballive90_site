/**
 * Sticky "Back to app" bar when user opens landing from PWA (?from=app&return=...).
 */
(function () {
    const ALLOWED_HOSTS = [
        'footballive90.com',
        'footballive90.ir',
        'football-live.app',
        'localhost',
        '127.0.0.1',
    ];

    function isAllowedReturn(url) {
        try {
            const host = new URL(url).hostname.replace(/^www\./, '');
            if (ALLOWED_HOSTS.includes(host)) return true;
            return host.endsWith('.footballive90.com') || host.endsWith('.footballive90.ir');
        } catch {
            return false;
        }
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function init() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('from') !== 'app') return;

        const returnUrl = params.get('return');
        if (!returnUrl || !isAllowedReturn(returnUrl)) return;

        const lang = window.SiteI18n?.lang || params.get('lang') || 'fa';
        const label = lang === 'fa' ? 'بازگشت به اپلیکیشن' : 'Back to app';

        const bar = document.createElement('div');
        bar.className = 'app-return-bar';
        bar.setAttribute('role', 'navigation');
        bar.innerHTML = `<a href="${escapeHtml(returnUrl)}" class="app-return-btn">← ${escapeHtml(label)}</a>`;
        document.body.prepend(bar);
        document.body.classList.add('has-app-return');
    }

    document.addEventListener('DOMContentLoaded', init);
})();
