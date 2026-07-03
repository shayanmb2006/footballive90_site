/**
 * Shared i18n — language persistence + common strings
 */
(function () {
    const STORAGE_KEY = 'footballive90_lang';

    const translations = {
        en: {
            navHome: 'Home',
            navMatches: 'Matches',
            navNews: 'News',
            navAbout: 'About',
            navContact: 'Contact',
            navInstall: 'Install',
            navFaq: 'FAQ',
            navApp: 'Open App',
            langToggle: 'FA',
            footerPrivacy: 'Privacy',
            footerContact: 'Contact',
            footerInstall: 'Install',
            footerFaq: 'FAQ',
            footerRights: 'All rights reserved.',
            loading: 'Loading...',
            noData: 'No data available',
            noNews: 'No news articles yet. Check back soon.',
            readMore: 'Read More',
            viewMatches: 'View Matches',
            live: 'LIVE',
            result: 'Result',
            upcoming: 'Upcoming',
        },
        fa: {
            navHome: 'خانه',
            navMatches: 'بازی‌ها',
            navNews: 'اخبار',
            navAbout: 'درباره',
            navContact: 'تماس',
            navInstall: 'نصب',
            navFaq: 'سوالات',
            navApp: 'ورود به اپ',
            langToggle: 'EN',
            footerPrivacy: 'حریم خصوصی',
            footerContact: 'تماس',
            footerInstall: 'راهنمای نصب',
            footerFaq: 'سوالات متداول',
            footerRights: 'تمامی حقوق محفوظ است.',
            loading: 'در حال بارگذاری...',
            noData: 'داده‌ای موجود نیست',
            noNews: 'فعلاً خبری منتشر نشده است.',
            readMore: 'بیشتر بخوانید',
            viewMatches: 'مشاهده بازی‌ها',
            live: 'زنده',
            result: 'نتیجه',
            upcoming: 'آینده',
        },
    };

    function detectDefaultLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'fa') return saved;
        if (window.location.hostname.includes('.ir')) return 'fa';
        return 'en';
    }

    let currentLang = detectDefaultLang();

    function t(key) {
        return translations[currentLang][key] || translations.en[key] || key;
    }

    function applyLangToDOM() {
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', currentLang === 'fa');

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });

        const langBtn = document.getElementById('lang-switch-btn');
        if (langBtn) langBtn.textContent = t('langToggle');

        localStorage.setItem(STORAGE_KEY, currentLang);
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
    }

    function setLanguage(lang) {
        if (lang !== 'en' && lang !== 'fa') return;
        currentLang = lang;
        applyLangToDOM();
    }

    function toggleLanguage() {
        setLanguage(currentLang === 'en' ? 'fa' : 'en');
    }

    window.SiteI18n = {
        get lang() { return currentLang; },
        t,
        setLanguage,
        toggleLanguage,
        applyLangToDOM,
        translations,
    };

    document.addEventListener('DOMContentLoaded', applyLangToDOM);
})();
