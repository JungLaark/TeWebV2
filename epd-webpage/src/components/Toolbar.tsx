import React from 'react';

interface ToolbarProps {
  addShape: (shape: string, x: number, y: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ addShape }) => {
  return (
    <header className="Toolbar">
      <h2>Program Settings & Drawing Tools</h2>
      <button onClick={() => addShape('rectangle', 50, 50)}>Add Rectangle</button>
      <button onClick={() => addShape('circle', 100, 100)}>Add Circle</button>
      <button onClick={() => addShape('triangle', 150, 150)}>Add Triangle</button>
    </header>
  );
};

export default Toolbar;
