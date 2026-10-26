#!/usr/bin/env node
/* Parcourt un sitemap.xml (index compris) et vérifie le statut HTTP de chaque URL. */
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

export function extractLocs(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'))
  return { locs, isIndex: /<sitemapindex[\s>]/i.test(xml) }
}

export async function collect(sitemapUrl, fetchImpl = fetch, depth = 0) {
  const res = await fetchImpl(sitemapUrl, { headers: { 'user-agent': 'elzam-sitemap-check/1.0' } })
  if (!res.ok) throw new Error(`${sitemapUrl} → HTTP ${res.status}`)
  const { locs, isIndex } = extractLocs(await res.text())
  if (!isIndex || depth >= 2) return locs
  const nested = []
  for (const child of locs) nested.push(...(await collect(child, fetchImpl, depth + 1)))
  return nested
}

/** Exécute `worker` sur `items` avec au plus `limit` appels simultanés. */
export async function pool(items, limit, worker) {
  const out = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await worker(items[i]) }
  }))
  return out
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/sitemap-check.mjs https://exemple.com/sitemap.xml [--concurrency 5] [--limit 200]
Code de sortie 2 si au moins une URL répond en erreur.`, args, 1)
  let urls
  try { urls = await collect(args._[0]) } catch (e) { fail(e.message) }
  urls = [...new Set(urls)].slice(0, Number(args.limit ?? 200))
  console.log(`${urls.length} URL à vérifier…`)
  const results = await pool(urls, Number(args.concurrency ?? 5), async (url) => {
    try { return { url, status: (await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'elzam-sitemap-check/1.0' } })).status } }
    catch (e) { return { url, status: 0, error: e.cause?.code ?? e.message } }
  })
  const bad = results.filter((r) => r.status < 200 || r.status >= 400)
  bad.forEach((r) => console.log(`✗ ${r.status || '---'}  ${r.url}${r.error ? `  (${r.error})` : ''}`))
  console.log(`${results.length - bad.length}/${results.length} URL valides.`)
  process.exit(bad.length ? 2 : 0)
}
