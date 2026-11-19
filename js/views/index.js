import { PAGE_TITLES,NAV } from '../data.js';
import { escapeHtml,iconSvg,button } from './common.js';
import { overview } from './overview.js';
import { networkPage } from './network.js';
import { dijkstraPage,mstPage } from './algorithms.js';
import { resourcesPage } from './resources.js';
import { routesPage,schedulePage } from './routes.js';
import { setsPage,priorityPage } from './insights.js';
import { analyticsPage } from './analytics.js';
import { learnPage,aboutPage } from './learning.js';
import { homePage } from './home.js';

const pages={overview,network:networkPage,dijkstra:dijkstraPage,mst:mstPage,resources:resourcesPage,routes:routesPage,schedule:schedulePage,sets:setsPage,priority:priorityPage,analytics:analyticsPage,learn:learnPage,about:aboutPage};

export function renderApplication(state,d,algorithms,selectedRoad,mobileOpen=false){
 if(state.page==='home') return homePage(state,d);
 const selected=state.page;
 const nav= NAV.map(group=>`<div class="nav-group"><div class="nav-group-label">${group.group}</div>${group.items.map(([id,title,icon])=>`<button class="nav-item ${selected===id?'active':''}" data-page="${id}" title="${title}">${iconSvg(icon)}<span class="nav-label">${title}</span>${selected===id?'<i class="nav-active-mark"></i>':''}</button>`).join('')}</div>`).join('');
 const status=state.routeStatus==='running'?'Running':state.routeStatus==='paused'?'Paused':state.routeStatus==='complete'?'Complete':'Ready';
 const view=selected==='overview'?overview(state,d):selected==='network'?networkPage(state,selectedRoad):selected==='dijkstra'?dijkstraPage(state,d,algorithms):selected==='mst'?mstPage(state,d,algorithms):selected==='resources'?resourcesPage(state,d):selected==='routes'?routesPage(state,d):selected==='schedule'?schedulePage(state,d):selected==='sets'?setsPage(state,d):selected==='priority'?priorityPage(d):selected==='analytics'?analyticsPage(state,d):selected==='learn'?learnPage(state,d):aboutPage();
 return `<div class="app-shell ${state.sidebarCollapsed?'sidebar-collapsed':''} ${mobileOpen?'mobile-open':''}"><aside class="sidebar"><div class="sidebar-brand"><button class="brand" data-page="overview"><span class="brand-mark">R<span>+</span></span><span class="brand-name">relief<span>net</span><small>OPERATIONS SIMULATOR</small></span></button><button class="sidebar-collapse" data-action="collapse-sidebar" aria-label="Collapse sidebar">${iconSvg('chevron')}</button></div><div class="project-tag"><span class="project-pulse"></span><span class="nav-label">ACADEMIC PROJECT</span><b>DEMO</b></div><nav class="side-nav" aria-label="Main navigation">${nav}</nav><div class="sidebar-bottom"><div class="sidebar-network-status"><span class="network-status-icon">${iconSvg('network')}</span><div class="nav-label"><b>Project network</b><small>5 nodes · ${state.roads.length} roads</small></div><span class="online-dot"></span></div><div class="sidebar-disclaimer nav-label">For academic demonstration only.<br/>Not for emergency dispatch.</div><button class="sidebar-home" data-page="home">← <span class="nav-label">Back to project home</span></button></div></aside><button class="mobile-scrim" data-action="close-mobile" aria-label="Close navigation"></button>
 <div class="main-shell"><header class="topbar"><div class="topbar-left"><button class="mobile-menu" data-action="mobile-menu" aria-label="Open navigation">${iconSvg('menu')}</button><div class="breadcrumbs"><span>ReliefNet</span><i>/</i><b>${PAGE_TITLES[selected]||'Project'}</b></div></div><div class="topbar-right"><span class="academic-label"><i></i> Academic simulation</span><div class="status-chip"><span class="status-pulse ${state.routeStatus==='running'?'is-running':''}"></span><span>Simulation ${status}</span></div>${button('Reset','reset-all','quiet','reset')}${button('Run simulation','run-complete','primary','play')}<button class="avatar" title="Local project workspace">RN</button></div></header><main class="main-content"><div class="page-content">${view}</div><footer class="app-footer"><span>RELIEFNET <i>·</i> GRAPH-BASED DISASTER RELIEF PLANNING</span><span>Academic simulation · Results update from local scenario inputs</span></footer></main></div></div>`;
}
