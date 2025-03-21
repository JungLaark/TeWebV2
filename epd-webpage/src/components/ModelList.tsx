import React from 'react';

interface Model {
  name: string;
  width: number;
  height: number;
}

interface ModelListProps {
  models: Model[];
  onModelChange: (modelName: string) => void;
}

const ModelList: React.FC<ModelListProps> = ({ models, onModelChange }) => {
  return (
    <nav className="ModelList">
      <ul>
        {models.map((model, index) => (
          <li key={index} onClick={() => onModelChange(model.name)}>
            {model.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ModelList;
