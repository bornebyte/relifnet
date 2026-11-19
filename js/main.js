import { getState,getAlgorithmState,derive,update,setPage,subscribe,addActivity,runDijkstra,stepDijkstra,playDijkstra,pauseDijkstra,resetDijkstra,runMst,stepMst,playMst,resetMst,startRoute,pauseRoute,resumeRoute,resetRoute,resetAll,resetNetwork,resetResources } from './model.js';
import { renderApplication } from './views/index.js';

const root=document.querySelector('#app');
let selectedRoad=null, mobileOpen=false;
let toastTimer=null;
function toast(message,type='info'){
 const el=document.querySelector('#toast');el.textContent=message;el.className=`toast toast-${type} is-visible`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-visible'),3200);
}
function render(){root.innerHTML=renderApplication(getState(),derive(),getAlgorithmState(),selectedRoad,mobileOpen);}
subscribe(render);render();

function go(page){mobileOpen=false;setPage(page);window.scrollTo({top:0,behavior:'smooth'});}
function changeRoad(id,patch){const state=getState();const road=state.roads.find(r=>r.id===id);if(!road)return;update({roads:state.roads.map(r=>r.id===id?{...r,...patch}:r)});resetDijkstra();resetMst();}

root.addEventListener('click',event=>{
 const pageBtn=event.target.closest('[data-page]');
 if(pageBtn){event.preventDefault();go(pageBtn.dataset.page);return;}
 const btn=event.target.closest('[data-action]');if(!btn)return;
 const {action,id}=btn.dataset;
 if(action==='launch'){go('overview');return;}
 if(action==='learn'){go('learn');return;}
 if(action==='select-edge'){selectedRoad=id;render();return;}
 if(action==='mobile-menu'){mobileOpen=true;render();return;}
 if(action==='close-mobile'){mobileOpen=false;render();return;}
 if(action==='collapse-sidebar'){update({sidebarCollapsed:!getState().sidebarCollapsed});return;}
 if(action==='reset-network'){resetNetwork();selectedRoad=null;toast('Original project network restored.','success');return;}
 if(action==='reset-all'){if(window.confirm('Reset all roads, populations, assumptions, and simulation traces to the original project data?')){resetAll();selectedRoad=null;toast('Full simulation reset to project data.','success');}return;}
 if(action==='toggle-road'){const road=getState().roads.find(r=>r.id===id);changeRoad(id,{open:!road.open});addActivity(`Road ${road.a}–${road.b} ${road.open?'closed':'reopened'}`,'network');toast(`Road ${road.a}–${road.b} ${road.open?'closed':'reopened'}.`,'success');return;}
 if(action==='delete-road'){const road=getState().roads.find(r=>r.id===id);update({roads:getState().roads.filter(r=>r.id!==id)});resetDijkstra();resetMst();selectedRoad=null;if(road)addActivity(`Road ${road.a}–${road.b} removed`,'network');toast('Road removed from the network.','success');return;}
 if(action==='run-dijkstra'){runDijkstra();return;}
 if(action==='dijkstra-next'){stepDijkstra(1);return;}
 if(action==='dijkstra-prev'){stepDijkstra(-1);return;}
 if(action==='dijkstra-play'){playDijkstra();toast('Dijkstra step playback started.');return;}
 if(action==='dijkstra-pause'){pauseDijkstra();toast('Dijkstra playback paused.');return;}
 if(action==='reset-dijkstra'){resetDijkstra();toast('Dijkstra trace reset.');return;}
 if(action==='run-mst'){runMst();stepMst();return;}
 if(action==='mst-next'){stepMst(1);return;}
 if(action==='mst-play'){playMst();toast('Kruskal edge playback started.');return;}
 if(action==='reset-mst'){resetMst();toast('Kruskal trace reset.');return;}
 if(action==='reset-resources'){resetResources();toast('Project resource assumptions restored.','success');return;}
 if(action==='start-route'){const result=startRoute();if(!result.ok)toast(result.message,'error');else toast('Vehicle animation started.');return;}
 if(action==='pause-route'){pauseRoute();toast('Vehicle simulation paused.');return;}
 if(action==='resume-route'){resumeRoute();toast('Vehicle simulation resumed.');return;}
 if(action==='reset-route'){resetRoute();toast('Vehicle simulation reset.');return;}
 if(action==='run-complete'){
   runDijkstra();playDijkstra();runMst();playMst();
   const result=startRoute();go('routes');
   if(!result.ok)toast(result.message,'error');else toast('Algorithms are running and vehicle routes are animating.','success');
   return;
 }
 if(action==='print'){window.print();return;}
 if(action==='landing-menu'){document.querySelector('.landing-nav')?.classList.toggle('landing-menu-open');return;}
});

