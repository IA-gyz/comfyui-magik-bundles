// Read-only identifiers from releases before the terminology change.
const PREVIOUS_KEY = 'magik_groups';
const CURRENT_KEY = 'magik_bundles';
export function migrateNode(node) {
  const data=node.properties;
  if(!data || !Object.hasOwn(data,PREVIOUS_KEY))return;
  if(!Object.hasOwn(data,CURRENT_KEY))data[CURRENT_KEY]=data[PREVIOUS_KEY];
  delete data[PREVIOUS_KEY];
}
export function migrateGraph(graph) {
  const extra=graph?.extra;
  if(extra?.[PREVIOUS_KEY]) {
    if(!Object.hasOwn(extra,CURRENT_KEY))extra[CURRENT_KEY]={...extra[PREVIOUS_KEY],bundles:extra[PREVIOUS_KEY].groups};
    delete extra[CURRENT_KEY].groups;
    delete extra[PREVIOUS_KEY];
  }
  for(const node of graph?._nodes || [])migrateNode(node);
}
export function readPreferences(storage) {
  const current=storage.getItem('magik_bundles.ui');
  if(current!==null)return JSON.parse(current);
  const previous=storage.getItem('magik_groups.ui');
  if(previous===null)return {};
  const data=JSON.parse(previous);
  data.bundleHighlighting=data.groupHighlighting || {};
  delete data.groupHighlighting;
  if(Object.hasOwn(data.bundleHighlighting,'__magik_all_groups__')) {
    data.bundleHighlighting.__magik_all_bundles__=data.bundleHighlighting.__magik_all_groups__;
    delete data.bundleHighlighting.__magik_all_groups__;
  }
  storage.setItem('magik_bundles.ui',JSON.stringify(data));
  return data;
}
