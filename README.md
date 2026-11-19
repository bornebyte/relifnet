# ReliefNet

ReliefNet is a local, browser-based academic simulation for the project “Graph-Based Disaster Relief Resource Allocation and Optimal Delivery System.” It demonstrates graph algorithms and resource assumptions; it is not an emergency dispatch system.

## Run locally

Requires Node.js 20 or newer. From this directory:

```sh
npm start
```

Then open [http://localhost:4173](http://localhost:4173). There are no runtime dependencies or API keys. Scenario edits are saved in browser local storage. Use **Reset** to restore the supplied project data. Analytics and schedule pages can be printed or saved as PDF from the browser.

## Project layout

- `js/data.js` — original graph, village assumptions, sample routes, and navigation.
- `js/algorithms.js` — Dijkstra with a min-heap, Kruskal with Union-Find, and route feasibility checks.
- `js/model.js` — shared scenario state, calculations, persistence, and simulation controls.
- `js/views/` — separate page views and shared network visualization.
- `css/styles.css` — responsive dark operations interface and print styles.

## Baseline values

The supplied data gives shortest distances W→A = 4 km, W→B = 6 km, W→C = 7 km, and W→D = 10 km. Kruskal selects BC (1), AB (2), CD (3), and WA (4), for a 10 km MST. The illustrative vehicle routes total 12 + 20 = 32 vehicle-km. At 2 kg per resident, the 2,000 modeled residents require 4,000 kg and the capacity-based lower bound is 2 vehicles at 2,000 kg each.

The example priority weights, beneficiary sets, route assignments, and travel estimates are educational assumptions, not validated operational guidance.
