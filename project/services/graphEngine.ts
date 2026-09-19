import type { GraphNode, GraphEdge } from '@/types';

export const graphNodes: GraphNode[] = [
  { id: 'laptop-t14', label: 'ThinkPad T14 Gen 3', type: 'Laptop', x: 50, y: 10, properties: { brand: 'Lenovo', repairability: '8.7' } },
  { id: 'mb-t14', label: '5B21C12345', type: 'Motherboard', x: 50, y: 28, properties: { socket: 'M.2 x2, SODIMM x2' } },
  { id: 'ssd-2230', label: 'M.2 2230 SSD', type: 'Component', x: 25, y: 48, properties: { interface: 'PCIe Gen4 x4' } },
  { id: 'ssd-2280', label: 'M.2 2280 SSD', type: 'Component', x: 75, y: 48, properties: { interface: 'PCIe Gen4 x4' } },
  { id: 'ram-sodimm', label: 'DDR4 SODIMM', type: 'Component', x: 50, y: 48, properties: { speed: '3200MHz' } },
  { id: 'wifi-ax201', label: 'AX201 Wi-Fi', type: 'Component', x: 15, y: 68, properties: { protocol: 'Wi-Fi 6' } },
  { id: 'wifi-be200', label: 'BE200 Wi-Fi 7', type: 'Component', x: 85, y: 68, properties: { protocol: 'Wi-Fi 7' } },
  { id: 'conn-m2', label: 'M.2 Edge Connector', type: 'Connector', x: 35, y: 68, properties: { pins: '75' } },
  { id: 'conn-edp', label: 'eDP 40pin', type: 'Connector', x: 65, y: 68, properties: { pins: '40' } },
  { id: 'proto-pcie4', label: 'PCIe Gen4', type: 'Protocol', x: 25, y: 85, properties: { lanes: 'x4' } },
  { id: 'proto-wifi7', label: 'Wi-Fi 7', type: 'Protocol', x: 85, y: 85, properties: { spec: '802.11be' } },
  { id: 'adapter-m2', label: 'M.2 2230→2280 Adapter', type: 'Adapter', x: 50, y: 85, properties: { compatibility: 'HIGH' } },
  { id: 'fw-whitelist', label: 'BIOS Whitelist', type: 'Firmware', x: 50, y: 95, properties: { restricts: 'non-OEM Wi-Fi' } },
];

export const graphEdges: GraphEdge[] = [
  { id: 'e1', source: 'laptop-t14', target: 'mb-t14', type: 'USES' },
  { id: 'e2', source: 'mb-t14', target: 'ssd-2230', type: 'SUPPORTS' },
  { id: 'e3', source: 'mb-t14', target: 'ram-sodimm', type: 'SUPPORTS' },
  { id: 'e4', source: 'mb-t14', target: 'wifi-ax201', type: 'SUPPORTS' },
  { id: 'e5', source: 'ssd-2230', target: 'conn-m2', type: 'CONNECTS_TO' },
  { id: 'e6', source: 'ssd-2280', target: 'conn-m2', type: 'CONNECTS_TO' },
  { id: 'e7', source: 'ssd-2280', target: 'ssd-2230', type: 'INCOMPATIBLE_WITH' },
  { id: 'e8', source: 'adapter-m2', target: 'ssd-2280', type: 'ADAPTS_TO' },
  { id: 'e9', source: 'mb-t14', target: 'proto-pcie4', type: 'SUPPORTS' },
  { id: 'e10', source: 'wifi-be200', target: 'wifi-ax201', type: 'INCOMPATIBLE_WITH' },
  { id: 'e11', source: 'wifi-be200', target: 'proto-wifi7', type: 'REQUIRES' },
  { id: 'e12', source: 'mb-t14', target: 'fw-whitelist', type: 'REQUIRES' },
  { id: 'e13', source: 'fw-whitelist', target: 'wifi-be200', type: 'INCOMPATIBLE_WITH' },
  { id: 'e14', source: 'mb-t14', target: 'conn-edp', type: 'CONNECTS_TO' },
  { id: 'e15', source: 'adapter-m2', target: 'ssd-2230', type: 'ADAPTS_TO' },
];

export function getGraph() {
  return { nodes: graphNodes, edges: graphEdges };
}
