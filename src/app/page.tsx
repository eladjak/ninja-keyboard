import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ninja-keyboard.vercel.app'

export const metadata: Metadata = {
  title: 'נינג׳ה מקלדת — לומדים להקליד בעברית, בכיף',
  description:
    'אפליקציה חינמית שמלמדת ילדים בגילאי 6–16 הקלדה עיוורת בעברית: 20 שיעורים, זירת קרב, משחקים, מבחני מהירות וסיפור הרפתקאות עם נינג׳ות.',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'נינג׳ה מקלדת — לומדים להקליד בעברית, בכיף',
    description:
      'לימוד הקלדה עיוורת בעברית לילדים: שיעורים, משחקים, קרבות הקלדה וסיפור הרפתקאות.',
    url: SITE_URL,
    siteName: 'נינג׳ה מקלדת',
    locale: 'he_IL',
    type: 'website',
    images: [{ url: `${SITE_URL}/images/characters/ki-hero.jpg` }],
  },
}

const FAQ = [
  {
    q: 'למי מתאימה נינג׳ה מקלדת?',
    a: 'לילדים ונוער בגילאי 6 עד 16 שרוצים ללמוד הקלדה עיוורת בעברית. יש חמש ערכות נושא לפי גיל, והתרגול מתאים את עצמו לרמה של כל ילד וילדה.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'כלום. האפליקציה חינמית לגמרי, בלי פרסומות ובלי רכישות בתוך המשחק.',
  },
  {
    q: 'צריך להירשם כדי לשחק?',
    a: 'לא. נכנסים ומתחילים לשחק כאורחים — כל ההתקדמות נשמרת על המכשיר. חשבונות לסנכרון בין מכשירים יגיעו בהמשך.',
  },
  {
    q: 'מה לומדים באפליקציה?',
    a: 'הקלדה עיוורת בעברית מהבסיס: מיקום האצבעות, שורת הבית, ואז כל המקלדת. בנוסף — קיצורי מקלדת של Windows, מבחני מהירות, ומשחקי הקלדה שמחזקים דיוק ומהירות.',
  },
  {
    q: 'איך זה עובד על מסכים שונים?',
    a: 'האפליקציה עובדת בדפדפן על כל מחשב עם מקלדת פיזית. היא בנויה כ-PWA, כך שאפשר גם להתקין אותה כמו אפליקציה רגילה.',
  },
  {
    q: 'מה מיוחד בשיטת הלימוד?',
    a: 'במקום דפי תרגול משעממים יש סיפור הרפתקאות: קי הנינג׳ה ומאסטר זן נלחמים בווירוס ובבאגים, וכל שיעור שמסיימים מקדם את העלילה. נקודות ניסיון, תגים ותעודות שומרים על מוטיבציה.',
  },
]

