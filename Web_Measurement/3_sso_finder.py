'''
Run this code using the command:
    python3 4_playwright.py <input_filename> <output_filename>

'''

import csv
import re
import time
import argparse
import logging
from typing import Set, List
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright, TimeoutError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


class SSODetector:

    SSO_PATTERNS = {
        'GOOGLE': [
            r'accounts\.google\.com',
            r'identitytoolkit\.googleapis\.com',
            r'sign.?in.?with.?google',
            r'continue.?with.?google',
            r'gsi/client',
            r'login.?via.?google',
            r'log.?in.?with.?google'
        ],

        'FACEBOOK': [
            r'connect\.facebook\.net',
            r'sign.?in.?with.?facebook',
            r'continue.?with.?facebook',
            r'login.?via.?facebook',
            r'log.?in.?with.?facebook'
        ],

        'APPLE': [
            r'appleid\.apple\.com',
            r'sign.?in.?with.?apple',
            r'continue.?with.?apple',
            r'login.?via.?apple',
            r'log.?in.?with.?apple'
        ],

        'MICROSOFT': [
            r'microsoftonline\.com',
            r'login\.live\.com',
            r'sign.?in.?with.?microsoft',
            r'continue.?with.?microsoft',
            r'login.?via.?microsoft',
            r'log.?in.?with.?microsoft'
        ],

        'GITHUB': [
            r'github\.com/login/oauth',
            r'sign.?in.?with.?github',
            r'continue[\s._-]*with[\s._-]*github',
            r'login.?via.?github',
            r'continue.?with.?github',
            r'log.?in.?with.?github'
        ],

        'OKTA': [
            r'\.okta\.com',
            r'okta-signin-widget',
        ],

        'AUTH0': [
            r'\.auth0\.com',
            r'auth0',
        ],

        'DISCORD': [
            r'discord\.com/api/oauth2',
            r'sign.?in.?with.?discord',
            r'continue[\s._-]*with[\s._-]*discord',
            r'log.?in.?with.?discord'
        ],

        'SLACK': [
            r'slack\.com/oauth',
            r'log.?in.?with.?slack',

        ],

        'LINKEDIN': [
            r'linkedin\.com/oauth',
            r'sign.?in.?with.?linkedin',
            r'login.?via.?linkedin',
            r'continue.?with.?linkedin',
            r'log.?in.?with.?linkedin'
        ],

        'TWITTER': [
            r'api\.twitter\.com/oauth',
            r'x\.com/i/oauth',
            r'continue.?with.?x',
            r'login.?via.?x',
            r'sign.?in.?with.?x',
            r'log.?in.?with.?x'

        ],

        'WECHAT': [
            r'wx\.qq\.com',
            r'weixin',
            r'open\.weixin\.qq\.com',
            r'res\.wx\.qq\.com',
            r'connect/l/qrconnect',
            r'sign[\s._-]*in[\s._-]*with[\s._-]*wechat',
            r'continue[\s._-]*with[\s._-]*wechat',
            r'login[\s._-]*with[\s._-]*wechat',
            r'wechat[\s._-]*login',
            r'weixin[\s._-]*login',
            r'login[\s._-]*via[\s._-]*wechat',
            r'log.?in.?with.?wechat'
        ],

        'QQ': [
            r'qq\.com',
            r'connect\.qq\.com',
            r'graph\.qq\.com',
            r'xui\.ptlogin2\.qq\.com',
            r'ptlogin2\.qq\.com',
            r'openmobile\.qq\.com',
            r'sign[\s._-]*in[\s._-]*with[\s._-]*qq',
            r'continue[\s._-]*with[\s._-]*qq',
            r'login[\s._-]*with[\s._-]*qq',
            r'qq[\s._-]*login',
            r'login[\s._-]*via[\s._-]*qq',
            r'log.?in.?with.?qq'
        ],

    }

    LOGIN_KEYWORDS = [
        "login",
        "log in",
        "sign in",
        "signin",
        "continue",
        "account",
        "auth",
        "anmelden"
    ]

    def __init__(self, timeout=15000, headless=True):
        self.timeout = timeout
        self.headless = headless



    def detect_sso_providers(self, url: str) -> Set[str]:

        providers = set()
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=self.headless,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                ]
            )
            context = browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0 Safari/537.36"
                ),
                locale="en-US",
            )
            page = context.new_page()
            page.set_default_timeout(10000)
            network_urls = set()

            def handle_request(request):
                network_urls.add(request.url.lower())

            page.on("request", handle_request)
            try:

                logger.info(f"Scanning {url}")
                page.goto(
                    url,
                    timeout=self.timeout,
                    wait_until="domcontentloaded"
                )

                page.wait_for_timeout(3000)

                all_content = []

                # -------- initial page ----------
                all_content.append(page.content())

                try:
                    visible_text = page.locator("body").inner_text()
                    all_content.append(visible_text)
                except:
                    pass

                # -------- click login buttons ----------
                self._click_login_buttons(page)

                page.wait_for_timeout(4000)

                # -------- after click/navigation ----------
                all_content.append(page.content())

                try:
                    visible_text = page.locator("body").inner_text()
                    all_content.append(visible_text)
                except:
                    pass

                # -------- explicit login page fallback ----------
                login_urls = [
                    "/login",
                    "/signin",
                    "/auth/login",
                    "/anmelden",
                    "/sign-in",
                    "/log-in"
                ]

                current_origin = page.url.rstrip("/")

                for path in login_urls:

                    try:
                        login_url = current_origin + path

                        logger.info(f"  Checking login page: {login_url}")

                        page.goto(
                            login_url,
                            wait_until="domcontentloaded",
                            timeout=10000
                        )

                        page.wait_for_timeout(3000)

                        all_content.append(page.content())

                        try:
                            visible_text = page.locator("body").inner_text()
                            all_content.append(visible_text)
                        except:
                            pass

                    except:
                        pass

                # -------- scripts ----------
                try:
                    scripts = page.eval_on_selector_all(
                        "script",
                        "els => els.map(e => e.src || e.innerText)"
                    )
                    all_content.extend(scripts)
                except:
                    pass

                # -------- links ----------
                try:
                    links = page.eval_on_selector_all(
                        "a",
                        "els => els.map(e => e.href + ' ' + e.innerText)"
                    )
                    all_content.extend(links)
                except:
                    pass

                # -------- buttons ----------
                try:
                    buttons = page.eval_on_selector_all(
                        "button",
                        "els => els.map(e => e.innerText)"
                    )
                    all_content.extend(buttons)
                except:
                    pass

                # -------- iframes ----------
                try:
                    iframes = page.eval_on_selector_all(
                        "iframe",
                        "els => els.map(e => e.src)"
                    )
                    all_content.extend(iframes)
                except:
                    pass

                all_content.extend(network_urls)

                combined = "\n".join(
                    str(x) for x in all_content if x
                ).lower()

                # DEBUG
                # print(combined)

                for provider, patterns in self.SSO_PATTERNS.items():

                    for pattern in patterns:

                        if re.search(pattern, combined, re.IGNORECASE):
                            providers.add(provider)
                            logger.info(f"  ✓ Found {provider}")
                            break

            except TimeoutError:
                logger.warning(f"Timeout: {url}")

            except Exception as e:
                logger.warning(f"Error scanning {url}: {e}")

            finally:
                browser.close()

        return providers



    def _click_login_buttons(self, page):

        try:
            buttons = page.locator("a, button")

            count = min(buttons.count(), 50)

            for i in range(count):

                try:
                    el = buttons.nth(i)

                    text = (el.inner_text(timeout=1000) or "").lower()

                    if any(k in text for k in self.LOGIN_KEYWORDS):

                        logger.info(f"  Clicking: {text[:40]}")

                        el.click(timeout=2000)

                        page.wait_for_timeout(2000)

                except:
                    pass

        except:
            pass



