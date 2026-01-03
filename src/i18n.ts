import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      'zh-CN': {
        translation: {
          'wake_word': '嘿 nomi',
          'listening': '我在听...',
          'processing': '思考中...',
          'error_mic': '请允许麦克风权限',
          'greeting_morning': '早安！今天也要吃得健康哦。',
          'greeting_night': '晚安，祝你做个好梦。',
          'remaining_kcal': '你今天还剩 {{count}} 千卡额度。',
          'over_kcal': '哎呀，今天已经超标 {{count}} 千卡了。',
          'scan_action': '好的，打开相机',
          'meal_plan_action': '正在为您查看餐单',
          'ai_fallback': '抱歉，我没听清，请再说一遍。',
          'ai_intro': '我是 Nomi，你的 AI 营养助手。',
        }
      },
      'en-US': {
        translation: {
          'wake_word': 'hi nomi',
          'listening': 'Listening...',
          'processing': 'Thinking...',
          'error_mic': 'Microphone access required',
          'greeting_morning': 'Good morning! Eat healthy today.',
          'greeting_night': 'Good night, sweet dreams.',
          'remaining_kcal': 'You have {{count}} kcal remaining today.',
          'over_kcal': 'Oops, you are {{count}} kcal over limit.',
          'scan_action': 'Opening camera...',
          'meal_plan_action': 'Checking your meal plan...',
          'ai_fallback': 'Sorry, I missed that. Say again?',
          'ai_intro': 'I am Nomi, your AI nutrition assistant.',
        }
      }
    }
  });

export default i18n;
