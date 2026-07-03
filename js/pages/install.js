(function () {
    const INSTALL = {
        en: {
            title: 'Installation Guide',
            steps: [
                { title: 'Android', desc: 'Download the app from the button on the home page. For APK: Settings → Security → allow unknown sources, then open the file.' },
                { title: 'iPhone / iPad', desc: 'Open this site in Safari. Tap Share (square with arrow) → Add to Home Screen.' },
                { title: 'Desktop / Laptop', desc: 'Use Chrome or Edge. Click the install icon in the address bar to add Footballive90 as an app.' },
                { title: 'Web App (PWA)', desc: 'Visit the main app URL and install directly — no store required.' },
            ],
        },
        fa: {
            title: 'راهنمای نصب',
            steps: [
                { title: 'اندروید', desc: 'از دکمه دانلود در صفحه اصلی استفاده کنید. برای APK: تنظیمات → امنیت → منابع ناشناخته، سپس فایل را باز کنید.' },
                { title: 'آیفون / آیپد', desc: 'سایت را در سافاری باز کنید. Share → Add to Home Screen را انتخاب کنید.' },
                { title: 'کامپیوتر', desc: 'در Chrome یا Edge روی آیکون نصب در نوار آدرس کلیک کنید.' },
                { title: 'وب‌اپ (PWA)', desc: 'به آدرس اصلی اپ بروید و مستقیم نصب کنید — بدون نیاز به استور.' },
            ],
        },
    };

    function render() {
        const t = INSTALL[SiteI18n.lang];
        const c = window.SITE_CONFIG || {};
        document.getElementById('page-title').textContent = t.title;

        let stepsHtml = t.steps.map((step, i) => `
            <div class="step-card">
                <div class="step-num">${i + 1}</div>
                <div class="step-content"><h3>${step.title}</h3><p>${step.desc}</p></div>
            </div>`).join('');

        if (c.pwaUrl || c.appUrl) {
            const url = c.appUrl || c.pwaUrl;
            const label = SiteI18n.lang === 'fa' ? 'باز کردن اپ' : 'Open App';
            stepsHtml += `<div class="text-center mt-2"><a href="${url}" class="btn btn-primary" target="_blank" rel="noopener">${label} →</a></div>`;
        }

        document.getElementById('steps-list').innerHTML = stepsHtml;
    }

    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('langchange', render);
})();
