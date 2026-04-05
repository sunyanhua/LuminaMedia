export enum ReviewStep {
  EDIT_REVIEW = 'edit_review', // 编辑初审
  AI_REVIEW = 'ai_review', // AI检测
  MANAGER_REVIEW = 'manager_review', // 主管复审
  LEGAL_REVIEW = 'legal_review', // 法务终审
}