import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)

test('13 sitemap : extraction, index imbriqué, déduplication', async () => {
  const { extractLocs, collect, pool } = await mod('sitemap-check')
  assert.deepEqual(extractLocs('<urlset><url><loc>https://x/a?b=1&amp;c=2</loc></url></urlset>').locs, ['https://x/a?b=1&c=2'])
  const pages = { 'https://x/index.xml': '<sitemapindex><sitemap><loc>https://x/s1.xml</loc></sitemap></sitemapindex>', 'https://x/s1.xml': '<urlset><url><loc>https://x/p1</loc></url><url><loc>https://x/p2</loc></url></urlset>' }
  const fake = async (u) => ({ ok: true, status: 200, text: async () => pages[u] })
  assert.deepEqual(await collect('https://x/index.xml', fake), ['https://x/p1', 'https://x/p2'])
  let active = 0, peak = 0
  await pool([1, 2, 3, 4, 5, 6], 2, async () => { active++; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 5)); active-- })
  assert.equal(peak, 2)
})
