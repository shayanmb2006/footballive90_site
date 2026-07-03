(function () {
    const FAQ = {
        en: {
            title: 'Frequently Asked Questions',
            items: [
                { q: 'How do I install on Android?', a: 'Tap Download Android on the home page. If using APK, allow installation from unknown sources in Settings.' },
                { q: 'How do I install on iPhone?', a: 'Open the site in Safari, tap Share, then Add to Home Screen. See the Install page for details.' },
                { q: 'Is the app free?', a: 'Yes! Core features like live scores are free. Premium removes ads and unlocks extra features.' },
                { q: 'Does it work offline?', a: 'Cached data may be available offline, but live scores require an internet connection.' },
                { q: 'Which leagues are covered?', a: 'We cover 850+ leagues including Premier League, La Liga, Serie A, Bundesliga, and Persian Gulf Pro League.' },
                { q: 'How do I change language?', a: 'Tap the EN/FA button in the header. Your preference is saved automatically.' },
            ],
        },
        fa: {
            title: 'سوالات متداول',
            items: [
                { q: 'چطور روی اندروید نصب کنم؟', a: 'روی دانلود اندروید در صفحه اصلی بزنید. برای APK، نصب از منابع ناشناخته را در تنظیمات فعال کنید.' },
                { q: 'چطور روی آیفون نصب کنم؟', a: 'سایت را در سافاری باز کنید، Share را بزنید و Add to Home Screen را انتخاب کنید.' },
                { q: 'آیا اپ رایگان است؟', a: 'بله! امکانات اصلی مثل نتایج زنده رایگان است. نسخه پریمیوم تبلیغات را حذف می‌کند.' },
                { q: 'آفلاین کار می‌کند؟', a: 'برخی داده‌های کش‌شده آفلاین در دسترس است، اما نتایج زنده به اینترنت نیاز دارد.' },
                { q: 'کدام لیگ‌ها پوشش داده می‌شوند؟', a: 'بیش از ۸۵۰ لیگ از جمله لیگ برتر، لالیگا، سری آ، بوندسلیگا و لیگ برتر ایران.' },
                { q: 'چطور زبان را عوض کنم؟', a: 'دکمه EN/FA در هدر را بزنید. انتخاب شما خودکار ذخیره می‌شود.' },
            ],
        },
    };

    function render() {
        const t = FAQ[SiteI18n.lang];
        document.getElementById('page-title').textContent = t.title;
        document.getElementById('faq-list').innerHTML = t.items.map((item) => `
            <details class="faq-item">
                <summary>${item.q} <span>+</span></summary>
                <div class="faq-answer">${item.a}</div>
            </details>`).join('');
    }

    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('langchange', render);
})();
