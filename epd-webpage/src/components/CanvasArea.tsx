import React from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { Rect, Circle, Triangle } from 'fabric';

interface CanvasAreaProps {
  width: number;
  height: number;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ width, height }) => {
  const { editor, onReady } = useFabricJSEditor();

  React.useEffect(() => {
    if (editor) {
      editor.canvas.setWidth(width);
      editor.canvas.setHeight(height);
      editor.canvas.backgroundColor = '#f0f0f0';
      editor.canvas.renderAll();
    }
  }, [editor, width, height]);

  const addShapeToCanvas = (shape: string) => {
    if (!editor) return;
    let newShape;
    switch (shape) {
      case 'rectangle':
        newShape = new Rect({
          left: 100,
          top: 100,
          fill: 'red',
          width: 60,
          height: 70
        });
        break;
      case 'circle':
        newShape = new Circle({
          left: 100,
          top: 100,
          fill: 'green',
          radius: 50
        });
        break;
      case 'triangle':
        newShape = new Triangle({
          left: 100,
          top: 100,
          fill: 'blue',
          width: 60,
          height: 70
        });
        break;
      default:
        return;
    }
    editor.canvas.add(newShape);
  };

  return (
    <div className="CanvasArea">
      <FabricJSCanvas className="canvas" onReady={onReady} />
    </div>
  );
};

export default CanvasArea;
