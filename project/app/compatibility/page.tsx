'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TechCard } from '@/components/layout/shared';
import { cn } from '@/lib/utils';
import { graphNodes, graphEdges } from '@/services/graphEngine';
import type { GraphNode, GraphEdge } from '@/types';
import { Database, Network } from 'lucide-react';

const nodeColors: Record<GraphNode['type'], string> = {
  Laptop: '#d4a843',
  Motherboard: '#3fb950',
  Component: '#58a6ff',
  Connector: '#e3b341',
  Protocol: '#bc8cff',
  Adapter: '#f85149',
  Firmware: '#ff7b72',
};

const edgeColors: Record<GraphEdge['type'], string> = {
  SUPPORTS: '#3fb950',
  CONNECTS_TO: '#58a6ff',
  REQUIRES: '#e3b341',
  INCOMPATIBLE_WITH: '#f85149',
  ADAPTS_TO: '#d4a843',
  USES: '#bc8cff',
  POWERED_BY: '#ff7b72',
};

export default function CompatibilityPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <AppShell>
      <PageHeader
        badge="Graph Engine — Demo Data"
        title="Compatibility"
        subtitle="Neo4j-style compatibility graph. Nodes represent laptops, components, connectors, protocols, and adapters. Architecture supports direct Neo4j connection in production."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Graph */}
        <div className="lg:col-span-2">
          <TechCard className="corner-marks p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-primary" /> Compatibility Graph
              </h3>
              <span className="text-[10px] mono uppercase tracking-wider text-muted-foreground">
                {graphNodes.length} nodes · {graphEdges.length} edges
              </span>
            </div>
            <div className="relative aspect-[4/3] bg-card/30 rounded border border-border/40 overflow-hidden">
              <div className="absolute inset-0 grid-bg-sm opacity-20" />
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid meet">
                {/* Edges */}
                {graphEdges.map((edge) => {
                  const source = graphNodes.find((n) => n.id === edge.source);
                  const target = graphNodes.find((n) => n.id === edge.target);
                  if (!source || !target) return null;
                  const isDashed = edge.type === 'INCOMPATIBLE_WITH';
                  return (
                    <line
                      key={edge.id}
                      x1={source.x}
                      y1={source.y * 0.75}
                      x2={target.x}
                      y2={target.y * 0.75}
                      stroke={edgeColors[edge.type]}
                      strokeWidth={isDashed ? 0.3 : 0.4}
                      strokeDasharray={isDashed ? '1.5,1.5' : undefined}
                      opacity={0.5}
                    />
                  );
                })}
                {/* Nodes */}
                {graphNodes.map((node) => (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y * 0.75}
                      r={selectedNode?.id === node.id ? 2.8 : 2.2}
                      fill={nodeColors[node.type]}
                      opacity={selectedNode && selectedNode.id !== node.id ? 0.4 : 0.85}
                      style={{ transition: 'r 0.2s, opacity 0.2s' }}
                    />
                    <text
                      x={node.x}
                      y={node.y * 0.75 - 3.5}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize="1.8"
                      fontFamily="monospace"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(nodeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-[10px] mono uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className="text-muted-foreground">{type}</span>
                </div>
              ))}
            </div>
          </TechCard>
        </div>

        {/* Node properties */}
        <TechCard className="corner-marks p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-primary" /> Node Properties
          </h3>
          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Label</div>
                <div className="text-sm font-semibold mt-0.5">{selectedNode.label}</div>
              </div>
              <div>
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground">Type</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: nodeColors[selectedNode.type] }} />
                  <span className="text-sm">{selectedNode.type}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Properties</div>
                <div className="space-y-1.5">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] mono uppercase tracking-wider text-muted-foreground mb-2">Relationships</div>
                <div className="space-y-1.5">
                  {graphEdges
                    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge) => {
                      const other = graphNodes.find((n) =>
                        n.id === (edge.source === selectedNode.id ? edge.target : edge.source)
                      );
                      return (
                        <div key={edge.id} className="flex items-center gap-2 text-xs">
                          <span className="mono px-1.5 py-0.5 rounded" style={{ background: edgeColors[edge.type] + '20', color: edgeColors[edge.type] }}>
                            {edge.type}
                          </span>
                          <span className="text-muted-foreground truncate">{other?.label}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Network className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">Click a node in the graph to view its properties and relationships.</p>
            </div>
          )}
        </TechCard>
      </div>
    </AppShell>
  );
}
