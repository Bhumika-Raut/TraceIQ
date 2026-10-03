import React, { useEffect, useRef, useState } from 'react';
import { GraphData, GraphNode, GraphLink } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Maximize2, Info, Filter, ShieldAlert } from 'lucide-react';

interface GraphViewProps {
  data: GraphData;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
  riskFilter: string;
  setRiskFilter: (filter: string) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  data,
  onSelectNode,
  selectedNodeId,
  riskFilter,
  setRiskFilter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Transform state for pan/zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  // Simulation nodes with physics coordinates
  const simNodesRef = useRef<(GraphNode & { x: number; y: number; vx: number; vy: number })[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Color map for entity types
  const typeColors: Record<string, string> = {
    user: '#a855f7',     // Purple
    account: '#3b82f6',  // Blue
    device: '#f59e0b',   // Amber / Orange
    ip: '#10b981',       // Emerald
    merchant: '#ec4899', // Pink
    unknown: '#64748b',  // Slate
  };

  // Initialize node layout position
  useEffect(() => {
    if (!data.nodes.length) return;

    const width = 900;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const numNodes = data.nodes.length;
    simNodesRef.current = data.nodes.map((n, idx) => {
      const angle = (idx / numNodes) * 2 * Math.PI;
      const radius = 160 + (idx % 3) * 60 + Math.random() * 40;
      return {
        ...n,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });
  }, [data]);

  // Simple physics simulation step
  useEffect(() => {
    let active = true;

    const step = () => {
      if (!active) return;
      const nodes = simNodesRef.current;
      if (!nodes.length) return;

      const nodeMap = new Map(nodes.map(n => [n.id, n]));

      // 1. Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) / dist * 0.15;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // 2. Attraction along links
      for (const link of data.links) {
        const src = nodeMap.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
        const tgt = nodeMap.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
        if (src && tgt) {
          const dx = tgt.x - src.x;
          const dy = tgt.y - src.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 120) * 0.008;
          src.vx += dx * force;
          src.vy += dy * force;
          tgt.vx -= dx * force;
          tgt.vy -= dy * force;
        }
      }

      // 3. Central gravity & dampening
      const centerX = 450;
      const centerY = 275;
      for (const n of nodes) {
        if (n === draggedNode) continue;
        n.vx += (centerX - n.x) * 0.001;
        n.vy += (centerY - n.y) * 0.001;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx;
        n.y += n.vy;
      }

      renderCanvas();
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [data, zoom, pan, selectedNodeId, hoveredNode, draggedNode]);

  // Render loop for canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Grid pattern background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Apply Pan & Zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const nodes = simNodesRef.current;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw Links
    for (const link of data.links) {
      const src = nodeMap.get(typeof link.source === 'string' ? link.source : (link.source as any).id);
      const tgt = nodeMap.get(typeof link.target === 'string' ? link.target : (link.target as any).id);
      if (!src || !tgt) continue;

      const isConnectedToSelected = selectedNodeId && (src.id === selectedNodeId || tgt.id === selectedNodeId);

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      
      if (isConnectedToSelected) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // Draw Nodes
    for (const node of nodes) {
      const isSelected = node.id === selectedNodeId;
      const isHovered = hoveredNode?.id === node.id;
      const isHighRisk = node.risk_score >= 70;
      const baseColor = typeColors[node.type] || typeColors.unknown;

      // Glow effect for high risk or selected
      if (isHighRisk || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 24 : 20, 0, 2 * Math.PI);
        ctx.fillStyle = isHighRisk ? 'rgba(239, 68, 68, 0.25)' : 'rgba(168, 85, 247, 0.25)';
        ctx.fill();
      }

      // Outer border
      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 16 : 13, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : (isHovered ? 2 : 1.5);
      ctx.strokeStyle = isHighRisk ? '#ef4444' : (isSelected ? '#ffffff' : '#0f172a');
      ctx.stroke();

      // Inner risk indicator dot
      if (isHighRisk) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Node Label
      ctx.font = isSelected ? '600 11px Plus Jakarta Sans' : '400 10px Plus Jakarta Sans';
      ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#e2e8f0' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + (isSelected ? 28 : 24));
    }

    ctx.restore();
  };

  // Handle Mouse Events for Pan/Zoom/Select
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert click coordinates taking pan and zoom into account
    const worldX = (clientX - pan.x) / zoom;
    const worldY = (clientY - pan.y) / zoom;

    // Check hit on nodes
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= 18;
    });

    if (hitNode) {
      setDraggedNode(hitNode);
      onSelectNode(hitNode.id);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const worldX = (clientX - pan.x) / zoom;
    const worldY = (clientY - pan.y) / zoom;

    if (draggedNode) {
      draggedNode.x = worldX;
      draggedNode.y = worldY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Hover check
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) <= 18;
    });

    setHoveredNode(hitNode || null);
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(0.4, prev * zoomFactor), 2.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Risk Filter Buttons */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl backdrop-blur-md shadow-lg">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {['all', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                riskFilter === lvl
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="pointer-events-auto flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs">
          {Object.entries(typeColors).filter(([k]) => k !== 'unknown').map(([type, color]) => (
            <div key={type} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize text-slate-300 font-medium text-[11px]">{type}</span>
            </div>
          ))}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setZoom(z => Math.min(z * 1.2, 2.5))}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z * 0.8, 0.4))}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
            title="Reset Pan/Zoom"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Hover Info Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between space-x-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-900/40 text-purple-300 border border-purple-700/40">
              {hoveredNode.type}
            </span>
            <span className={`text-[11px] font-bold ${
              hoveredNode.risk_score >= 70 ? 'text-red-400' :
              hoveredNode.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              Risk Score: {hoveredNode.risk_score}/100
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-100">{hoveredNode.id}</p>
          <p className="text-[11px] text-slate-400">{hoveredNode.label}</p>
          <p className="mt-1 text-[10px] text-purple-400">Click node to inspect investigation panel →</p>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        width={900}
        height={550}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-[550px] cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
};