root.addEventListener('change',event=>{
 const input=event.target.closest('[data-field]');if(!input)return;
 const field=input.dataset.field,id=input.dataset.id,value=input.value;
 if(field==='road-km'){
   const km=Number(value);if(!(km>0)){toast('Road distance must be greater than zero.','error');render();return;}changeRoad(id,{km});addActivity(`Road ${id} distance changed to ${km} km`,'network');return;
 }
 const state=getState();
 if(field==='source'){update({source:value});resetDijkstra();addActivity(`Shortest paths now start at ${value}`,'algorithm');return;}
 if(field==='destination'){update({selectedDestination:value});return;}
 if(field==='population'){
   const population=Math.max(0,Math.floor(Number(value)||0));update({villages:state.villages.map(v=>v.id===id?{...v,population}:v)});addActivity(`Village ${id} population updated`,'resource');return;
 }
 if(field==='demand-per-person'){const rate=Math.max(0,Number(value)||0);update({demandPerPerson:rate});addActivity(`Demand rate changed to ${rate} kg per person`,'resource');return;}
 if(field==='vehicle-capacity'){const capacity=Math.max(1,Number(value)||1);update({vehicleCapacity:capacity});addActivity(`Vehicle capacity changed to ${capacity} kg`,'resource');return;}
 if(field==='speed'){update({speed:Math.max(1,Number(value)||1)});return;}
 if(field==='unload'){const unload=Math.max(0,Number(value)||0);update({villages:state.villages.map(v=>v.id===id?{...v,unload}:v)});return;}
 if(field.startsWith('set-')){
   const name=field.slice(4);const val=Math.max(0,Math.floor(Number(value)||0));
   const sets={...state.sets,[name]:val};
   if(sets.overlap>Math.min(sets.food,sets.water)){toast('Overlap cannot exceed either beneficiary group.','error');render();return;}
   update({sets});return;
 }
});

root.addEventListener('submit',event=>{
 if(event.target.id!=='add-road-form')return;event.preventDefault();
 const form=new FormData(event.target),a=String(form.get('a')),b=String(form.get('b')),km=Number(form.get('km')),open=form.get('open')==='on';
 if(a===b){toast('Choose two different locations.','error');return;}
 if(!(km>0)){toast('Enter a distance greater than zero.','error');return;}
 const existing=getState().roads.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a));
 if(existing){toast(`Road ${a}–${b} already exists. Select it from the road list to edit it.`,'error');return;}
 const road={id:[a,b].sort().join('-'),a,b,km,open};update({roads:[...getState().roads,road]});resetDijkstra();resetMst();selectedRoad=road.id;addActivity(`Road ${a}–${b} added as ${open?'open':'closed'}`,'network');toast(`Road ${a}–${b} added.`,'success');
});

root.addEventListener('keydown',event=>{
 const edge=event.target.closest('.road-group[role="button"]');if(edge&&(event.key==='Enter'||event.key===' ')){event.preventDefault();selectedRoad=edge.dataset.id;render();}
 if(event.key==='Escape'&&mobileOpen){mobileOpen=false;render();}
});
