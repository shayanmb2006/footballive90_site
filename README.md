# Footballive90 Landing Site

لندینگ پیج فوتبالی با طراحی Stadium Night، دو زبانه EN/FA، و اتصال به API بک‌اند.

## پیکربندی لینک‌ها (`.env`)

1. فایل `.env.example` را کپی کنید:

```bash
cp .env.example .env
```

2. مقادیر را ویرایش کنید (لینک‌های خالی = دکمه مخفی می‌شود):

| متغیر | توضیح |
|--------|--------|
| `SITE_API_BASE_URL` | آدرس API بک‌اند |
| `SITE_ANDROID_URL` | لینک Google Play یا APK |
| `SITE_IOS_URL` | لینک App Store |
| `SITE_PWA_URL` | لینک نصب PWA / وب‌اپ |
| `SITE_APP_URL` | لینک ورود به اپ (دکمه «ورود به اپ») |
| `SITE_CONTACT_EMAIL` | ایمیل پشتیبانی |
| `SITE_CONTACT_PHONE` | تلفن |
| `SITE_INSTAGRAM_URL` | اینستاگرام |
| `SITE_TELEGRAM_URL` | تلگرام |
| `SITE_TWITTER_URL` | توییتر/X |
| `SITE_FAVICON_URL` | آیکون سایت |
| `SITE_COPYRIGHT_YEAR` | سال کپی‌رایت |

3. تولید فایل config برای فرانت:

```bash
node scripts/generate-config.js
```

خروجی: `js/site-config.js` — همه صفحات از این فایل لینک‌ها و API را می‌خوانند.

### دیپلوی (Coolify / Docker)

در مرحله build یا start، env را ست کنید و اسکریپت را اجرا کنید:

```bash
node scripts/generate-config.js
```

یا envها را مستقیم به `js/site-config.js` map کنید.

## ساختار

```
footballive90_site/
├── .env.example
├── css/main.css           # استایل مشترک (3D + glass)
├── js/
│   ├── site-config.js     # ← از .env تولید می‌شود
│   ├── i18n.js            # ترجمه + ذخیره زبان
│   ├── layout.js          # هدر/فوتر مشترک
│   ├── api-client.js      # API فوتبال
│   └── pages/             # منطق هر صفحه
├── scripts/generate-config.js
└── *.html
```

## صفحات

- `index.html` — Hero زنده + تیکر + ویژگی‌ها + اخبار
- `matches.html` — بازی‌های امروز با لوگو + فیلتر Live
- `news.html` — نتایج و به‌روزرسانی‌ها
- `about.html` — درباره ما
- `contact.html` — فرم تماس
- `install.html` — راهنمای نصب
- `faq.html` — سوالات متداول
- `privacy.html` — حریم خصوصی

## توسعه محلی

```bash
# مثال با Python
cd footballive90_site
python -m http.server 8080
```

API در localhost: `SITE_API_BASE_URL=http://localhost:5000/api`

## API بک‌اند

| Endpoint | کاربرد |
|----------|--------|
| `GET /api/football/live?featured=true&lang=fa` | لایو — لیگ‌های مطرح + ایران در FA |
| `GET /api/football/fixtures/featured?lang=fa` | بازی‌های امروز (featured) |
| `GET /api/site/news?lang=fa&limit=6` | اخبار RSS + ترجمه AI |
| `POST /api/site/contact` | فرم تماس (نیاز به SMTP) |

### env بک‌اند (اخبار و تماس)

```env
SITE_NEWS_RSS_EN=https://feeds.bbci.co.uk/sport/football/rss.xml
SITE_NEWS_RSS_FA=https://www.varzesh3.com/rss/all
SMTP_HOST=smtp.yourprovider.com
SMTP_USERNAME=...
SMTP_PASSWORD=...
SITE_CONTACT_INBOX=support@footballive90.com
```

اگر RSS تنظیم نشود، اخبار از نتایج بازی‌های featured پر می‌شود.

