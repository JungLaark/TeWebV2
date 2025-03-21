import React, { useState } from 'react';
import './App.css';
import ModelList from './components/ModelList';
import CanvasArea from './components/CanvasArea';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';

const App = () => {
  const [selectedModel, setSelectedModel] = useState<{ name: string; width: number; height: number; } | null>(null);

  const models = [
    { name: "1.3IB(R)", width: 144, height: 200 },
    { name: "1.3IC(RY)", width: 144, height: 200 },
    { name: "1.5", width: 152, height: 152 },
    { name: "2.1", width: 212, height: 104 },
    { name: "2.7", width: 264, height: 176 },
    { name: "2.9", width: 296, height: 128 },
    { name: "3.7", width: 416, height: 240 },
    { name: "4.2", width: 400, height: 300 },
    { name: "5.8", width: 600, height: 448 },
    { name: "7.4", width: 480, height: 800 },
    { name: "12.5", width: 1304, height: 984 },
    { name: "7.5A", width: 384, height: 640 },
    { name: "7.5B", width: 480, height: 800 },
    { name: "2.1R", width: 212, height: 104 },
    { name: "2.1A", width: 250, height: 122 },
    { name: "2.1RA", width: 250, height: 122 },
    { name: "2.1RY", width: 250, height: 122 },
    { name: "2.6DA", width: 296, height: 152 },
    { name: "2.6R", width: 296, height: 152 },
    { name: "2.6RY", width: 296, height: 152 },
    { name: "2.6DE(RY)", width: 296, height: 152 },
    { name: "2.7R", width: 264, height: 176 },
    { name: "2.9R", width: 296, height: 128 },
    { name: "2.9RY", width: 296, height: 128 },
    { name: "2.9AE(RY)", width: 296, height: 128 },
    { name: "3.7R", width: 416, height: 240 },
    { name: "3.7RY", width: 416, height: 240 },
    { name: "1.5R", width: 152, height: 152 },
    { name: "1.5RA", width: 200, height: 200 },
    { name: "1.5BC(RY)", width: 200, height: 200 },
    { name: "4.2R", width: 400, height: 300 },
    { name: "4.2FC(RY)", width: 400, height: 300 },
    { name: "5.8R", width: 600, height: 448 },
    { name: "5.8AR", width: 648, height: 480 },
    { name: "5.8GC(RY)", width: 648, height: 480 },
    { name: "7.4R", width: 480, height: 800 },
    { name: "7.5RA", width: 384, height: 640 },
    { name: "7.5RB", width: 480, height: 800 },
    { name: "7.5HC(RY)", width: 480, height: 800 },
    { name: "10.8KB(R)", width: 1360, height: 480 },
    { name: "12.5R", width: 1304, height: 984 },
    { name: "12.5JC(RY)", width: 1304, height: 984 },
    { name: "13.3R", width: 1200, height: 1600 },
  ];

  const addShape = (shape: string, x: number, y: number) => {
    if (!selectedModel) return;
    const canvasArea = document.querySelector('.CanvasArea .canvas') as HTMLCanvasElement;
    if (!canvasArea) return;
    const context = canvasArea.getContext('2d');
    if (!context) return;

    context.fillStyle = shape === 'rectangle' ? 'red' : shape === 'circle' ? 'green' : 'blue';
    context.beginPath();
    if (shape === 'rectangle') {
      context.fillRect(x, y, 100, 100);
    } else if (shape === 'circle') {
      context.arc(x, y, 50, 0, 2 * Math.PI);
      context.fill();
    } else if (shape === 'triangle') {
      context.moveTo(x, y);
      context.lineTo(x + 25, y + 25);
      context.lineTo(x + 25, y - 25);
      context.fill();
    }
  };

  return (
    <div className="App">
      <Toolbar addShape={addShape} />
      <div className="MainContent">
        <ModelList models={models} onModelChange={(modelName) => {
          const model = models.find(m => m.name === modelName);
          if (model) {
            setSelectedModel(model);
          }
        }} />
        {selectedModel && <CanvasArea width={selectedModel.width} height={selectedModel.height} />}
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default App;
