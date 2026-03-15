import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("URL parameter is required", { status: 400 });
    }

    try {
        const targetUrl = new URL(url);

        // Fetch the target URL with a fallback mechanism
        let response;
        try {
            response = await fetch(targetUrl.href, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                // Add a timeout
                signal: AbortSignal.timeout(10000),
            });
        } catch (firstError: any) {
            console.warn("First proxy fetch failed, attempting simple fallback:", firstError.message);
            // Simple fallback: no headers, let Node handles defaults
            try {
                response = await fetch(targetUrl.href, { signal: AbortSignal.timeout(10000) });
            } catch (secondError: any) {
                // If both fail, let it throw to the main catch block
                throw secondError;
            }
        }

        if (!response.ok) {
            return new NextResponse(`Failed to fetch URL: ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "";

        // If it's not HTML, just return the raw body
        if (!contentType.includes("text/html")) {
            return new NextResponse(response.body, {
                status: response.status,
                headers: {
                    "Content-Type": contentType,
                    "X-Frame-Options": "ALLOWALL",
                    "Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
                }
            });
        }

        let html = await response.text();

        // Strip <meta http-equiv="refresh" | "content-security-policy"> to prevent escaping proxy restrictions
        html = html.replace(/<meta[^>]*http-equiv\s*=\s*["']?(refresh|content-security-policy)["']?[^>]*>/gi, '');

        // Strip out prefetch and preload links to break Next.js/React hydration and SPA routing
        html = html.replace(/<link[^>]*rel\s*=\s*["']?(preload|prefetch|modulepreload)["']?[^>]*>/gi, '');

        // Inject <base> tag to fix relative assets (images, css, js).
        // Use response.url (which resolves any 301/302 redirects) instead of the original targetUrl!
        const finalUrl = response.url || targetUrl.href;
        const baseTag = `<base href="${finalUrl}" target="_self">`;
        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>\n${baseTag}`);
        } else if (html.includes('<html>')) {
            html = html.replace('<html>', `<html>\n<head>${baseTag}</head>`);
        } else {
            html = `${baseTag}\n${html}`;
        }

        // Inject script to intercept link clicks and keep them in the proxy iframe
        const script = `
        <script>
            (function() {
                const PROXY_TARGET_URL = ${JSON.stringify(finalUrl)};
                const PROXY_ORIGIN = new URL(PROXY_TARGET_URL).origin;
                
                function resolveUrl(urlStr) {
                    if (!urlStr) return urlStr;
                    
                    try {
                        // 1. If it's a relative path starting with /, append to the origin.
                        if (urlStr.startsWith('/')) {
                            // If it somehow already has the proxy path, clean it up
                            if (urlStr.includes('/api/proxy?url=')) {
                                const decoded = decodeURIComponent(urlStr.split('/api/proxy?url=')[1]);
                                return decoded;
                            }
                            return PROXY_ORIGIN + urlStr;
                        }
                        
                        // 2. If it's already an absolute URL that contains the proxy path
                        if (urlStr.includes('/api/proxy?url=')) {
                             const decoded = decodeURIComponent(urlStr.split('/api/proxy?url=')[1]);
                             return decoded;
                        }

                        // 3. Prevent localhost routing loops (SPA bugs)
                        if (urlStr.includes(window.location.origin)) {
                             const pathOnly = urlStr.replace(window.location.origin, '');
                             if (pathOnly.includes('/api/proxy?url=')) {
                                 return decodeURIComponent(pathOnly.split('/api/proxy?url=')[1]);
                             }
                             return PROXY_ORIGIN + pathOnly;
                        }

                        // 4. Fallback: Parse via URL object against the target base
                        return new URL(urlStr, PROXY_TARGET_URL).href;
                    } catch (e) {
                        return urlStr;
                    }
                }

                // Intercept window.open
                window.originalOpen = window.open;
                window.open = function(url, target, features) {
                    if (url) {
                        const absoluteUrl = resolveUrl(url);
                        window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
                        return null;
                    }
                    return window.originalOpen(url, target, features);
                };

                // Intercept assign/replace
                const originalAssign = window.location.assign;
                window.location.assign = function(url) {
                    const absoluteUrl = resolveUrl(url);
                    window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                    return originalAssign.call(window.location, '/api/proxy?url=' + encodeURIComponent(absoluteUrl));
                };

                const originalReplace = window.location.replace;
                window.location.replace = function(url) {
                    const absoluteUrl = resolveUrl(url);
                    window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                    return originalReplace.call(window.location, '/api/proxy?url=' + encodeURIComponent(absoluteUrl));
                };

                // Helper: check if a URL is effectively the same page we're already on
                function isSamePageUrl(urlStr) {
                    try {
                        const resolved = new URL(urlStr, window.location.href);
                        const current = new URL(window.location.href);
                        return resolved.pathname === current.pathname && resolved.origin === current.origin;
                    } catch(e) {
                        return false;
                    }
                }

                // Intercept SPA routing
                const originalPushState = history.pushState;
                history.pushState = function(state, unused, url) {
                    if (url && !isSamePageUrl(url)) {
                        const absoluteUrl = resolveUrl(url);
                        window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
                        return;
                    }
                    return originalPushState.apply(this, arguments);
                };

                const originalReplaceState = history.replaceState;
                history.replaceState = function(state, unused, url) {
                    // Ignore same-URL replacements (Next.js hydration does this)
                    if (!url || isSamePageUrl(url)) {
                        return originalReplaceState.apply(this, arguments);
                    }
                    const absoluteUrl = resolveUrl(url);
                    window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                    window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
                };

                document.addEventListener('click', function(e) {
                    const a = e.target.closest('a');
                    if (a && a.hasAttribute('href')) {
                        const href = a.getAttribute('href');
                        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                            return; // Let standard specific protocols pass
                        }
                        
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        if (href.startsWith('#')) {
                            window.location.hash = href;
                            return;
                        }
                        
                        const absoluteUrl = resolveUrl(href);
                        window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: absoluteUrl }, '*');
                        window.location.href = '/api/proxy?url=' + encodeURIComponent(absoluteUrl);
                    }
                }, true);
                
                document.addEventListener('submit', function(e) {
                    const form = e.target;
                    if (form && form.action) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();

                        if (form.method.toLowerCase() === 'get') {
                            const formData = new FormData(form);
                            const params = new URLSearchParams(formData);
                            const actionUrl = new URL(resolveUrl(form.action));
                            
                            // Append form params
                            for (const [key, value] of params.entries()) {
                                actionUrl.searchParams.append(key, value);
                            }
                            
                            window.parent.postMessage({ type: 'MAKE_OVER_NAVIGATE', url: actionUrl.href }, '*');
                            window.location.href = '/api/proxy?url=' + encodeURIComponent(actionUrl.href);
                        } else {
                            console.log('POST forms are disabled in preview mode.');
                        }
                    }
                }, true);

                // Broadcast scroll position to the parent for pin synchronization
                function sendScroll() {
                    window.parent.postMessage({
                        type: 'MAKE_OVER_SCROLL',
                        scrollY: window.scrollY,
                        scrollX: window.scrollX,
                        pageHeight: document.documentElement.scrollHeight
                    }, '*');
                }

                var isScrolling = false;
                var rafId = null;
                var scrollStopTimer = null;

                function scrollLoop() {
                    sendScroll();
                    if (isScrolling) {
                        rafId = requestAnimationFrame(scrollLoop);
                    }
                }

                window.addEventListener('scroll', function() {
                    isScrolling = true;
                    if (!rafId) {
                        rafId = requestAnimationFrame(scrollLoop);
                    }
                    // Send a confirmed final position 100ms after scroll stops
                    clearTimeout(scrollStopTimer);
                    scrollStopTimer = setTimeout(function() {
                        isScrolling = false;
                        rafId = null;
                        sendScroll(); // authoritative final position
                    }, 100);
                }, { passive: true });

                // Send initial scroll position immediately (not waiting for full load)
                sendScroll();
                document.addEventListener('DOMContentLoaded', sendScroll);
                window.addEventListener('load', sendScroll);


                // Listen for theme changes from parent (colour palette dropdown)
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'MAKE_OVER_THEME') {
                        var existingOverride = document.getElementById('makeover-theme-override');
                        if (existingOverride) existingOverride.remove();

                        if (event.data.key === 'original' || !event.data.palette || event.data.palette.length === 0) return;

                        var colors = event.data.palette;
                        var style = document.createElement('style');
                        style.id = 'makeover-theme-override';
                        style.textContent =
                            '*, *::before, *::after { transition: background-color 0.3s ease, color 0.3s ease !important; }' +
                            'html, body { background-color: ' + colors[0] + ' !important; color: ' + colors[3] + ' !important; }' +
                            'div, section, article, main, aside, figure { background-color: transparent !important; color: ' + colors[3] + ' !important; }' +
                            'nav, header, .navbar, [class*="nav"] { background-color: ' + colors[1] + ' !important; color: ' + colors[3] + ' !important; }' +
                            'footer, [class*="footer"] { background-color: ' + colors[1] + ' !important; color: ' + colors[3] + ' !important; }' +
                            'h1, h2, h3, h4, h5, h6 { color: ' + colors[3] + ' !important; }' +
                            'p, span, li, td, th, label, blockquote, figcaption, small, strong, em, b, i, u, sub, sup, abbr, cite, code, pre { color: ' + colors[3] + ' !important; }' +
                            'a, button, [class*="btn"], [class*="cta"], [role="button"] { color: ' + colors[4] + ' !important; border-color: ' + colors[4] + ' !important; }' +
                            'input, textarea, select { background-color: ' + colors[0] + ' !important; color: ' + colors[3] + ' !important; border-color: ' + colors[3] + '33 !important; }' +
                            'input::placeholder, textarea::placeholder { color: ' + colors[3] + '88 !important; }' +
                            'img, video, picture, svg, canvas, iframe { mix-blend-mode: normal !important; }';
                        document.head.appendChild(style);
                    }
                });
            })();
        </script>
        `;

        if (html.includes('</body>')) {
            html = html.replace('</body>', `${script}\n</body>`);
        } else {
            html += script;
        }

        // Create a new response with the modified HTML content
        const res = new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                // Strip out X-Frame-Options and Content-Security-Policy
                "X-Frame-Options": "ALLOWALL",
                // Provide a permissive CSP for the iframe
                "Content-Security-Policy": "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
            },
        });

        return res;

    } catch (error: any) {
        console.error("--- PROXY FETCH FAILURE DIAGNOSTICS ---");
        console.error("Target URL:", url);
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.cause) {
            console.error("Original Cause:", error.cause);
        }
        console.error("Full Error:", error);
        console.error("---------------------------------------");

        return new NextResponse(`Error proxying request: ${error.message}${error.cause ? ' (' + error.cause + ')' : ''}`, { status: 500 });
    }
}
