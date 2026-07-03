(function () {
    const ABOUT = {
        en: {
            title: 'About Footballive90',
            desc: 'Your ultimate companion for live football action, stats, and news.',
            missionTitle: 'Our Mission',
            missionText: 'We built Footballive90 to give fans the fastest, most accurate live scores and match insights — in English and Persian.',
            valuesTitle: 'What We Stand For',
            v1: 'Speed', v1d: 'Real-time data with minimal delay.',
            v2: 'Accuracy', v2d: 'Reliable stats from trusted sources.',
            v3: 'Community', v3d: 'Built for fans, by football lovers.',
            s1: '850+', s1l: 'Leagues',
            s2: '24/7', s2l: 'Live Coverage',
            s3: '2', s3l: 'Languages',
        },
        fa: {
            title: 'درباره فوتبال لایو ۹۰',
            desc: 'همراه نهایی شما برای اکشن فوتبال زنده، آمار و اخبار.',
            missionTitle: 'ماموریت ما',
            missionText: 'فوتبال لایو ۹۰ را ساختیم تا هواداران سریع‌ترین نتایج زنده و جزئیات بازی را — به فارسی و انگلیسی — دریافت کنند.',
            valuesTitle: 'ارزش‌های ما',
            v1: 'سرعت', v1d: 'داده لحظه‌ای با کمترین تأخیر.',
            v2: 'دقت', v2d: 'آمار قابل اعتماد از منابع معتبر.',
            v3: 'جامعه', v3d: 'ساخته شده برای هواداران فوتبال.',
            s1: '۸۵۰+', s1l: 'لیگ',
            s2: '۲۴/۷', s2l: 'پوشش زنده',
            s3: '۲', s3l: 'زبان',
        },
    };

    function render() {
        const t = ABOUT[SiteI18n.lang];
        document.getElementById('about-title').textContent = t.title;
        document.getElementById('about-desc').textContent = t.desc;
        document.getElementById('mission-title').textContent = t.missionTitle;
        document.getElementById('mission-text').textContent = t.missionText;
        document.getElementById('values-title').textContent = t.valuesTitle;

        document.getElementById('stats-grid').innerHTML = `
            <div class="stat-box"><span class="stat-number">${t.s1}</span><span class="stat-label">${t.s1l}</span></div>
            <div class="stat-box"><span class="stat-number">${t.s2}</span><span class="stat-label">${t.s2l}</span></div>
            <div class="stat-box"><span class="stat-number">${t.s3}</span><span class="stat-label">${t.s3l}</span></div>`;

        document.getElementById('values-grid').innerHTML = `
            <div class="value-card"><span>⚡</span><h3>${t.v1}</h3><p>${t.v1d}</p></div>
            <div class="value-card"><span>🎯</span><h3>${t.v2}</h3><p>${t.v2d}</p></div>
            <div class="value-card"><span>❤️</span><h3>${t.v3}</h3><p>${t.v3d}</p></div>`;
    }

    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('langchange', render);
})();
