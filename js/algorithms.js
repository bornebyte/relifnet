export function dijkstra(nodes, roads, source) {
  const ids = nodes.map(n=>n.id);
  const adjacency = Object.fromEntries(ids.map(id=>[id,[]]));
  roads.filter(r=>r.open && adjacency[r.a] && adjacency[r.b]).forEach(r=>{
    adjacency[r.a].push({ to:r.b, weight:Number(r.km), edge:r.id });
    adjacency[r.b].push({ to:r.a, weight:Number(r.km), edge:r.id });
  });
  const dist = Object.fromEntries(ids.map(id=>[id,Infinity]));
  const prev = Object.fromEntries(ids.map(id=>[id,null]));
  const visited = new Set(), steps=[];
  const heap=[];
  const push=item=>{heap.push(item);let i=heap.length-1;while(i>0){const p=Math.floor((i-1)/2);if(heap[p].distance<=item.distance)break;heap[i]=heap[p];i=p;}heap[i]=item;};
  const pop=()=>{if(!heap.length)return null;const min=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let child=i*2+1;if(child>=heap.length)break;if(child+1<heap.length&&heap[child+1].distance<heap[child].distance)child++;if(heap[child].distance>=last.distance)break;heap[i]=heap[child];i=child;}heap[i]=last;}return min;};
  dist[source]=0;
  push({id:source,distance:0});
  steps.push({ type:'start', current:source, message:`Start at ${source}; all other distances are unknown.` });
  while (heap.length) {
    const entry=pop();
    const current=entry.id;
    if(visited.has(current)||entry.distance!==dist[current])continue;
    visited.add(current);
    steps.push({ type:'visit', current, distance:dist[current], message:`Visit ${current} at ${dist[current]} km.` });
    for (const edge of adjacency[current]) {
      if (visited.has(edge.to)) continue;
      const candidate=dist[current]+edge.weight;
      const improved=candidate<dist[edge.to];
      steps.push({ type:'relax', current, to:edge.to, edge:edge.edge, candidate, previous:dist[edge.to], improved,
        message:improved ? `Improve ${edge.to}: ${dist[current]} + ${edge.weight} = ${candidate} km.` : `Keep ${edge.to} at ${dist[edge.to]} km; ${candidate} km is longer.` });
      if (improved) { dist[edge.to]=candidate; prev[edge.to]=current; push({id:edge.to,distance:candidate}); }
    }
  }
  steps.push({ type:'done', current:null, message:'All reachable nodes have their shortest known distance.' });
  const paths=Object.fromEntries(ids.map(id=>{
    if (!Number.isFinite(dist[id])) return [id,[]];
    const path=[]; let cursor=id;
    while(cursor!==null){ path.unshift(cursor); cursor=prev[cursor]; }
    return [id,path];
  }));
  return { distances:dist, previous:prev, paths, visited:[...visited], steps };
}

export function kruskal(nodes, roads) {
  const parent=Object.fromEntries(nodes.map(n=>[n.id,n.id]));
  const rank=Object.fromEntries(nodes.map(n=>[n.id,0]));
  const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));
  const sorted=roads.filter(r=>r.open).map(r=>({...r,km:Number(r.km)})).sort((a,b)=>a.km-b.km || a.id.localeCompare(b.id));
  const selected=[], steps=[]; let total=0;
  for (const road of sorted) {
    const ra=find(road.a), rb=find(road.b), accepted=ra!==rb;
    if (accepted) {
      if (rank[ra]<rank[rb]) parent[ra]=rb;
      else if (rank[ra]>rank[rb]) parent[rb]=ra;
      else { parent[rb]=ra; rank[ra]++; }
      selected.push(road); total+=road.km;
    }
    steps.push({ road, accepted, total, message:accepted ? `Accept ${road.a}–${road.b}; the components join without a cycle.` : `Reject ${road.a}–${road.b}; both endpoints are already connected.` });
  }
  return { sorted, selected, steps, total, connected:selected.length===nodes.length-1 };
}

export function calculateRoute(route, roads) {
  const legs=[]; let total=0;
  for (let i=0;i<route.path.length-1;i++) {
    const a=route.path[i], b=route.path[i+1];
    const edge=roads.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a));
    if (!edge) return { feasible:false, reason:`No road connects ${a} and ${b}.`, legs, total:null };
    if (!edge.open) return { feasible:false, reason:`Road ${a}–${b} is closed.`, legs, total:null };
    const km=Number(edge.km); legs.push({a,b,km,edge:edge.id}); total+=km;
  }
  return { feasible:true, legs, total };
}
