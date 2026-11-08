import assert from 'node:assert/strict';
import {bundleStatus,KEY,indexGraph,persistBundles,assign,cleanBundle} from '../js/model.js';
const a={id:1,properties:{}},b={id:2,properties:{}},graph={extra:{unrelated:42},_nodes:[a,b]};
const g={id:'g',name:'Character',color:'#123456'},h={id:'h',name:'Output',color:'#654321'};
assign(a,g,true);assign(a,h,true);assign(b,g,true);assign(a,g,true);
let idx=indexGraph(graph);assert.equal(idx.members.get('g').length,2);assert.equal(idx.byNode.get(a).length,2);
persistBundles(graph,idx.bundles);assert.equal(graph.extra.unrelated,42);
const copy=JSON.parse(JSON.stringify(graph));assert.equal(indexGraph(copy).members.get('g').length,2);
idx.bundles.set('g',{...g,name:'Renamed'});persistBundles(graph,idx.bundles);assert.equal(a.properties[KEY].find(x=>x.id==='g').name,'Renamed');
idx.bundles.delete('g');persistBundles(graph,idx.bundles);assert.equal(indexGraph(graph).bundles.has('g'),false);assert.equal(graph._nodes.length,2);
const pasted={extra:{},_nodes:[structuredClone(a)]};assert.equal(indexGraph(pasted).bundles.get('h').name,'Output');
assign(a,h,false);assert.equal(a.properties[KEY],undefined);assert.equal(indexGraph(graph).bundles.has('h'),true);
assert.equal(cleanBundle({id:'x',name:'X',color:'garbage'}).color,'#b794f4');assert.equal(cleanBundle({id:3,name:'Bad'}),null);
console.log('PASS: membership, overlap, deduplication, persistence, rename, deletion, clipboard recovery, empty bundles, input validation');

assert.equal(bundleStatus([]).state,'Empty');assert.equal(bundleStatus([{mode:0},{}]).state,'Enabled');assert.equal(bundleStatus([{mode:4}]).state,'Bypassed');assert.deepEqual(bundleStatus([{mode:0},{mode:4},{mode:2}]),{enabled:1,bypassed:1,other:1,total:3,state:'Mixed'});

// Legacy workflow, clipboard, and preference migration.
const {migrateGraph,readPreferences}=await import('../js/legacy.js');
const legacyDefinition={id:'legacy',name:'Kept',color:'#123456'};
const legacyNode={properties:{magik_groups:[legacyDefinition]}};
const legacyGraph={extra:{magik_groups:{version:1,groups:[legacyDefinition]}},_nodes:[legacyNode]};
migrateGraph(legacyGraph);assert.equal(legacyGraph.extra.magik_bundles.bundles[0].id,'legacy');assert.equal(legacyGraph.extra.magik_groups,undefined);assert.equal(legacyGraph.extra.magik_bundles.groups,undefined);assert.equal(legacyNode.properties.magik_bundles[0].id,'legacy');assert.equal(legacyNode.properties.magik_groups,undefined);
const migrationStorage=new Map([['magik_groups.ui',JSON.stringify({scale:1.5,groupHighlighting:{legacy:false,__magik_all_groups__:false}})]]);const migrated=readPreferences({getItem:key=>migrationStorage.get(key)??null,setItem:(key,value)=>migrationStorage.set(key,value)});assert.equal(migrated.scale,1.5);assert.equal(migrated.bundleHighlighting.legacy,false);assert.equal(migrated.bundleHighlighting.__magik_all_bundles__,false);assert.equal(migrated.groupHighlighting,undefined);
