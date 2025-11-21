// Color mapping utilities
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'URGENT': return '#ff4d4f';
    case 'PRIORITY': return '#faad14';
    case 'ROUTINE': return '#52c41a';
    default: return '#1890ff';
  }
};

export const getOutcomeColor = (outcome) => {
  if (outcome?.includes('BLUE')) return '#52c41a';
  if (outcome?.includes('RED')) return '#ff4d4f';
  return '#faad14';
};

export const getOutcomeText = (outcome) => {
  if (outcome?.includes('BLUE_VICTORY')) return 'Перемога синіх';
  if (outcome?.includes('RED_VICTORY')) return 'Перемога червоних';
  if (outcome?.includes('DRAW')) return 'Нічия';
  return outcome || 'В процесі';
};