def process_csv(input_file, output_file, delay=1.0, max_sites=None):

    detector = SSODetector()

    with open(input_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    logger.info(f"Loaded {len(rows)} rows")

    processed = 0

    def save_checkpoint():
        with open(output_file, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
        logger.info(f"Checkpoint saved → {output_file} (processed={processed})")

    for i, row in enumerate(rows):

        if not row.get("SSO_providers", "").strip():

            if max_sites and processed >= max_sites:
                break

            url = row.get("final_url") or f"https://{row.get('domain')}"

            logger.info(f"\n[{i+1}/{len(rows)}] {url}")

            providers = detector.detect_sso_providers(url)

            if providers:
                row["SSO_providers"] = ",".join(sorted(providers))

            processed += 1

             # PERIODIC SAVE
            if processed % 10 == 0:
                save_checkpoint()

            time.sleep(delay)


    # FINAL SAVE
    save_checkpoint()
    logger.info(f"Done → {output_file}")


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument("input_csv")
    parser.add_argument("output_csv")

    parser.add_argument("--delay", type=float, default=1.0)

    parser.add_argument("--max-sites", type=int)

    args = parser.parse_args()

    process_csv(
        args.input_csv,
        args.output_csv,
        args.delay,
        args.max_sites
    )


if __name__ == "__main__":
    main()