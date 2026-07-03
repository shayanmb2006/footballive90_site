(function () {
    const PRIVACY = {
        en: {
            title: 'Privacy Policy',
            intro: 'At Footballive90, we respect your privacy. This policy explains how we collect and use your information.',
            sections: [
                { head: 'Data Collection', text: 'We collect minimal data to improve your experience: device language, app version, and general region for league preferences.' },
                { head: 'Usage of Data', text: 'Your data is used solely to provide live scores and notifications. We do not sell your personal information.' },
                { head: 'Cookies & Storage', text: 'We use local storage to remember your language preference (EN/FA) and session state.' },
                { head: 'Contact', text: 'For privacy questions, email us at the address on the Contact page.' },
            ],
        },
        fa: {
            title: 'سیاست حریم خصوصی',
            intro: 'در فوتبال لایو ۹۰، حریم خصوصی شما برای ما مهم است. این سیاست نحوه جمع‌آوری و استفاده از اطلاعات را توضیح می‌دهد.',
            sections: [
                { head: 'جمع‌آوری داده', text: 'حداقل اطلاعات برای بهبود تجربه جمع‌آوری می‌شود: زبان دستگاه، نسخه اپ و منطقه عمومی.' },
                { head: 'استفاده از داده', text: 'اطلاعات فقط برای ارائه نتایج زنده و اعلان‌ها استفاده می‌شود. اطلاعات شخصی فروخته نمی‌شود.' },
                { head: 'کوکی و ذخیره‌سازی', text: 'از localStorage برای یادآوری زبان (EN/FA) و وضعیت نشست استفاده می‌کنیم.' },
                { head: 'تماس', text: 'برای سوالات حریم خصوصی، از ایمیل صفحه تماس استفاده کنید.' },
            ],
        },
    };

    function render() {
        const t = PRIVACY[SiteI18n.lang];
        document.getElementById('page-title').textContent = t.title;
        document.getElementById('intro-text').textContent = t.intro;
        document.getElementById('sections-list').innerHTML = t.sections.map((s) => `
            <h2>${s.head}</h2><p>${s.text}</p>`).join('');
    }

    document.addEventListener('DOMContentLoaded', render);
    window.addEventListener('langchange', render);
})();
