/** Feedback system barrel exports */

export type { EmotionalState, EmotionalIndicators, Trend } from './emotional-detector'
export { detectEmotionalState, computeIndicators } from './emotional-detector'

export type { FeedbackMessage, FeedbackType } from './feedback-engine'
export {
  getEmotionalFeedback,
  getKeystrokeFeedback,
  getWordCompleteFeedback,
  getLessonEndFeedback,
  getReturnFeedback,
} from './feedback-engine'
