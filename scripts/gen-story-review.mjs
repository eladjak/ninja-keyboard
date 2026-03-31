import fs from 'fs'

const charNames = {ki:'קי',mika:'מיקה',yuki:'יוקי',luna:'לונה',noa:'נועה',rex:'רקס',pixel:'פיקסל',senseiZen:'סנסיי זן',kai:'קאי',sakura:'סאקורה',glitch:'גליצ׳',shadow:'שאדו',storm:'סטורם',blaze:'בלייז',virus:'וירוס',phantom:'פאנטום',barak:'ברק',masterBeat:'מאסטר ביט',bug:'באג',zara:'זארה',keres:'קרס',block:'בלוק',lens:'לאנס',raz:'רז'}
const charColors = {ki:'#6C5CE7',mika:'#FF6B6B',yuki:'#74B9FF',luna:'#A29BFE',noa:'#00B894',rex:'#E17055',pixel:'#00CEC9',senseiZen:'#FAD390',kai:'#81ecec',sakura:'#FDA7DF',glitch:'#FD79A8',shadow:'#636E72',storm:'#0984E3',blaze:'#D63031',virus:'#FF0000',phantom:'#2D3436',barak:'#F9CA24',masterBeat:'#FFEAA7',bug:'#BADC58',zara:'#FF1744',keres:'#880E4F',block:'#FF6D00',lens:'#00BFA5',raz:'#9b59b6'}
const chTitles = ['','התחלת המסע','הדוג׳ו הראשי','ממלכת הבאגים','התחרות הגדולה','המלחמה','איסוף השברים']
const newIds = ['virus','sakura','barak','phantom','master','zara','keres']

const chapters = [1,2,3,4,5,6].map(n => {
  const content = fs.readFileSync(`src/data/story/chapter-${n}.ts`, 'utf-8')
  const beats = []
  const lines = content.split('\n')
  let cur = {}
  for (const line of lines) {
    const idM = line.match(/id:\s*'([^']+)'/)
    const chM = line.match(/character:\s*'([^']+)'/)
    const moM = line.match(/mood:\s*'([^']+)'/)
    const exM = line.match(/expression:\s*'([^']+)'/)
    // Handle text with apostrophes: match text: ' then capture until ',$ or just ',$
    const txM = line.match(/text:\s*'(.+)/)
    if (idM) cur.id = idM[1]
    if (chM) cur.character = chM[1]
    if (moM) cur.mood = moM[1]
    if (exM) cur.expression = exM[1]
    if (txM) {
      let txt = txM[1]
      // Remove trailing ', or just '
      txt = txt.replace(/'\s*,?\s*$/, '')
      cur.text = txt
    }
    if (cur.character && cur.text && (line.trim() === '},' || line.trim() === '}')) {
      beats.push({...cur})
      cur = {}
    }
  }
  return {chapter: n, title: chTitles[n], beats}
})

const total = chapters.reduce((s,c) => s + c.beats.length, 0)

let h = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>הסיפור המלא — נינג׳ה מקלדת</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Heebo',sans-serif;background:#0d0b1a;color:#e0e0e0;line-height:1.8;padding:1.5rem}
.container{max-width:900px;margin:0 auto}
h1{font-size:2.5rem;color:#6C5CE7;text-align:center;margin-bottom:.3rem}
.subtitle{text-align:center;color:#888;margin-bottom:2rem}
.stats{display:flex;justify-content:center;gap:1.5rem;margin:1.5rem 0;flex-wrap:wrap}
.stat{background:#1a1530;border-radius:10px;padding:1rem 1.5rem;text-align:center}
.stat .n{font-size:2rem;font-weight:900;color:#6C5CE7}
.stat .l{color:#888;font-size:.85rem}
details{margin:1rem 0;background:#1a1530;border-radius:12px;border:1px solid #6C5CE730}
summary{padding:1rem 1.5rem;cursor:pointer;font-size:1.3rem;font-weight:700;color:#00B894;list-style:none}
summary::before{content:'▶ ';transition:.2s}
details[open] summary::before{content:'▼ '}
.beat{display:flex;gap:1rem;padding:.8rem 1.5rem;border-bottom:1px solid #ffffff08;align-items:flex-start}
.beat:hover{background:#ffffff05}
.avatar{min-width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0}
.content{flex:1}
.charname{font-weight:700;font-size:.9rem;margin-left:.5rem}
.mood-tag{font-size:.7rem;padding:1px 6px;border-radius:3px;background:#ffffff10;color:#888;margin-right:.3rem}
.dialog{margin-top:.3rem;font-size:1.05rem;line-height:1.7}
.new-badge{background:#FF174430;color:#FF1744;font-size:.7rem;padding:1px 6px;border-radius:3px;margin-right:.3rem;font-weight:700}
.legend{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin:1.5rem 0}
.legend-item{display:flex;align-items:center;gap:.3rem;font-size:.8rem}
.legend-dot{width:14px;height:14px;border-radius:50%}
.ch-info{padding:0 1.5rem .5rem;color:#888;font-size:.85rem}
.footer{text-align:center;margin-top:2rem;padding:1rem;color:#555;border-top:1px solid #ffffff10}
</style>
</head>
<body>
<div class="container">
<h1>📖 הסיפור המלא</h1>
<p class="subtitle">נינג׳ה מקלדת — 6 פרקים, ${total} ביטים של דיאלוג</p>`

// Stats
h += '<div class="stats">'
chapters.forEach(c => { h += `<div class="stat"><div class="n">${c.beats.length}</div><div class="l">פרק ${c.chapter}</div></div>` })
h += `<div class="stat"><div class="n" style="color:#00B894">${total}</div><div class="l">סה"כ</div></div></div>`

// Legend
const usedChars = new Set()
chapters.forEach(c => c.beats.forEach(b => usedChars.add(b.character)))
h += '<div class="legend">'
usedChars.forEach(ch => {
  h += `<div class="legend-item"><div class="legend-dot" style="background:${charColors[ch]||'#666'}"></div>${charNames[ch]||ch}</div>`
})
h += '</div>'

// Chapters
chapters.forEach(c => {
  const charCount = {}
  c.beats.forEach(b => { charCount[b.character] = (charCount[b.character]||0)+1 })
  const charSummary = Object.entries(charCount).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `${charNames[k]||k} (${v})`).join(', ')

  h += `<details${c.chapter===1?' open':''}><summary>פרק ${c.chapter}: ${c.title} — ${c.beats.length} ביטים</summary>`
  h += `<div class="ch-info">דמויות: ${charSummary}</div>`

  c.beats.forEach(b => {
    const name = charNames[b.character] || b.character
    const color = charColors[b.character] || '#666'
    const isNew = b.id && newIds.some(nid => b.id.includes(nid))
    const safeText = (b.text || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    h += `<div class="beat"><div class="avatar" style="background:${color}">${name.substring(0,2)}</div>`
    h += `<div class="content"><span class="charname" style="color:${color}">${name}</span>`
    if (b.mood) h += `<span class="mood-tag">${b.mood}</span>`
    if (isNew) h += `<span class="new-badge">חדש!</span>`
    h += `<div class="dialog">${safeText}</div></div></div>`
  })
  h += '</details>'
})

h += `<div class="footer">נוצר ע"י Claude Code — 30 במרץ 2026<br>נינג׳ה מקלדת 🥷📖</div></div></body></html>`

fs.writeFileSync('docs/reviews/story-review-full.html', h)
console.log(`Done! ${total} beats, fixed apostrophes`)
