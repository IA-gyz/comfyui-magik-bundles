import {migrateNode,migrateGraph} from './legacy.js';
export const KEY = 'magik_bundles';
export const COLORS = ['#b794f4','#68d391','#f6ad55','#63b3ed','#fc8181','#f687b3','#4fd1c5'];
export function cleanBundle(g) {
  if (!g || typeof g.id !== 'string' || !g.id || typeof g.name !== 'string') return null;
  return {id:g.id, name:g.name.slice(0,120) || 'Untitled', color:/^#[0-9a-f]{6}$/i.test(g.color) ? g.color : COLORS[0]};
}
export function memberships(node) {
  migrateNode(node);
  const raw = node.properties?.[KEY];
  return Array.isArray(raw) ? raw.map(cleanBundle).filter(Boolean) : [];
}
export function indexGraph(graph) {
  migrateGraph(graph);
  const bundles = new Map(), members = new Map(), byNode = new Map();
  const stored = graph?.extra?.[KEY]?.bundles;
  for (const raw of Array.isArray(stored) ? stored : []) {
    const g = cleanBundle(raw); if (g) {bundles.set(g.id,g);members.set(g.id,[]);}
  }
  for (const node of graph?._nodes || []) {
    const seen = new Set();
    for (const g of memberships(node)) {
      if (seen.has(g.id)) continue; seen.add(g.id);
      if (!bundles.has(g.id)) {bundles.set(g.id,g);members.set(g.id,[]);}
      members.get(g.id).push(node);
    }
    byNode.set(node, [...seen].map(id=>bundles.get(id)));
  }
  return {bundles,members,byNode};
}
export function persistBundles(graph, bundles) {
  graph.extra ??= {};
  graph.extra[KEY] = {...graph.extra[KEY],version:1, bundles:[...bundles.values()].map(g=>({...g}))};
  // Canonical definitions travel with nodes on duplication and clipboard paste.
  for (const node of graph._nodes || []) {
    const current = memberships(node), ids = new Set(current.map(g=>g.id));
    if (!current.length) continue;
    const next = [...ids].filter(id=>bundles.has(id)).map(id=>({...bundles.get(id)}));
    if (next.length) node.properties[KEY] = next;
    else delete node.properties[KEY];
  }
}
export function assign(node, bundle, enabled) {
  node.properties ??= {};
  const next = memberships(node).filter(g=>g.id!==bundle.id);
  if (enabled) next.push({...bundle});
  if (next.length) node.properties[KEY]=next; else delete node.properties[KEY];
}

export const MODE_ENABLED = 0;
export const MODE_BYPASS = 4;
export function bundleStatus(nodes) {
  const enabled=nodes.filter(n=>(n.mode ?? MODE_ENABLED)===MODE_ENABLED).length;
  const bypassed=nodes.filter(n=>n.mode===MODE_BYPASS).length;
  const other=nodes.length-enabled-bypassed;
  return {enabled,bypassed,other,total:nodes.length,state:!nodes.length?'Empty':enabled===nodes.length?'Enabled':bypassed===nodes.length?'Bypassed':'Mixed'};
}
