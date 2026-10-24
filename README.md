# Vehicle Number Generator (0000–9999)

A clean, user-friendly tool to generate 4-digit vehicle registration numbers (`0000`–`9999`) based on your chosen lucky single-digit total (`0`–`9`).

When you select a target total (for example, **8**), the app generates a vehicle number whose digits add up to that total:
- `9998` &rarr; $9+9+9+8=35 \rightarrow 3+5=8$
- `7847` &rarr; $7+8+4+7=26 \rightarrow 2+6=8$
- `1250` &rarr; $1+2+5+0=8$

---

## 1. Web Application

Simply open [`index.html`](index.html) in any browser, or run a local server:

```powershell
python -m http.server 8000
```
Then visit `http://localhost:8000`.

### Features
- **0–9 Target Selector**: Pick your lucky digit with one click or type it directly.
- **Precision Vehicle Plate Display**: Monospaced `Space Mono` display with zero layout shifting.
- **How the Digits Add Up**: Clean step-by-step breakdown showing how your chosen number reaches the target total.
- **Show 5 Options**: Generate 5 random vehicle number choices at once.
- **See All Numbers**: Search through all 1,111 matching numbers in real time.
- **One-Click Copy & History**: Quick clipboard copy and a session list of recent numbers.
- **Light & Dark Mode**: Seamless toggle between warm paper and studio dark themes.
- **Keyboard Shortcuts**: Press <kbd>Space</kbd> or <kbd>Enter</kbd> to roll a new vehicle number.

---

## 2. Python CLI

```powershell
# Generate 1 vehicle number for lucky sum 8:
python generator.py -t 8

# Generate 5 vehicle numbers for lucky sum 8:
python generator.py -t 8 -c 5

# Interactive prompt:
python generator.py

# Run the 10,000-number verification test suite:
python generator.py --test
```
