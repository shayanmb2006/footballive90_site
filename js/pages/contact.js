(function () {
    const pageT = {
        en: {
            title: 'Get in Touch',
            desc: 'Have questions? Send us a message.',
            labelName: 'Full Name',
            labelEmail: 'Email',
            labelMsg: 'Message',
            btnSend: 'Send Message',
            sending: 'Sending...',
            success: 'Your message has been sent!',
            received: 'Message received. We will contact you soon.',
            error: 'Could not send. Please try again or email us directly.',
        },
        fa: {
            title: 'تماس با ما',
            desc: 'سوالی دارید؟ برای ما پیام بفرستید.',
            labelName: 'نام کامل',
            labelEmail: 'ایمیل',
            labelMsg: 'پیام شما',
            btnSend: 'ارسال پیام',
            sending: 'در حال ارسال...',
            success: 'پیام شما با موفقیت ارسال شد!',
            received: 'پیام دریافت شد. به زودی با شما تماس می‌گیریم.',
            error: 'ارسال نشد. دوباره تلاش کنید یا مستقیم ایمیل بزنید.',
        },
    };

    function pt(key) {
        return pageT[SiteI18n.lang][key] || pageT.en[key];
    }

    function applyPageText() {
        document.getElementById('page-title').textContent = pt('title');
        document.getElementById('page-desc').textContent = pt('desc');
        document.getElementById('label-name').textContent = pt('labelName');
        document.getElementById('label-email').textContent = pt('labelEmail');
        document.getElementById('label-msg').textContent = pt('labelMsg');
        document.getElementById('submit-btn').textContent = pt('btnSend');
        renderInfo();
    }

    function renderInfo() {
        const c = window.SITE_CONFIG || {};
        const items = [];
        if (c.contactEmail) {
            items.push(`<div class="info-item"><div class="info-icon">✉️</div><a href="mailto:${c.contactEmail}">${c.contactEmail}</a></div>`);
        }
        if (c.contactPhone) {
            items.push(`<div class="info-item"><div class="info-icon">📱</div><span>${c.contactPhone}</span></div>`);
        }
        if (c.telegramUrl) {
            items.push(`<div class="info-item"><div class="info-icon">✈️</div><a href="${c.telegramUrl}" target="_blank" rel="noopener">Telegram</a></div>`);
        }
        if (c.instagramUrl) {
            items.push(`<div class="info-item"><div class="info-icon">📷</div><a href="${c.instagramUrl}" target="_blank" rel="noopener">Instagram</a></div>`);
        }
        document.getElementById('info-list').innerHTML = items.join('') || `<p class="empty-box">${SiteI18n.t('noData')}</p>`;
    }

    function showMessage(text, type) {
        const el = document.getElementById('form-message');
        el.textContent = text;
        el.style.display = 'block';
        el.style.background = type === 'success' ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,102,0.15)';
        el.style.color = type === 'success' ? 'var(--primary)' : 'var(--accent-red)';
        el.style.border = `1px solid ${type === 'success' ? 'var(--primary)' : 'var(--accent-red)'}`;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('submit-btn');
        const form = document.getElementById('contact-form');
        btn.disabled = true;
        btn.textContent = pt('sending');
        document.getElementById('form-message').style.display = 'none';

        const payload = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value,
        };

        try {
            const base = window.FootballAPI ? FootballAPI.API_BASE_URL : (SITE_CONFIG.apiBaseUrl || '/api');
            const res = await fetch(`${base}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showMessage(pt('success'), 'success');
                form.reset();
            } else {
                throw new Error('fail');
            }
        } catch {
            showMessage(pt('error'), 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = pt('btnSend');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyPageText();
        document.getElementById('contact-form').addEventListener('submit', handleSubmit);
    });

    window.addEventListener('langchange', applyPageText);
})();
