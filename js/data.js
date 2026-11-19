export const ORIGINAL_ROADS = [
  { id:'W-A', a:'W', b:'A', km:4, open:true },
  { id:'A-B', a:'A', b:'B', km:2, open:true },
  { id:'A-C', a:'A', b:'C', km:5, open:true },
  { id:'B-C', a:'B', b:'C', km:1, open:true },
  { id:'B-D', a:'B', b:'D', km:7, open:true },
  { id:'C-D', a:'C', b:'D', km:3, open:true },
  { id:'W-B', a:'W', b:'B', km:6, open:false }
];

export const NODES = [
  { id:'W', name:'Warehouse', kind:'warehouse', x:96, y:210 },
  { id:'A', name:'Village A', kind:'village', x:270, y:118 },
  { id:'B', name:'Village B', kind:'village', x:470, y:104 },
  { id:'C', name:'Village C', kind:'village', x:470, y:312 },
  { id:'D', name:'Village D', kind:'village', x:710, y:215 }
];

export const ORIGINAL_VILLAGES = [
  { id:'A', name:'Village A', population:400, unload:10 },
  { id:'B', name:'Village B', population:600, unload:15 },
  { id:'C', name:'Village C', population:300, unload:8 },
  { id:'D', name:'Village D', population:700, unload:12 }
];

export const ORIGINAL_ROUTES = [
  { id:1, label:'Vehicle 01', color:'#50d9cb', serves:['A','B'], path:['W','A','B','A','W'] },
  { id:2, label:'Vehicle 02', color:'#72a7ff', serves:['C','D'], path:['W','A','B','C','D','C','B','A','W'] }
];

export const NAV = [
  { group:'OPERATIONS', items:[
    ['overview','Overview','grid'], ['network','Network builder','network'], ['dijkstra','Shortest paths','route'], ['mst','Minimum spanning tree','tree']
  ]},
  { group:'PLANNING', items:[
    ['resources','Resource allocation','box'], ['routes','Route planning','truck'], ['schedule','Delivery timeline','clock'], ['sets','Set theory','venn'], ['priority','Priority analysis','bars']
  ]},
  { group:'PROJECT', items:[
    ['analytics','Results & analytics','chart'], ['learn','Learn the mathematics','book'], ['about','About project','info']
  ]}
];

export const PAGE_TITLES = Object.fromEntries(NAV.flatMap(g=>g.items.map(([id,title])=>[id,title])));

export function freshState() {
  return {
    page:'home', roads:structuredClone(ORIGINAL_ROADS),
    villages:structuredClone(ORIGINAL_VILLAGES), demandPerPerson:2, vehicleCapacity:2000, speed:30,
    sets:{ food:1200, water:1500, overlap:700 }, source:'W', selectedDestination:'D',
    sidebarCollapsed:false, routeProgress:0, routeStatus:'idle',
    activity:[{ time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), text:'Simulation workspace initialized', type:'system' }]
  };
}
