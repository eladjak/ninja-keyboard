import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF'),
  password: z.string().min(1, '\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05E1\u05D9\u05E1\u05DE\u05D4'),
})

export const registerSchema = z.object({
  displayName: z.string().min(2, '\u05E9\u05DD \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 2 \u05EA\u05D5\u05D5\u05D9\u05DD'),
  email: z.string().email('\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF'),
  password: z.string().min(6, '\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD'),
})

export const studentProfileSchema = z.object({
  displayName: z.string().min(1, '\u05E0\u05D0 \u05DC\u05D4\u05D6\u05D9\u05DF \u05E9\u05DD'),
  avatarId: z.string().min(1),
  classId: z.string().optional(),
})
