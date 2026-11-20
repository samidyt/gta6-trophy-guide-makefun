"""Screenshot the Leonida Trophy Guide with Camoufox (headless Firefox).
Serves from http://localhost:8080 (node serve.ts). Takes 4 shots at 1280x800:
1-checklist, 2-roadmap, 3-missable, 4-spoiler. Saves PNGs to /tmp/gta6-shots/.
"""
from camoufox import Camoufox

EARNED = [
    "Just Like Paradise", "Paradise Lost", "T**s Ass Drug Money",
    "Vice City, Baby!", "Trust", "Master of None", "Whip It Good",
    "The Goodtime State", "Treat Yo Self", "One Last Thing",
    "Actions Speak Louder", "Personal Best",
]
EARNED_JSON = str(EARNED).replace("'", '"')

with Camoufox(headless=True) as browser:
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 800},
        ignore_https_errors=True,
    )
    # Pre-seed progress: 12 trophies earned, spoiler ON by default.
    ctx.add_init_script(
        f"localStorage.setItem('leonida-trophy-guide-earned-v1', '{EARNED_JSON}');"
        "localStorage.setItem('leonida-trophy-guide-spoiler-v1', 'on');"
    )
    page = ctx.new_page()
    page.goto("http://localhost:8080/", wait_until="networkidle")
    page.wait_for_timeout(800)

    # --- Shot 1: checklist, spoiler OFF, platinum guide open ---
    page.locator("#spoiler").uncheck()
    page.wait_for_timeout(300)
    # Expand the first card's guide (Vice Got a Price!) so its guide text,
    # steps and sources are visible inside the 800px viewport.
    card = page.locator('[data-trophy="Vice Got a Price!"]')
    card.locator(".guide-toggle").click()
    page.wait_for_timeout(300)
    page.evaluate("window.scrollTo(0, 140)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/gta6-shots/1-checklist.png")
    print("shot 1 done")

    # --- Shot 2: roadmap tab ---
    page.locator('[data-tab="roadmap"]').click()
    page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/gta6-shots/2-roadmap.png")
    print("shot 2 done")

    # --- Shot 3: missable tab ---
    page.locator('[data-tab="missable"]').click()
    page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/gta6-shots/3-missable.png")
    print("shot 3 done")

    # --- Shot 4: checklist, spoiler ON, story filter ---
    page.locator('[data-tab="checklist"]').click()
    page.wait_for_timeout(400)
    page.locator("#spoiler").check()
    page.locator("#kind").select_option("story")
    page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0, 140)")
    page.wait_for_timeout(300)
    page.screenshot(path="/tmp/gta6-shots/4-spoiler.png")
    print("shot 4 done")
print("ALL SHOTS DONE")
