const fs = require('fs');
const path = require('path');
const baseline = require('../src/utils/algorithms_baseline');
const optimized = require('../src/utils/algorithms_optimized');

function measure(fn, reps = 5) {
  for (let w = 0; w < 2; w++) fn();
  const times = [];
  for (let r = 0; r < reps; r++) {
    const t0 = process.hrtime.bigint();
    fn();
    const t1 = process.hrtime.bigint();
    times.push(Number(t1 - t0));
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

function runBenchmark() {
  const results = {};

  const sizesN2 = [10, 100, 1000, 5000, 10000];
  const sizesLin = [10, 100, 1000, 10000, 100000];

  results['F1_enrichProducts'] = [];
  for (const n of sizesN2) {
    const prods = Array.from({ length: n }, (_, i) => ({ id: i + 1, nome: `Prod_${i}`, preco: 10 + (i % 100) }));
    const revs = Array.from({ length: n }, (_, i) => ({ id: i + 1, idProduto: (i % n) + 1, nota: (i % 5) + 1 }));
    const reps = n > 1000 ? 3 : 20;
    const tBase = measure(() => baseline.enrichProductsBaseline(prods, revs), reps);
    const tOpt = measure(() => optimized.enrichProductsOptimized(prods, revs), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F1_enrichProducts'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F2_deduplicateCartItems'] = [];
  for (const n of sizesN2) {
    const items = Array.from({ length: n }, (_, i) => ({ id: i + 1, idProduto: (i % Math.floor(n * 0.7)) + 1, quantidade: 1 }));
    const reps = n > 1000 ? 5 : 50;
    const tBase = measure(() => baseline.deduplicateCartItemsBaseline(items), reps);
    const tOpt = measure(() => optimized.deduplicateCartItemsOptimized(items), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F2_deduplicateCartItems'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F3_validateStockCross'] = [];
  for (const n of sizesN2) {
    const cat = Array.from({ length: n }, (_, i) => ({ id: i + 1, nome: `P_${i}`, estoque: 1000 }));
    const cart = Array.from({ length: n }, (_, i) => ({ idProduto: i + 1, quantidade: 1 }));
    const reps = n > 1000 ? 5 : 50;
    const tBase = measure(() => baseline.validateStockCrossBaseline(cart, cat), reps);
    const tOpt = measure(() => optimized.validateStockCrossOptimized(cart, cat), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F3_validateStockCross'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F4_seedCategories'] = [];
  for (const n of sizesLin) {
    const cats = Array.from({ length: n }, (_, i) => ({ nome: `Cat_${i}`, slug: `cat-${i}` }));
    let baseOps = 0;
    let optOps = 0;
    const mockBase = { insertSingle: () => { baseOps++; } };
    const mockOpt = { insertMany: () => { optOps++; } };
    const tBase = measure(() => baseline.simulateSeedCategoriesBaseline(cats, mockBase), 20);
    const tOpt = measure(() => optimized.simulateSeedCategoriesOptimized(cats, mockOpt), 20);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F4_seedCategories'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup, baseOps, optOps });
  }

  results['F5_getResumoBatch'] = [];
  for (const n of sizesN2) {
    const prods = Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
    const revs = Array.from({ length: n }, (_, i) => ({ idProduto: (i % n) + 1, nota: (i % 5) + 1 }));
    const reps = n > 1000 ? 5 : 30;
    const tBase = measure(() => baseline.getResumoBatchBaseline(prods, revs), reps);
    const tOpt = measure(() => optimized.getResumoBatchOptimized(prods, revs), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F5_getResumoBatch'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F6_generateSlug'] = [];
  for (const n of sizesLin) {
    const text = 'Placas de Vídeo & Processadores 100% Top - '.repeat(Math.ceil(n / 40)).slice(0, n);
    const reps = n > 10000 ? 5 : 50;
    const tBase = measure(() => baseline.generateSlugBaseline(text), reps);
    const tOpt = measure(() => optimized.generateSlugOptimized(text), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F6_generateSlug'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F7_removeNullish'] = [];
  for (const n of sizesLin) {
    const obj = {};
    for (let i = 0; i < n; i++) {
      if (i % 3 === 0) obj[`k_${i}`] = null;
      else if (i % 3 === 1) obj[`k_${i}`] = undefined;
      else obj[`k_${i}`] = i;
    }
    const reps = n > 10000 ? 5 : 50;
    const tBase = measure(() => baseline.removeNullishBaseline(obj), reps);
    const tOpt = measure(() => optimized.removeNullishOptimized(obj), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F7_removeNullish'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  results['F8_simulateCepLookupDispatch'] = [];
  for (const n of sizesLin) {
    const events = [];
    for (let i = 0; i < n; i++) {
      const cep = String(10000000 + (i % 1000)).slice(0, 8);
      events.push({ type: 'change', value: cep });
      events.push({ type: 'blur', value: cep });
    }
    const reps = n > 10000 ? 5 : 50;
    const tBase = measure(() => baseline.simulateCepLookupDispatchBaseline(events, () => {}), reps);
    const tOpt = measure(() => optimized.simulateCepLookupDispatchOptimized(events, () => {}), reps);
    const speedup = parseFloat((tBase / Math.max(tOpt, 1)).toFixed(2));
    results['F8_simulateCepLookupDispatch'].push({ n, tBaseNs: tBase, tOptNs: tOpt, speedup });
  }

  return results;
}

const data = runBenchmark();
const outPath = path.join(__dirname, 'benchmark_results.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

for (const [key, rows] of Object.entries(data)) {
  console.log(`\n=== ${key} ===`);
  console.table(
    rows.map((r) => ({
      n: r.n,
      'Base (µs)': (r.tBaseNs / 1000).toFixed(1),
      'Opt (µs)': (r.tOptNs / 1000).toFixed(1),
      Speedup: `${r.speedup}x`,
    }))
  );
}
