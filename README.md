# automation-sitemap-check

**Sitemap checker.** Walks a sitemap.xml (index included) and tests every URL to catch broken pages and failed redirects.

Node.js 18+, **no dependencies**, **MIT** licence. No data is sent anywhere: only the addresses you give are contacted. The scripts print their messages in French.

## Usage

```bash
node src/sitemap-check.mjs https://exemple.com/sitemap.xml
```

Run it with `--help` for the built-in options (the scripts print in French).

## Tests

```bash
npm test
```

## Limits

- The files in `samples/` are fictional: adapt the column headers to your own exports.
- Try it on a copy of your data first.
- Provided as is, without warranty (see `LICENSE`).

## The series

This script is part of a series of **free automation scripts** (audience: web monitoring, among others): [overview, guides and full archive](https://monsieurelzam.com/en/scripts) · [all repositories](https://github.com/MonsieurElzam?tab=repositories&q=automation-).

---

By [Elzam MAMAH](https://monsieurelzam.com/en), business analyst and process-optimization expert. MIT licence.
