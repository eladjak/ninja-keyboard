import type { DialogStoryBeat } from '@/types/story'

/**
 * Opening story beat: Ki meets Sensei Zen for the first time.
 * Triggered at the beginning of the game (first lesson).
 */
export const TUTORIAL_INTRO_BEAT: DialogStoryBeat = {
  id: 'tutorial-intro',
  trigger: { type: 'lesson-complete', lessonId: 'tutorial-0' },
  lines: [
    {
      id: 'intro-1',
      character: 'ki',
      text: 'וואו... איפה אני? המקום הזה נראה כמו דוג\'ו עתיק!',
      type: 'dialog',
      mood: 'mysterious',
      expression: 'surprised',
    },
    {
      id: 'intro-2',
      character: 'senseiZen',
      text: 'שלום, צעיר. חיכיתי לך. אני סנסיי זן, שומר המקלדת.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
    },
    {
      id: 'intro-3',
      character: 'ki',
      text: 'שומר המקלדת? זה נשמע... מוזר.',
      type: 'thought',
      mood: 'funny',
      expression: 'thinking',
    },
    {
      id: 'intro-4',
      character: 'senseiZen',
      text: 'המקלדת היא כלי נשק רב-עוצמה. מי ששולט בה — שולט בעולם הדיגיטלי כולו. אבל כוח גדול דורש אחריות גדולה.',
      type: 'dialog',
      mood: 'epic',
      expression: 'idle',
    },
    {
      id: 'intro-5',
      character: 'senseiZen',
      text: 'מוכן להתחיל את האימון? הדרך ארוכה, אבל אני מאמין בך.',
      type: 'dialog',
      mood: 'heartwarming',
      expression: 'happy',
      choices: [
        {
          id: 'choice-ready',
          text: '!מוכן! בוא נתחיל',
          relationshipEffect: { character: 'senseiZen', delta: 5 },
        },
        {
          id: 'choice-nervous',
          text: 'קצת מפחיד... אבל אני רוצה לנסות',
          relationshipEffect: { character: 'senseiZen', delta: 3 },
        },
      ],
    },
  ],
}
