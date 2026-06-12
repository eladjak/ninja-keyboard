import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ninja-keyboard-nine.vercel.app'

export const metadata: Metadata = {
  title: 'אודות | נינג׳ה מקלדת',
  description:
    'הסיפור מאחורי נינג׳ה מקלדת — אפליקציה חינמית ללימוד הקלדה עיוורת בעברית לילדים, שנבנתה בידי אלעד יעקובוביץ׳, מפתח ומורה לתכנות.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="border-b">
        <nav
          aria-label="ניווט עליון"
          className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3"
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/characters/ki-mascot.jpg"
              alt="קי — הקמע של נינג׳ה מקלדת"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg font-bold">נינג׳ה מקלדת</span>
          </Link>
          <Link
            href="/home"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold"
          >
            מתחילים לשחק
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <article>
          <h1 className="text-4xl font-extrabold">אודות נינג׳ה מקלדת</h1>

          <section className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">למה בכלל אפליקציית הקלדה?</h2>
            <p className="text-muted-foreground">
              ילדים היום גדלים מול מסכים, אבל רובם מקלידים בשתי אצבעות ומחפשים
              כל אות מחדש. הקלדה עיוורת משחררת את הראש: במקום לחשוב איפה האות,
              חושבים מה רוצים להגיד. זו מיומנות שמלווה אותם בבית הספר,
              באוניברסיטה ובכל מקצוע עתידי.
            </p>
            <p className="text-muted-foreground">
              רוב הכלים הקיימים ללימוד הקלדה בנויים לאנגלית, משעממים, או
              מלאים בפרסומות. נינג׳ה מקלדת נבנתה מהיסוד לעברית — מימין לשמאל,
              עם תכנים בעברית טבעית ועם סיפור שילדים ישראלים מתחברים אליו.
            </p>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold">מי בנה את זה?</h2>
            <p className="text-muted-foreground">
              <a
                href="https://www.eladjak.com"
                className="text-primary underline underline-offset-4"
              >
                אלעד יעקובוביץ׳
              </a>{' '}
              — מפתח Full-Stack ומורה לתכנות ממגדל העמק. אלעד מלמד ילדים ונוער
              תכנות וטכנולוגיה ביישובי הצפון, ובנה את נינג׳ה מקלדת מתוך הצורך
              שראה בכיתות: ילדים חכמים שנתקעים כי המקלדת מאטה אותם.
            </p>
            <p className="text-muted-foreground">
              עוד פרויקטים של אלעד אפשר למצוא ב
              <a
                href="https://www.fullstack-eladjak.co.il"
                className="text-primary underline underline-offset-4"
              >
                אתר הבית שלו
              </a>{' '}
              וב
              <a
                href="https://github.com/eladjak"
                className="text-primary underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold">העקרונות שלנו</h2>
            <ul className="text-muted-foreground list-inside list-disc space-y-2">
              <li>
                <strong className="text-foreground">חינם באמת</strong> — בלי
                פרסומות, בלי רכישות, בלי מלכודות.
              </li>
              <li>
                <strong className="text-foreground">פרטיות של ילדים</strong> —
                משחקים בלי הרשמה, וההתקדמות נשמרת על המכשיר בלבד.
              </li>
              <li>
                <strong className="text-foreground">עברית תחילה</strong> —
                RTL מלא, גופנים עבריים, ותכנים שנכתבו בעברית ולא תורגמו.
              </li>
              <li>
                <strong className="text-foreground">נגישות</strong> — ניווט
                מקלדת מלא, תמיכה בקוראי מסך ומצבי ניגודיות גבוהה.
              </li>
            </ul>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-bold">יצירת קשר</h2>
            <p className="text-muted-foreground">
              הערות, באגים או רעיונות? כתבו ל
              <a
                href="mailto:eladhiteclearning@gmail.com"
                className="text-primary underline underline-offset-4"
                dir="ltr"
              >
                eladhiteclearning@gmail.com
              </a>
              {' '}— כל הודעה נקראת.
            </p>
            <p>
              <Link
                href="/"
                className="text-primary font-semibold underline underline-offset-4"
              >
                חזרה לדף הבית
              </Link>
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
