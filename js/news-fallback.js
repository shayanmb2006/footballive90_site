(function () {
    const FALLBACK_FILES = Array.from({ length: 10 }, (_, i) =>
        `/assets/news-fallback/fb-${String(i + 1).padStart(2, '0')}.svg`
    );

    function seedIndex(seed, count) {
        const n = count || FALLBACK_FILES.length;
        if (n <= 0) return 0;
        let h = 0;
        const s = String(seed || 'news');
        for (let i = 0; i < s.length; i += 1) {
            h = ((h * 31) + s.charCodeAt(i)) >>> 0;
        }
        return h % n;
    }

    function pickFallbackPath(seed) {
        return FALLBACK_FILES[seedIndex(seed, FALLBACK_FILES.length)];
    }

    function pickFallbackUrl(seed, base) {
        const root = (base || window.location.origin || '').replace(/\/$/, '');
        return `${root}${pickFallbackPath(seed)}`;
    }

    function resolveNewsImage(item, base) {
        const img = (item && (item.image || item.image_url)) || '';
        if (img && String(img).trim()) return String(img).trim();
        const seed = (item && (item.id || item.external_url || item.external_link || item.title_en || item.title)) || 'news';
        return pickFallbackUrl(seed, base);
    }

    function onImgError(imgEl, seed) {
        if (!imgEl || imgEl.dataset.fallbackApplied === '1') return;
        imgEl.dataset.fallbackApplied = '1';
        imgEl.src = pickFallbackUrl(seed || imgEl.dataset.fallbackSeed || 'news');
    }

    window.NewsFallback = {
        FALLBACK_FILES,
        pickFallbackPath,
        pickFallbackUrl,
        resolveNewsImage,
        onImgError,
        seedIndex,
    };
})();