function JsonLd() {
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'נינג׳ה מקלדת',
      alternateName: 'Ninja Keyboard',
      url: SITE_URL,
      inLanguage: 'he',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'נינג׳ה מקלדת',
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'he',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' },
      audience: {
        '@type': 'EducationalAudience',
        educationalRole: 'student',
        audienceType: 'ילדים ונוער בגילאי 6–16',
      },
      description:
        'אפליקציה חינמית ללימוד הקלדה עיוורת בעברית לילדים: 20 שיעורים, משחקים, זירת קרב וסיפור הרפתקאות.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'אלעד יעקובוביץ׳',
      alternateName: 'Elad Yaakobovitch',
      url: 'https://www.eladjak.com',
      jobTitle: 'מפתח Full-Stack ומורה לתכנות',
      email: 'mailto:eladhiteclearning@gmail.com',
      sameAs: [
        'https://www.fullstack-eladjak.co.il',
        'https://github.com/eladjak',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'נינג׳ה מקלדת — דף הבית',
      url: SITE_URL,
      inLanguage: 'he',
      datePublished: '2026-06-12',
      dateModified: '2026-06-12',
      about: 'לימוד הקלדה עיוורת בעברית לילדים ונוער',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

const FEATURES = [
  {
    title: '20 שיעורים מדורגים',
    text: 'משורת הבית ועד כל המקלדת — כל שיעור בונה על הקודם, עם משוב מיידי על כל הקלדה.',
    image: '/images/characters/heroes/sensei-zen-hero.jpg',
    alt: 'מאסטר זן, המורה החכם של נינג׳ה מקלדת',
    href: '/lessons',
  },
  {
    title: 'זירת קרב',
    text: 'קרבות הקלדה נגד באגים ווירוסים: קומבו, מגנים וכוחות מיוחדים. מקלידים נכון — מנצחים.',
    image: '/images/characters/heroes/rex-hero.jpg',
    alt: 'רקס, לוחם זירת הקרב',
    href: '/battle',
  },
  {
    title: 'משחקי הקלדה',
    text: 'גשם מילים, חיתוך נינג׳ה וזיכרון אותיות — תרגול שמרגיש כמו הפסקה.',
    image: '/images/characters/heroes/pixel-hero.jpg',
    alt: 'פיקסל, דמות המשחקים הצבעונית',
    href: '/games',
  },
  {
    title: 'מבחן מהירות',
    text: 'בודקים כמה מילים בדקה, שוברים שיאים אישיים ועוקבים אחרי ההתקדמות בגרפים.',
    image: '/images/characters/heroes/yuki-hero.jpg',
    alt: 'יוקי, אלופת המהירות',
    href: '/speed-test',
  },
  {
    title: 'סיפור הרפתקאות',
    text: 'קי הנינג׳ה יוצא להציל את עולם המקלדת מהווירוס. כל שיעור מקדם את העלילה.',
    image: '/images/characters/heroes/ki-hero.jpg',
    alt: 'קי, הנינג׳ה הצעיר גיבור הסיפור',
    href: '/story',
  },
  {
    title: 'קיצורי מקלדת',
    text: '22 קיצורי המקלדת החשובים של Windows, עם תרגול אינטראקטיבי לכל אחד.',
    image: '/images/characters/heroes/mika-hero.jpg',
    alt: 'מיקה, מומחית קיצורי המקלדת',
    href: '/shortcuts',
  },
]

const EXTERNAL_LINKS = [
  {
    href: 'https://he.wikipedia.org/wiki/%D7%94%D7%A7%D7%9C%D7%93%D7%94_%D7%A2%D7%99%D7%95%D7%95%D7%A8%D7%AA',
    label: 'הקלדה עיוורת בוויקיפדיה',
  },
  {
    href: 'https://www.fullstack-eladjak.co.il',
    label: 'אלעד יעקובוביץ׳ — פיתוח והדרכה',
  },
  { href: 'https://www.eladjak.com', label: 'הפורטפוליו של אלעד' },
  { href: 'https://github.com/eladjak', label: 'GitHub' },
  {
    href: 'https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps',
    label: 'מה זה PWA? (MDN)',
  },
]

export default function LandingPage() {
  return (
    <>
      <JsonLd />
      <div className="bg-background text-foreground min-h-dvh">
        <header className="border-b">
          <nav
            aria-label="ניווט עליון"
            className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Image
                src="/images/characters/ki-mascot.jpg"
                alt="קי — הקמע של נינג׳ה מקלדת"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-lg font-bold">נינג׳ה מקלדת</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/about"
                className="hover:text-primary underline-offset-4 hover:underline"
              >
                אודות
              </Link>
              <Link
                href="/home"
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-semibold transition-transform hover:scale-105"
              >
                מתחילים לשחק
              </Link>
            </div>
          </nav>
        </header>

        <main id="main-content" className="mx-auto max-w-5xl px-4">
          {/* Hero */}
          <section className="grid items-center gap-8 py-12 md:grid-cols-2 md:py-20">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.15] md:text-5xl">
                לומדים להקליד בעברית,
                <br />
                <span className="text-primary">כמו נינג׳ה</span> 🥷
              </h1>
              <p className="text-muted-foreground mt-4 text-lg">
                אפליקציה חינמית לילדים בגילאי 6–16: הקלדה עיוורת בעברית דרך
                שיעורים, משחקים, קרבות וסיפור הרפתקאות. בלי הרשמה — נכנסים
                ומתחילים.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/home"
                  className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-lg font-bold transition-transform hover:scale-105"
                >
                  מתחילים לשחק — חינם
                </Link>
                <Link
                  href="/lessons"
                  className="border-primary text-primary rounded-xl border-2 px-6 py-3 text-lg font-bold transition-transform hover:scale-105"
                >
                  לרשימת השיעורים
                </Link>
              </div>
              <p className="text-muted-foreground mt-4 text-sm tabular-nums">
                20 שיעורים · 3 משחקים · 5 ערכות נושא לפי גיל · 0 ₪
              </p>
            </div>
            <figure className="mx-auto w-full max-w-sm">
              <Image
                src="/images/characters/heroes/ki-hero.jpg"
                alt="קי, הנינג׳ה הצעיר של עולם המקלדת, בתנוחת פעולה"
                width={480}
                height={480}
                priority
                className="rounded-3xl shadow-xl"
              />
              <figcaption className="text-muted-foreground mt-2 text-center text-xs">
                קי — הנינג׳ה שילווה אתכם בכל שיעור
              </figcaption>
            </figure>
          </section>

          {/* Features */}
          <section aria-labelledby="features-heading" className="py-12">
            <h2
              id="features-heading"
              className="text-center text-3xl font-bold"
            >
              מה יש בפנים?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="bg-card rounded-2xl border p-5 shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={400}
                    height={300}
                    className="aspect-[4/3] w-full rounded-xl object-cover object-top"
                  />
                  <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {feature.text}
                  </p>
                  <Link
                    href={feature.href}
                    className="text-primary mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    נסו עכשיו
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* Parents & teachers */}
          <section
            aria-labelledby="parents-heading"
            className="bg-muted/40 my-12 rounded-3xl p-8"
          >
            <h2 id="parents-heading" className="text-3xl font-bold">
              להורים ולמורים
            </h2>
            <p className="text-muted-foreground mt-3 max-w-3xl">
              הקלדה עיוורת היא מיומנות יסוד — היא משחררת את הראש מהחיפוש אחרי
              מקשים ומפנה אותו לחשיבה ולכתיבה. נינג׳ה מקלדת נבנתה בידי מורה
              לתכנות מתוך עבודה יומיומית עם ילדים, והיא מקפידה על למידה הדרגתית
              אמיתית ולא רק על משחק.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="font-bold">פרטיות לפני הכול</h3>
                <h4 className="text-muted-foreground mt-1 text-sm font-medium">
                  בלי הרשמה ובלי איסוף מידע
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  משחקים כאורחים וההתקדמות נשמרת על המכשיר בלבד. אין פרסומות.
                </p>
              </div>
              <div>
                <h3 className="font-bold">מותאם לכל גיל</h3>
                <h4 className="text-muted-foreground mt-1 text-sm font-medium">
                  5 ערכות נושא, מגיל 6 עד 16
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  עיצוב, קצב ותכנים משתנים לפי קבוצת הגיל — משתיל ועד צמרת.
                </p>
              </div>
              <div>
                <h3 className="font-bold">נגישות מובנית</h3>
                <h4 className="text-muted-foreground mt-1 text-sm font-medium">
                  ניווט מקלדת מלא וקורא מסך
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  בנויה לפי WCAG 2.2 AA, כולל מצב ניגודיות גבוהה וגופן מותאם.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="py-12">
            <h2 id="faq-heading" className="text-center text-3xl font-bold">
              שאלות נפוצות
            </h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="bg-card group rounded-xl border p-4"
                >
                  <summary className="marker:text-primary cursor-pointer text-lg font-semibold">
                    {item.q}
                  </summary>
                  <p className="text-muted-foreground mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* External resources */}
          <section aria-labelledby="links-heading" className="py-8">
            <h2 id="links-heading" className="text-xl font-bold">
              קוראים עוד
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {EXTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <footer className="border-t">
          <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-8 text-center text-sm">
            <p>
              נבנה באהבה בידי{' '}
              <a
                href="https://www.eladjak.com"
                className="text-primary underline underline-offset-4"
              >
                אלעד יעקובוביץ׳
              </a>{' '}
              — מפתח Full-Stack ומורה לתכנות, מגדל העמק, ישראל
            </p>
            <p>
              יצירת קשר:{' '}
              <a
                href="mailto:eladhiteclearning@gmail.com"
                className="text-primary underline underline-offset-4"
                dir="ltr"
              >
                eladhiteclearning@gmail.com
              </a>
            </p>
            <p>
              <Link href="/about" className="underline underline-offset-4">
                אודות הפרויקט
              </Link>{' '}
              ·{' '}
              <Link
                href="/accessibility"
                className="underline underline-offset-4"
              >
                הצהרת נגישות
              </Link>
            </p>
            <p className="text-xs">© 2026 נינג׳ה מקלדת. כל הזכויות שמורות.</p>
          </div>
        </footer>
      </div>
    </>
  )
}
