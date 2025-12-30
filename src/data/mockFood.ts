import type { Dish } from '../types/meal';

export const MOCK_FOOD_DATABASE: Dish[] = [
  { id: 'f1', name: '香煎鸡胸肉片', amount: '100g', calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 } },
  { id: 'f2', name: '全麦吐司', amount: '2片', calories: 150, macros: { protein: 6, carbs: 24, fat: 2 } },
  { id: 'f3', name: '美式咖啡', amount: '1杯', calories: 5, macros: { protein: 0, carbs: 0, fat: 0 } },
  { id: 'f4', name: '清蒸三文鱼', amount: '150g', calories: 310, macros: { protein: 30, carbs: 0, fat: 20 } },
  { id: 'f5', name: '水煮西兰花', amount: '200g', calories: 70, macros: { protein: 5, carbs: 14, fat: 1 } },
  { id: 'f6', name: '糙米饭', amount: '120g', calories: 135, macros: { protein: 3, carbs: 28, fat: 1 } },
  { id: 'f7', name: '虾仁豆腐煲', amount: '250g', calories: 240, macros: { protein: 28, carbs: 10, fat: 8 } },
  { id: 'f8', name: '清炒时蔬', amount: '200g', calories: 90, macros: { protein: 3, carbs: 8, fat: 6 } },
  // 备选项
  { id: 'r1', name: '水煮蛋 (2个)', amount: '110g', calories: 155, macros: { protein: 13, carbs: 1.2, fat: 10 } },
  { id: 'r2', name: '希腊酸奶', amount: '150g', calories: 140, macros: { protein: 15, carbs: 6, fat: 6 } },
  { id: 'r3', name: '煎鳕鱼排', amount: '180g', calories: 290, macros: { protein: 32, carbs: 0, fat: 12 } },
  { id: 'r4', name: '慢炖牛肉 (少油)', amount: '150g', calories: 330, macros: { protein: 35, carbs: 0, fat: 18 } },
  { id: 'r5', name: '黑椒牛柳', amount: '120g', calories: 280, macros: { protein: 26, carbs: 5, fat: 18 } },
  { id: 'r6', name: '烤鸡腿肉', amount: '150g', calories: 245, macros: { protein: 28, carbs: 0, fat: 14 } },
  { id: 'r7', name: '蒸南瓜', amount: '150g', calories: 80, macros: { protein: 2, carbs: 18, fat: 0.2 } },
  { id: 'r8', name: '煎豆腐', amount: '150g', calories: 120, macros: { protein: 12, carbs: 4, fat: 7 } }
];
