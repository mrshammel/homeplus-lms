'use client';

import React, { useState, useRef, useEffect } from 'react';

interface InteractiveHeartWordProps {
  word: string;
  teachingScript?: string | null;
}

export function InteractiveHeartWord({ word, teachingScript }: InteractiveHeartWordProps) {
  // Letters split
  const letters = word.split('');
  
  // Drag and Drop State for Elkonin boxes
  const [boxes, setBoxes] = useState<(string | null)[]>(new Array(letters.length).fill(null));
  const [bank, setBank] = useState<string[]>([]);
  const [draggedLetter, setDraggedLetter] = useState<{ letter: string, sourceIdx: number | null } | null>(null);

  // Initialize randomized bank
  useEffect(() => {
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setBank(shuffled);
  }, [word]);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Canvas Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3b82f6'; // blue
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, letter: string, sourceIdx: number | null) => {
    setDraggedLetter({ letter, sourceIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropToBox = (e: React.DragEvent, boxIdx: number) => {
    e.preventDefault();
    if (!draggedLetter) return;

    const newBoxes = [...boxes];
    const newBank = [...bank];

    // If box already has a letter, swap it back to bank
    if (newBoxes[boxIdx]) {
      newBank.push(newBoxes[boxIdx] as string);
    }

    // Place letter in box
    newBoxes[boxIdx] = draggedLetter.letter;

    // Remove from source
    if (draggedLetter.sourceIdx !== null) {
      // It came from the bank
      newBank.splice(draggedLetter.sourceIdx, 1);
    }

    setBoxes(newBoxes);
    setBank(newBank);
    setDraggedLetter(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Tappable Sounds (Dots vs Hearts)
  const [annotations, setAnnotations] = useState<('dot' | 'heart' | null)[]>(new Array(letters.length).fill(null));

  const toggleAnnotation = (idx: number) => {
    const newAnn = [...annotations];
    if (newAnn[idx] === null) newAnn[idx] = 'dot';
    else if (newAnn[idx] === 'dot') newAnn[idx] = 'heart';
    else newAnn[idx] = null;
    setAnnotations(newAnn);
  };

  return (
    <div className="flex flex-col gap-8 p-6 bg-slate-50 rounded-2xl shadow-sm border border-slate-200">
      
      {/* 1. Tappable Word (Hearts under sounds) */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">1. Tap the sounds</h3>
        <div className="flex justify-center gap-4">
          {letters.map((char, idx) => (
            <div key={idx} className="flex flex-col items-center cursor-pointer select-none" onClick={() => toggleAnnotation(idx)}>
              <span className="text-6xl font-bold text-slate-800">{char}</span>
              <div className="h-8 mt-2 flex items-center justify-center">
                {annotations[idx] === 'dot' && <div className="w-4 h-4 bg-green-500 rounded-full" />}
                {annotations[idx] === 'heart' && <div className="text-red-500 text-3xl transition-transform animate-bounce">❤️</div>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-4">Tap a letter to toggle a green decodable dot or a red irregular heart.</p>
      </div>

      <hr className="border-slate-200" />

      {/* 2. Elkonin Boxes Drag and Drop */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">2. Build the word</h3>
        
        {/* Boxes */}
        <div className="flex justify-center gap-2 mb-8">
          {boxes.map((boxChar, idx) => (
            <div 
              key={idx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropToBox(e, idx)}
              className="w-16 h-16 border-4 border-slate-300 rounded-lg flex items-center justify-center text-4xl font-bold bg-white text-slate-800 transition-colors hover:border-blue-400"
            >
              {boxChar}
            </div>
          ))}
        </div>

        {/* Tile Bank */}
        <div className="flex justify-center gap-2 flex-wrap min-h-[4rem] p-4 bg-slate-200 rounded-xl">
          {bank.map((char, idx) => (
            <div
              key={`bank-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, char, idx)}
              className="w-12 h-12 bg-white border border-slate-300 rounded-md flex items-center justify-center text-2xl font-bold shadow-sm cursor-grab active:cursor-grabbing hover:bg-blue-50 transition-colors select-none"
            >
              {char}
            </div>
          ))}
          {bank.length === 0 && <span className="text-slate-400 italic flex items-center">All letters placed!</span>}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 3. Drawing Canvas */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold text-slate-700">3. Write the word</h3>
          <button 
            onClick={clearCanvas}
            className="text-sm px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 font-medium transition-colors"
          >
            Clear Board
          </button>
        </div>
        <div className="flex justify-center bg-slate-200 p-2 rounded-xl">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border-2 border-slate-300 rounded-lg cursor-crosshair shadow-inner bg-white w-full max-w-[600px] touch-none"
          />
        </div>
      </div>

      {/* Teacher Script Reference */}
      {teachingScript && (
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg text-sm">
          <span className="font-semibold block mb-1">Teacher Script:</span>
          {teachingScript}
        </div>
      )}

    </div>
  );
}
