import { calendarTexturesByLevel, defaultModel, calendarTexturesByLevel1 } from './textures.js';
//1
export function getRandomModelForLevel(level) {
  const models = calendarTexturesByLevel[level];
  if (!models || models.length === 0) return defaultModel;

  const totalChance = models.reduce((sum, model) => sum + model.chance, 0);
  let rnd = Math.random() * totalChance;

  for (const model of models) {
    if (rnd < model.chance) return model;
    rnd -= model.chance;
  }

  return models[models.length - 1] || defaultModel;
}

export function getRandomModelForLevel1(level) {
    const models = calendarTexturesByLevel1[level];
    if (!models || models.length === 0) return defaultModel;
  
    const totalChance = models.reduce((sum, model) => sum + model.chance, 0);
    let rnd = Math.random() * totalChance;
  
    for (const model of models) {
      if (rnd < model.chance) return model;
      rnd -= model.chance;
    }
  
    return models[models.length - 1] || defaultModel;
  }
