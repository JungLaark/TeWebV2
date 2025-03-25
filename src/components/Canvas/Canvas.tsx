import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';

// ...existing code...

return (
  <div 
    ref={containerRef}
    className="canvas-container"
    style={{ 
      width: `${width}px`, 
      height: `${height}px`,
      maxWidth: '100%',
      maxHeight: '100%'
    }}
  >
    <div 
      className="canvas-wrapper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center',
          cursor: getCursor()
        }}
      />
      {selectionBox.start && selectionBox.end && (
        <div
          className="selection-box"
          style={{
            left: Math.min(selectionBox.start.x, selectionBox.end.x),
            top: Math.min(selectionBox.start.y, selectionBox.end.y),
            width: Math.abs(selectionBox.end.x - selectionBox.start.x),
            height: Math.abs(selectionBox.end.y - selectionBox.start.y)
          }}
        />
      )}
      <div className="scale-indicator">
        {Math.round(scale * 100)}%
      </div>
    </div>
  </div>
);

// ...rest of the code...
