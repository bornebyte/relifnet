import { freshState, NODES, ORIGINAL_ROADS, ORIGINAL_VILLAGES, ORIGINAL_ROUTES } from './data.js';
import { dijkstra, kruskal, calculateRoute } from './algorithms.js';

const STORAGE_KEY='reliefnet-simulation-v1';
let state;
try {
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
  state=saved ? {...freshState(),...saved, activity:Array.isArray(saved.activity)?saved.activity:[]} : freshState();
} catch { state=freshState(); }
let listeners=[];
let dijkstraRun=null, mstRun=null, dijkstraStep=-1, mstStep=-1;
let dijkstraTimer=null, mstTimer=null, routeTimer=null, routeTimestamp=0;
export const subscribe=fn=>(listeners.push(fn),()=>listeners=listeners.filter(item=>item!==fn));
const emit=()=>{ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); listeners.forEach(fn=>fn()); };
export const getState=()=>state;
export const getAlgorithmState=()=>({dijkstra:dijkstraRun,dijkstraStep,mst:mstRun,mstStep});
export const update=(partial)=>{state={...state,...partial};emit();};
export function setPage(page){state.page=page;emit();}
export function addActivity(text,type='info') {
  state.activity=[{time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),text,type},...state.activity].slice(0,8); emit();
}

export function derive() {
  const shortest=dijkstra(NODES,state.roads,state.source);
  const mst=kruskal(NODES,state.roads);
  const villages=state.villages.map(v=>({ ...v, demand:Number(v.population)*Number(state.demandPerPerson), distance:shortest.distances[v.id], path:shortest.paths[v.id],
    priority:Number.isFinite(shortest.distances[v.id])?0.6*(Number(v.population)/700)+0.4*(shortest.distances[v.id]/10):null,
    foodPercent:0 }));
  const population=villages.reduce((sum,v)=>sum+Number(v.population),0);
  const demand=villages.reduce((sum,v)=>sum+v.demand,0);
  villages.forEach(v=>v.foodPercent=demand?v.demand/demand*100:0);
  const fleet=Math.ceil(demand/Number(state.vehicleCapacity||1));
  const routeData=ORIGINAL_ROUTES.map(route=>{
    const calc=calculateRoute(route,state.roads);
    const load=route.serves.reduce((sum,id)=>sum+(villages.find(v=>v.id===id)?.demand||0),0);
    return {...route,...calc,load,utilization:state.vehicleCapacity?load/Number(state.vehicleCapacity)*100:Infinity,overCapacity:load>Number(state.vehicleCapacity)};
  });
  const routesFeasible=routeData.every(r=>r.feasible);
  const fleetKm=routesFeasible?routeData.reduce((sum,r)=>sum+r.total,0):null;
  const unique=Number(state.sets.food)+Number(state.sets.water)-Number(state.sets.overlap);
  const priorityRank=[...villages].sort((a,b)=>(b.priority??-Infinity)-(a.priority??-Infinity));
  return { shortest,mst,villages,population,demand,fleet,routeData,routesFeasible,fleetKm,unique,priorityRank,
    openRoads:state.roads.filter(r=>r.open).length,closedRoads:state.roads.filter(r=>!r.open).length };
}

export function runDijkstra() { dijkstraRun=dijkstra(NODES,state.roads,state.source); dijkstraStep=0; addActivity(`Dijkstra started from ${state.source}`,'algorithm'); emit(); }
export function stepDijkstra(delta=1) { if (!dijkstraRun) runDijkstra(); dijkstraStep=Math.max(0,Math.min(dijkstraRun.steps.length-1,dijkstraStep+delta)); emit(); }
export function playDijkstra() {
  if (!dijkstraRun) runDijkstra();
  clearInterval(dijkstraTimer);
  dijkstraTimer=setInterval(()=>{if(dijkstraStep>=dijkstraRun.steps.length-1){clearInterval(dijkstraTimer);return;} dijkstraStep++;emit();},700);
}
export function pauseDijkstra(){clearInterval(dijkstraTimer);}
export function resetDijkstra(){clearInterval(dijkstraTimer);dijkstraRun=null;dijkstraStep=-1;emit();}
export function runMst(){mstRun=kruskal(NODES,state.roads);mstStep=-1;addActivity('Kruskal minimum spanning tree calculated','algorithm');emit();}
export function stepMst(delta=1){if(!mstRun)runMst();mstStep=Math.max(-1,Math.min(mstRun.steps.length-1,mstStep+delta));emit();}
export function playMst(){if(!mstRun)runMst();clearInterval(mstTimer);mstTimer=setInterval(()=>{if(mstStep>=mstRun.steps.length-1){clearInterval(mstTimer);return;}mstStep++;emit();},850);}
export function resetMst(){clearInterval(mstTimer);mstRun=null;mstStep=-1;emit();}

export function startRoute(){
  const d=derive();
  if(!d.routesFeasible) return {ok:false,message:'At least one illustrative route uses a missing or closed road.'};
  if(d.routeData.some(r=>r.overCapacity)) return {ok:false,message:'A route exceeds vehicle capacity. Adjust demand or capacity before running.'};
  clearInterval(routeTimer); state.routeStatus='running'; routeTimestamp=Date.now(); addActivity('Vehicle route simulation started','route'); emit();
  routeTimer=setInterval(()=>{
    if(state.routeStatus!=='running') return;
    const elapsed=(Date.now()-routeTimestamp)/1000;
    const longest=Math.max(...d.routeData.map(r=>r.total));
    const progress=Math.min(1,elapsed/Math.max(3,longest/2.5));
    state.routeProgress=progress;
    if(progress>=1){state.routeStatus='complete';clearInterval(routeTimer);addActivity('Vehicle route simulation completed','route');}
    emit();
  },100);
  return {ok:true};
}
export function pauseRoute(){if(state.routeStatus==='running'){state.routeStatus='paused';clearInterval(routeTimer);emit();}}
export function resumeRoute(){if(state.routeStatus==='paused'){const d=derive(); const longest=Math.max(...d.routeData.map(r=>r.total)); routeTimestamp=Date.now()-state.routeProgress*Math.max(3,longest/2.5)*1000;state.routeStatus='running';routeTimer=setInterval(()=>{if(state.routeStatus!=='running')return;const elapsed=(Date.now()-routeTimestamp)/1000;const p=Math.min(1,elapsed/Math.max(3,longest/2.5));state.routeProgress=p;if(p>=1){state.routeStatus='complete';clearInterval(routeTimer);addActivity('Vehicle route simulation completed','route');}emit();},100);emit();}}
export function resetRoute(){clearInterval(routeTimer);state.routeProgress=0;state.routeStatus='idle';emit();}
export function resetAll(){clearInterval(dijkstraTimer);clearInterval(mstTimer);clearInterval(routeTimer);state={...freshState(),page:'overview'};dijkstraRun=null;mstRun=null;dijkstraStep=-1;mstStep=-1;emit();}
export function resetNetwork(){state.roads=structuredClone(ORIGINAL_ROADS);resetDijkstra();resetMst();addActivity('Network restored to original project data','system');emit();}
export function resetResources(){state.villages=structuredClone(ORIGINAL_VILLAGES);state.demandPerPerson=2;state.vehicleCapacity=2000;state.speed=30;emit();}
