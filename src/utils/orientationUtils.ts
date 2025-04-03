import { ModelType } from '../types';

export const isPortrait = (model: ModelType): boolean => {
  const portraitModels = [
    ModelType.M74, ModelType.M74R, ModelType.M133R,
    ModelType.M75, ModelType.M75R, ModelType.M15RA,
    ModelType.M15RY_BC, ModelType.M75B, ModelType.M75RB,
    ModelType.M75RY_HC
  ];

  return portraitModels.includes(model);
};
