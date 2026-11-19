import { NODES } from '../data.js';
import { km } from './common.js';

const point=id=>NODES.find(n=>n.id===id);
function routePoint(route,progress){
 const legs=route.legs; if(!legs?.length)return point(route.path[0]);
 const total=route.total, target=Math.max(0,Math.min(total,total*progress));let walked=0;
 for(const leg of legs){if(walked+leg.km>=target){const a=point(leg.a),b=point(leg.b),t=leg.km?(target-walked)/leg.km:0;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}walked+=leg.km;}
 return point(route.path.at(-1));
}
export function networkSvg(state,{highlightEdges=[],routeData=null,animated=false,compact=false,currentNode=null,visitedNodes=[]}={}){
 const highlight=new Set(highlightEdges);
 const lines=state.roads.map(edge=>{
  const a=point(edge.a),b=point(edge.b); if(!a||!b)return '';
  const highlighted=highlight.has(edge.id)||highlight.has([edge.a,edge.b].sort().join('-'));
  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
  const labelX=mx-dy/len*16,labelY=my+dx/len*16;
  return `<g class="road-group ${edge.open?'road-open':'road-closed'} ${highlighted?'road-highlight':''}" data-action="select-edge" data-id="${edge.id}" tabindex="0" role="button" aria-label="Road ${edge.a} to ${edge.b}, ${edge.km} km, ${edge.open?'open':'closed'}"><line class="road-line-hit" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><line class="road-line" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><rect class="edge-label-bg" x="${labelX-27}" y="${labelY-12}" width="54" height="24" rx="8"/><text class="edge-label" x="${labelX}" y="${labelY+4}">${edge.km} km</text></g>`;
 }).join('');
 const routes=(routeData||[]).filter(r=>r.feasible).map(r=>{
  const p=r.path.map(id=>point(id)).filter(Boolean);const d=p.map((n,i)=>`${i?'L':'M'} ${n.x} ${n.y}`).join(' ');
  const marker=animated&&state.routeStatus!=='idle'?routePoint(r,state.routeProgress):null;
  return `<g class="route-overlay" style="--route-color:${r.color}"><path class="route-line" d="${d}"/><path class="route-line-glow" d="${d}"/>${marker?`<circle class="vehicle-dot" cx="${marker.x}" cy="${marker.y}" r="11"><title>${r.label}</title></circle><text class="vehicle-glyph" x="${marker.x}" y="${marker.y+4}">↗</text>`:''}</g>`;
 }).join('');
 const visited=new Set(visitedNodes);
 const nodes=NODES.map(n=>`<g class="node ${n.kind==='warehouse'?'node-warehouse':'node-village'} ${visited.has(n.id)?'node-visited':''} ${currentNode===n.id?'node-current':''}" transform="translate(${n.x} ${n.y})"><circle class="node-halo" r="31"/><circle class="node-ring" r="24"/><circle class="node-core" r="19"/><text class="node-id" y="5">${n.id}</text><text class="node-name" y="48">${n.name}</text></g>`).join('');
 return `<svg class="network-svg ${compact?'network-compact':''}" viewBox="0 0 800 420" role="img" aria-label="Interactive relief road network"><defs><pattern id="mapgrid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(155,190,210,.055)" stroke-width="1"/></pattern></defs><rect width="800" height="420" fill="url(#mapgrid)"/>${lines}${routes}${nodes}</svg>`;
}
