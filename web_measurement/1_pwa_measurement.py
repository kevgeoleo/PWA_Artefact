import asyncio
import pandas as pd
import time
import json
from urllib.parse import urljoin
from playwright.async_api import async_playwright, TimeoutError

TRANCO_FILE = "top-1m.csv"
TOP_N = 10000
CONCURRENCY = 10
TIMEOUT = 20000
OUTPUT = "1_op.csv"

def load_domains():
    df = pd.read_csv(TRANCO_FILE, header=None)
    if df.shape[1] == 1:
        df = df[0].str.split("\t", expand=True)
    df.columns = ["rank", "domain"]
    return df["domain"].head(TOP_N).tolist()


async def measure_site(browser, domain):
    result = {
        "domain": domain,
        "final_url": None,
        "https": False,
        "manifest_present": False,
        "manifest_url": None,
        "manifest_name": False,
        "manifest_icons": False,
        "manifest_display": None,
        "installable": False,
        "service_worker": False,
        "sw_count": 0,
        "timestamp": time.time(),
        "status": "ok"
    }

    context = await browser.new_context()
    page = await context.new_page()

    try:
        url = "https://" + domain
        await page.goto(url, timeout=TIMEOUT)
        result["final_url"] = page.url
        result["https"] = page.url.startswith("https")

        await page.wait_for_timeout(3000)

        # Check manifest
        manifest_link = await page.query_selector("link[rel='manifest']")
        if manifest_link:
            result["manifest_present"] = True
            href = await manifest_link.get_attribute("href")
            result["manifest_url"] = href

            manifest_url = urljoin(page.url, href)
            try:
                manifest_json = await page.evaluate(
                    """async (url) => {
                        const r = await fetch(url);
                        return await r.json();
                    }""",
                    manifest_url
                )

                # Check required fields
                name = manifest_json.get("name") or manifest_json.get("short_name")
                result["manifest_name"] = bool(name and name.strip())  # True if non-empty string

                icons = manifest_json.get("icons", [])
                result["manifest_icons"] = bool(icons)  # True if list is not empty

                display_val = manifest_json.get("display", "browser")  # default is 'browser'
                result["manifest_display"] = display_val

                # Installable if display is standalone, fullscreen, or minimal-ui AND name+icons are valid
                result["installable"] = (
                    display_val in ["standalone", "fullscreen", "minimal-ui"]
                    and result["manifest_name"]
                    and result["manifest_icons"]
                )
                '''result["manifest_name"] = "name" in manifest_json or "short_name" in manifest_json
                result["manifest_icons"] = "icons" in manifest_json and len(manifest_json["icons"]) > 0
                display_val = manifest_json.get("display", "browser")  # default is 'browser'
                result["manifest_display"] = display_val
                # Installable if display is standalone or fullscreen
                result["installable"] = display_val in ["standalone", "fullscreen","minimal-ui"] and result["manifest_name"] and result["manifest_icons"]'''
            except:
                pass

        # Check service worker
        await page.wait_for_load_state("networkidle")
        #await asyncio.sleep(3)
        try:
            sw_count = await page.evaluate(
                """async () => {
                    let regs = await navigator.serviceWorker.getRegistrations();
                    return regs.length;
                }"""
            )
            #print(sw_count)
            result["sw_count"] = sw_count
            result["service_worker"] = sw_count > 0
        except:
            pass

    except Exception as e:
        result["status"] = str(e)

    finally:
        await context.close()

    return result


async def run(domains):
    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        sem = asyncio.Semaphore(CONCURRENCY)

        async def worker(domain):
            async with sem:
                r = await measure_site(browser, domain)
                results.append(r)
                print("Done:", domain)

        tasks = [worker(d) for d in domains]
        await asyncio.gather(*tasks)
        await browser.close()

    return results

async def main():
    domains = load_domains()
    print("Loaded", len(domains), "domains")
    results = await run(domains)

    df = pd.DataFrame(results)
    df.to_csv(OUTPUT, index=False)

    print("\nSaved results to", OUTPUT)
    print("\nSummary:")
    print("Manifest adoption:", df["manifest_present"].mean())
    print("Service worker adoption:", df["service_worker"].mean())
    print("Manifest has name:", df["manifest_name"].mean())
    print("Manifest has icons:", df["manifest_icons"].mean())
    print("Manifest display distribution:\n", df["manifest_display"].value_counts())
    print("Installable (standalone/fullscreen with name+icons):", df["installable"].mean())

if __name__ == "__main__":
    asyncio.run(main())