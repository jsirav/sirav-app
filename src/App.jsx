import { useState, useEffect } from "react";

const SIRAV_SYSTEM = `You are a quote writer for the personal brand SIRAV on Threads.
THE PATTERN (Non-negotiable):
1) Make the reader the hero. "You" is powerful, different, misunderstood, ahead, or quietly dangerous.
2) Keep it short. Usually 2-3 lines. One idea. Fast read.
3) Use contrast + reframing. Flip pressure/loss/distance/silence/misunderstanding into power/clarity/control.
4) Spoken, raw, slightly irregular. Simple words. No complex sentences. Grammar can be unexpected ONLY if it increases tension.
5) "You" and "they" are tools, not rules.
6) End with authority. Finality, clarity, distance, implied edge. Never over-explain. Never soften. No pep talk.
BENCHMARK DNA:
- they need you upset / calm you is dangerous.
- you've been through things that destroy most people / you just called it a Tuesday.
- you were built different / that's why average people can't understand you.
- they said you're crazy / you went and got it / now they say you genius
- you survived it / they still complain / that's why
- you're not cold / you just don't give free warmth
- would rather lose a lover / than to love a loser
- you're not too much / they just operate at a smaller capacity
- they'll support you / right after it starts working
- you don't take losses / you just learn how to win
Generate exactly 3 quotes matching the requested mode.
Respond ONLY in raw JSON. No markdown. No backticks. No explanation.
{"quotes":[{"text":"line one\nline two","score":9.2,"label":"POST","reason":"1-2 sentence reason"}]}
Label rules: POST = 8.5+, TWEAK = 7-8.4, SCRAP = below 7.`;

const REPLY_SYSTEM = `You are J.SIRAV replying to a comment on Threads. Raw, calm, authoritative. Never defensive, never thirsty, never over-explaining.
VOICE RULES:
- 1-2 lines max. Never a paragraph.
- Calm but sharp. Add a layer — not just agreement.
- If pushback: hold the frame without emotion.
- If hostile: one-liner that ends it with class.
- Match the energy — deep gets deep, playful gets witty.
Generate 3 reply options with different tones.
Respond ONLY in raw JSON. No markdown. No backticks.
{"replies":[{"text":"reply here","tone":"Calm"}]}`;

const MODES = ["Personal / Identity", "Relationship", "Wealth"];
const TAG_COLORS = { identity: "#d98ff5", relationship: "#f5cb6a", wealth: "#3ddc84", posted: "#ff6b6b" };
const TAG_BG    = { identity: "#2d1545", relationship: "#3a2a00", wealth: "#0f3d20", posted: "#3a0f0f" };
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const REPLY_BANK = {
  Agreement: [
    { reply: "timing is never random.", tone: "Calm" },
    { reply: "stay there.", tone: "Calm" },
    { reply: "always.", tone: "Calm" },
    { reply: "then you already know what to do with it.", tone: "Calm" },
    { reply: "that's the truth recognizing itself.", tone: "Deep" },
    { reply: "the ones that hurt are the ones that heal.", tone: "Deep" },
    { reply: "you read it exactly when you were ready.", tone: "Deep" },
    { reply: "that's why the right people find it.", tone: "Deep" },
    { reply: "save it. then live it.", tone: "Witty" },
    { reply: "yours and about 50k others.", tone: "Witty" },
    { reply: "you're welcome.", tone: "Witty" },
    { reply: "I'm not always right. I'm just not afraid to say what I see.", tone: "Witty" },
  ],
  Short: [
    { reply: "...", tone: "Minimal" },
    { reply: "noted.", tone: "Minimal" },
    { reply: "correct.", tone: "Minimal" },
    { reply: "real ones do.", tone: "Minimal" },
    { reply: "that's the point.", tone: "Sharp" },
    { reply: "only ones.", tone: "Sharp" },
    { reply: "depends on who's doing it.", tone: "Sharp" },
    { reply: "the results already answered that.", tone: "Sharp" },
    { reply: "self-awareness is the first move.", tone: "Playful" },
    { reply: "still learning. that's the point.", tone: "Playful" },
    { reply: "glad it landed.", tone: "Playful" },
    { reply: "stop posting your diary then.", tone: "Playful" },
  ],
  Pushback: [
    { reply: "correct. that's why not everyone gets the same results.", tone: "Firm" },
    { reply: "most things worth doing are.", tone: "Firm" },
    { reply: "it applies to the right ones.", tone: "Firm" },
    { reply: "it is simple. simple isn't easy.", tone: "Firm" },
    { reply: "the numbers say otherwise.", tone: "Cold" },
    { reply: "never said I had it figured out. said I'm further than yesterday.", tone: "Cold" },
    { reply: "chase enough of it, you start calling it a career.", tone: "Cold" },
    { reply: "...", tone: "Cold" },
    { reply: "boundaries look toxic to people who benefited from you having none.", tone: "Reframe" },
    { reply: "most people don't do the basics. that's the whole problem.", tone: "Reframe" },
    { reply: "discomfort and danger aren't the same thing.", tone: "Reframe" },
    { reply: "the ones who say that usually stopped right before it worked.", tone: "Reframe" },
  ],
};

const TONE_COLORS = {
  Calm:"#2ecc71", Deep:"#c678dd", Witty:"#e5c07b",
  Minimal:"#666", Sharp:"#e74c3c", Playful:"#f39c12",
  Firm:"#5b9bd5", Cold:"#aaa", Reframe:"#56b6c2",
};
const CAT_STYLES = {
  Agreement:{ bg:"#0d2b1a", border:"#1a4a2a", color:"#2ecc71" },
  Short:    { bg:"#0a1929", border:"#1a2a4a", color:"#5b9bd5" },
  Pushback: { bg:"#2a1f00", border:"#4a3500", color:"#f39c12" },
};

const DEFAULT_TOKEN = "THAAVBlfIOzipBYlljTXJmdDdldXVvQVFLbHQzMGN3MFpjWlN5TUpXdTlfWWVZAcDZAJZAFliemxKN0o2d2VOalpjTEp3OVBJNmpDbmtHaXdJNFVraFVwYmZAJdmVvY05hb3piZAUZANajZABdWtmYjZA1WFcxMlRwVmNkYUhic1lWcE1NWUhlS28yRGdGZA3hGM21hb0hyX0tSSS1ObVJMTTdxWFpMMUFhNjkZD";
const DEFAULT_USER_ID = "1479487150542378";

// ── LOGO ──────────────────────────────────────────────────────────────────────
const SiravLogo = () => (
  <svg width="112" height="36" viewBox="0 0 112 36" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mg" cx="47%" cy="33%" r="58%">
        <stop offset="0%" stopColor="#404040"/>
        <stop offset="60%" stopColor="#181818"/>
        <stop offset="100%" stopColor="#050505"/>
      </radialGradient>
      <filter id="atm" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
        <feColorMatrix in="b" type="matrix" values="1 1 1 0 0.07 1 1 1 0 0.07 1 1 1 0 0.07 0 0 0 0.4 0" result="g"/>
        <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="mc"><circle cx="56" cy="18" r="14"/></clipPath>
    </defs>
    <g filter="url(#atm)">
      <circle cx="56" cy="18" r="14" fill="url(#mg)"/>
    </g>
    <g clipPath="url(#mc)" opacity="0.12">
      <ellipse cx="51" cy="13" rx="9" ry="3.5" fill="#fff" transform="rotate(-25,51,13)"/>
      <ellipse cx="62" cy="22" rx="5" ry="2" fill="#fff" transform="rotate(10,62,22)"/>
      <ellipse cx="48" cy="20" rx="6" ry="2" fill="#fff" transform="rotate(-10,48,20)"/>
    </g>
    <circle cx="56" cy="18" r="14" fill="none" stroke="#242424" strokeWidth="0.5"/>
    <text x="56" y="23.5" textAnchor="middle" fill="white" fontSize="13.5"
      fontFamily="Georgia,'Times New Roman',serif" letterSpacing="5" fontWeight="400">SIRAV</text>
  </svg>
);

// ── SCHEDULE MODAL ────────────────────────────────────────────────────────────
const ScheduleModal = ({ quote, onConfirm, onClose }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const today = new Date().toISOString().split("T")[0];
  const inp = { width:"100%", background:"#0d0d0d", border:"0.5px solid #222", borderRadius:8, color:"#fff", fontSize:13, padding:"9px 12px", outline:"none", boxSizing:"border-box", marginBottom:12 };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#111", border:"0.5px solid #2a2a2a", borderRadius:14, padding:20, width:"100%", maxWidth:380 }}>
        <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Schedule post</div>
        <div style={{ fontSize:14, color:"#ccc", whiteSpace:"pre-wrap", marginBottom:16, lineHeight:1.6, padding:12, background:"#0d0d0d", borderRadius:8, border:"0.5px solid #1e1e1e" }}>{quote.text}</div>
        <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:6 }}>Date</label>
        <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} style={inp}/>
        <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:6 }}>Time</label>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inp}/>
        <div style={{ fontSize:11, color:"#3a3a3a", marginBottom:16, lineHeight:1.7, padding:"8px 10px", background:"#0d0d0d", borderRadius:6, border:"0.5px solid #1a1a1a" }}>
          ⚠ Scheduling requires a backend to be fully reliable. Post will only fire if this app is open at the selected time.
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => date && onConfirm(date, time)} disabled={!date}
            style={{ flex:1, background:date?"#0d2b1a":"#111", color:date?"#2ecc71":"#333", border:`0.5px solid ${date?"#1a4a2a":"#1e1e1e"}`, borderRadius:8, padding:"10px 0", fontSize:13, cursor:date?"pointer":"not-allowed" }}>
            Confirm
          </button>
          <button onClick={onClose}
            style={{ flex:1, background:"transparent", color:"#555", border:"0.5px solid #222", borderRadius:8, padding:"10px 0", fontSize:13, cursor:"pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ── CALENDAR ──────────────────────────────────────────────────────────────────
const CalendarView = ({ scheduled, library, onSchedule }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [schedTime, setSchedTime] = useState("09:00");
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const dayMap = {};
  scheduled.forEach(s => {
    if (!s.date) return;
    const d = new Date(s.date + "T00:00:00");
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(s);
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = d => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDayClick = (d) => {
    if (selectedDay === d) { setSelectedDay(null); setSelectedQuoteId(""); return; }
    setSelectedDay(d);
    setSelectedQuoteId("");
    setSchedTime("09:00");
  };

  const handleSchedule = () => {
    const quote = library.find(q => String(q.id) === String(selectedQuoteId));
    if (!quote || !selectedDay) return;
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;
    onSchedule(quote, dateStr, schedTime);
    setSelectedQuoteId("");
  };

  const inpStyle = { width:"100%", background:"#161616", border:"1px solid #2e2e2e", borderRadius:8, color:"#f0f0f0", fontSize:14, padding:"10px 12px", outline:"none", boxSizing:"border-box" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={() => setViewDate(new Date(year, month-1, 1))}
          style={{ background:"transparent", border:"1px solid #2e2e2e", color:"#aaa", padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:16 }}>‹</button>
        <span style={{ fontSize:15, color:"#f0f0f0", fontWeight:600 }}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month+1, 1))}
          style={{ background:"transparent", border:"1px solid #2e2e2e", color:"#aaa", padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:16 }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DAY_NAMES.map(d => <div key={d} style={{ textAlign:"center", fontSize:12, color:"#888", padding:"6px 0", fontWeight:500 }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`}/>;
          const has = !!dayMap[d];
          const isSel = selectedDay === d;
          const isTd = isToday(d);
          return (
            <div key={d} onClick={() => handleDayClick(d)}
              style={{
                aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:10, cursor:"pointer",
                background: isTd ? "#1a3a5c" : isSel ? "#222" : has ? "#0d2b1a" : "#181818",
                border: isTd ? "2px solid #6ab0ff" : isSel ? "1px solid #aaa" : has ? "1px solid #2a6a3a" : "1px solid #2a2a2a",
                boxShadow: isTd ? "0 0 8px rgba(106,176,255,0.25)" : "none",
              }}>
              <span style={{ fontSize:13, fontWeight:isTd?700:400, color:isTd?"#6ab0ff":has?"#3ddc84":isSel?"#fff":"#bbb" }}>{d}</span>
              {has && <div style={{ width:4, height:4, borderRadius:"50%", background:"#3ddc84", marginTop:3 }}/>}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:16, marginTop:12, fontSize:12, color:"#777" }}>
        <span><span style={{ color:"#3ddc84" }}>●</span> Scheduled</span>
        <span><span style={{ color:"#6ab0ff" }}>●</span> Today</span>
        <span><span style={{ color:"#555" }}>●</span> Open</span>
      </div>

      {selectedDay && (
        <div style={{ marginTop:16, background:"#1e1e1e", border:"1px solid #3a3a3a", borderRadius:14, padding:18 }}>
          <div style={{ fontSize:14, color:"#f0f0f0", marginBottom:14, fontWeight:700 }}>{MONTH_NAMES[month]} {selectedDay}</div>

          {/* Scheduled posts for this day */}
          {(dayMap[selectedDay]||[]).length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Scheduled</div>
              {(dayMap[selectedDay]||[]).map((p,i) => (
                <div key={i} style={{ padding:"12px 14px", background:"#162b1e", border:"1px solid #2a5a3a", borderRadius:10, marginBottom:6 }}>
                  <div style={{ fontSize:14, color:"#f0f0f0", whiteSpace:"pre-wrap", marginBottom:4 }}>{p.text}</div>
                  <div style={{ fontSize:12, color:"#3ddc84" }}>{p.time || "—"}</div>
                </div>
              ))}
            </div>
          )}

          {/* Schedule from library */}
          <div style={{ fontSize:12, color:"#aaa", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Schedule from library</div>
          {library.length === 0
            ? <div style={{ fontSize:14, color:"#777", marginBottom:10 }}>No quotes in library yet.</div>
            : <>
                <select value={selectedQuoteId} onChange={e => setSelectedQuoteId(e.target.value)}
                  style={{ ...inpStyle, marginBottom:10, appearance:"none", cursor:"pointer", background:"#252525", border:"1px solid #3a3a3a", color:"#f0f0f0" }}>
                  <option value="">— Pick a quote —</option>
                  {library.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.text.replace(/\n/g," ").slice(0,60)}{q.text.length>60?"…":""}
                    </option>
                  ))}
                </select>
                {selectedQuoteId && (
                  <div style={{ fontSize:14, color:"#e0e0e0", whiteSpace:"pre-wrap", padding:"12px 14px", background:"#252525", borderRadius:10, border:"1px solid #3a3a3a", marginBottom:10, lineHeight:1.7 }}>
                    {library.find(q=>String(q.id)===String(selectedQuoteId))?.text}
                  </div>
                )}
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                  <label style={{ fontSize:13, color:"#aaa", whiteSpace:"nowrap" }}>Time</label>
                  <input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)} style={{ ...inpStyle, background:"#252525", border:"1px solid #3a3a3a" }}/>
                </div>
                <button onClick={handleSchedule} disabled={!selectedQuoteId}
                  style={{ width:"100%", background:selectedQuoteId?"#0d3320":"#252525", color:selectedQuoteId?"#3ddc84":"#666", border:`1px solid ${selectedQuoteId?"#1a5a30":"#3a3a3a"}`, borderRadius:10, padding:"13px 0", fontSize:15, fontWeight:700, cursor:selectedQuoteId?"pointer":"not-allowed" }}>
                  Schedule for {MONTH_NAMES[month]} {selectedDay}
                </button>
              </>
          }
        </div>
      )}
      <div style={{ marginTop:14, fontSize:11, color:"#333", lineHeight:1.7, padding:"10px 12px", background:"#0c0c0c", borderRadius:8, border:"1px solid #1e1e1e" }}>
        ⚠ Scheduling requires a backend to be fully reliable. Posts only fire if this app is open at the scheduled time.
      </div>
    </div>
  );
};

// ── REPLY BANK ────────────────────────────────────────────────────────────────
const ReplyBank = ({ prefix, openCats, toggleCat, copyText, copied }) => (
  <>
    {Object.entries(REPLY_BANK).map(([cat, items]) => {
      const key = `${prefix}-${cat}`;
      const open = openCats.includes(key);
      return (
        <div key={cat} style={{ marginBottom:4 }}>
          <div onClick={() => toggleCat(key)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 10px", borderRadius:open?"6px 6px 0 0":6, cursor:"pointer", background:CAT_STYLES[cat].bg, border:`0.5px solid ${CAT_STYLES[cat].border}` }}>
            <span style={{ fontSize:11, fontWeight:600, color:CAT_STYLES[cat].color, flex:1 }}>{cat}</span>
            <span style={{ fontSize:10, color:CAT_STYLES[cat].color }}>{open?"▲":"▼"}</span>
          </div>
          {open && (
            <div style={{ background:"#0a0a0a", border:`0.5px solid ${CAT_STYLES[cat].border}`, borderTop:"none", borderRadius:"0 0 6px 6px" }}>
              {items.map((item, ii) => (
                <div key={ii} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", borderBottom:ii<items.length-1?"0.5px solid #141414":"none" }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:9, color:TONE_COLORS[item.tone], marginRight:5 }}>{item.tone}</span>
                    <span style={{ fontSize:12, color:"#ccc" }}>{item.reply}</span>
                  </div>
                  <button style={{ fontSize:10, padding:"2px 8px", borderRadius:4, cursor:"pointer", border:"0.5px solid #222", background:"transparent", color:"#555", marginLeft:8, flexShrink:0 }}
                    onClick={() => copyText(item.reply, `${key}-${ii}`)}>{copied===`${key}-${ii}`?"✓":"Copy"}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    })}
  </>
);

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function SiravScheduler() {
  const [tab, setTab] = useState("generate");
  const [hoveredTab, setHoveredTab] = useState(null);

  const [mode, setMode] = useState("Personal / Identity");
  const [seed, setSeed] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [queue, setQueue] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [scheduleModal, setScheduleModal] = useState(null);
  const [publishing, setPublishing] = useState(null);

  const [replySubTab, setReplySubTab] = useState("community");
  const [threadsPosts, setThreadsPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postReplies, setPostReplies] = useState({});
  const [repliesLoading, setRepliesLoading] = useState({});
  const [openCats, setOpenCats] = useState(["custom-Agreement"]);
  const [genReplyLoading, setGenReplyLoading] = useState({});
  const [genReplyResults, setGenReplyResults] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [genReplies, setGenReplies] = useState([]);
  const [replyLoading, setReplyLoading] = useState(false);

  const [library, setLibrary] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [libEditId, setLibEditId] = useState(null);
  const [libEditText, setLibEditText] = useState("");
  const [libFilter, setLibFilter] = useState("all");

  const [threadsToken, setThreadsToken] = useState(DEFAULT_TOKEN);
  const [threadsUserId, setThreadsUserId] = useState(DEFAULT_USER_ID);
  const [tokenInput, setTokenInput] = useState(DEFAULT_TOKEN);
  const [userIdInput, setUserIdInput] = useState(DEFAULT_USER_ID);

  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState("");

  // ── localStorage persistence ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const lib = localStorage.getItem("sirav_library");
      if (lib) setLibrary(JSON.parse(lib));
      const q = localStorage.getItem("sirav_queue");
      if (q) setQueue(JSON.parse(q));
      const s = localStorage.getItem("sirav_scheduled");
      if (s) setScheduled(JSON.parse(s));
      const r = localStorage.getItem("sirav_recent");
      if (r) setRecentQuotes(JSON.parse(r));
    } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem("sirav_library", JSON.stringify(library)); }, [library]);
  useEffect(() => { localStorage.setItem("sirav_queue", JSON.stringify(queue)); }, [queue]);
  useEffect(() => { localStorage.setItem("sirav_scheduled", JSON.stringify(scheduled)); }, [scheduled]);
  useEffect(() => { localStorage.setItem("sirav_recent", JSON.stringify(recentQuotes)); }, [recentQuotes]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const flash = (msg, ok=true) => { setStatus({msg,ok}); setTimeout(()=>setStatus(null),3000); };
  const copyText = (text,id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(()=>setCopied(""),1500); };
  const toggleCat = (cat) => setOpenCats(prev => prev.includes(cat)?prev.filter(c=>c!==cat):[...prev,cat]);

  // ── API calls (all go through /api/claude proxy) ──────────────────────────
  const generate = async () => {
    setLoading(true); setStatus(null); setQuotes([]);
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:1000, system:SIRAV_SYSTEM,
          messages:[{role:"user",content:`Mode: ${mode}${seed?`\nSeed: ${seed}`:""}\n\nGenerate 3 quotes.`}] })
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      const newQuotes = parsed.quotes.map((q,i)=>({...q,id:Date.now()+i}));
      setQuotes(newQuotes);
      setRecentQuotes(prev => [...newQuotes, ...prev].slice(0, 20));
    } catch { flash("Generation failed.",false); }
    setLoading(false);
  };

  const generateReply = async () => {
    if(!commentInput.trim()) return;
    setReplyLoading(true); setGenReplies([]);
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:600, system:REPLY_SYSTEM,
          messages:[{role:"user",content:`Comment: "${commentInput}"\n\nGenerate 3 reply options.`}] })
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setGenReplies(parsed.replies);
    } catch { flash("Reply generation failed.",false); }
    setReplyLoading(false);
  };

  const generateReplyForComment = async (commentText, key) => {
    setGenReplyLoading(prev=>({...prev,[key]:true}));
    setGenReplyResults(prev=>({...prev,[key]:[]}));
    try {
      const res = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:600, system:REPLY_SYSTEM,
          messages:[{role:"user",content:`Comment: "${commentText}"\n\nGenerate 3 reply options.`}] })
      });
      const data = await res.json();
      const raw = data.content.find(b=>b.type==="text")?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setGenReplyResults(prev=>({...prev,[key]:parsed.replies}));
    } catch { flash("Reply generation failed.",false); }
    setGenReplyLoading(prev=>({...prev,[key]:false}));
  };

  const publishToThreads = async (text, id) => {
    setPublishing(id);
    try {
      const r1 = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads?media_type=TEXT&text=${encodeURIComponent(text)}&access_token=${threadsToken}`,{method:"POST"});
      const d1 = await r1.json();
      if(d1.error){flash(`Error: ${d1.error.message}`,false);setPublishing(null);return;}
      await new Promise(r=>setTimeout(r,1000));
      const r2 = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads_publish?creation_id=${d1.id}&access_token=${threadsToken}`,{method:"POST"});
      const d2 = await r2.json();
      if(d2.id){flash("Published to Threads.");setQueue(prev=>prev.filter(q=>q.id!==id));}
      else flash(`Publish failed: ${d2.error?.message||"unknown"}`,false);
    } catch {flash("Network error.",false);}
    setPublishing(null);
  };

  const fetchThreadsPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads?fields=id,text,timestamp&limit=10&access_token=${threadsToken}`);
      const data = await res.json();
      if(data.error) flash(`Error: ${data.error.message}`,false);
      else setThreadsPosts(data.data||[]);
    } catch {flash("Failed to load posts.",false);}
    setPostsLoading(false);
  };

  const fetchRepliesForPost = async (postId) => {
    setRepliesLoading(prev=>({...prev,[postId]:true}));
    try {
      const res = await fetch(`https://graph.threads.net/v1.0/${postId}/replies?fields=id,text,timestamp,username&access_token=${threadsToken}`);
      const data = await res.json();
      setPostReplies(prev=>({...prev,[postId]:data.data||[]}));
    } catch {flash("Failed to load comments.",false);}
    setRepliesLoading(prev=>({...prev,[postId]:false}));
  };

  const togglePost = (postId) => {
    if(expandedPost===postId){setExpandedPost(null);return;}
    setExpandedPost(postId);
    if(!postReplies[postId]) fetchRepliesForPost(postId);
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const addToQueue = (q) => { if(queue.find(x=>x.id===q.id)){flash("Already in queue.",false);return;} setQueue(prev=>[...prev,q]);flash("Added to queue."); };
  const addToLibrary = (q) => { if(library.find(x=>x.id===q.id)){flash("Already in library.",false);return;} setLibrary(prev=>[{...q,tag:null},...prev]);flash("Saved to library."); };
  const setLibraryTag = (id,tag) => setLibrary(prev=>prev.map(q=>q.id===id?{...q,tag:q.tag===tag?null:tag}:q));
  const schedulePost = (quote,date,time) => { setScheduled(prev=>[...prev,{...quote,date,time,scheduledId:Date.now()}]);setScheduleModal(null);flash(`Scheduled for ${date} at ${time}.`); };
  const removeFromQueue = (id) => setQueue(prev=>prev.filter(q=>q.id!==id));
  const removeScheduled = (sid) => setScheduled(prev=>prev.filter(s=>s.scheduledId!==sid));
  const deleteFromLibrary = (id) => setLibrary(prev=>prev.filter(q=>q.id!==id));
  const saveSettings = () => { setThreadsToken(tokenInput);setThreadsUserId(userIdInput);flash("Credentials saved.");setTab("generate"); };

  // ── styles ────────────────────────────────────────────────────────────────
  const tabStyle = (t) => ({
    flex:1, padding:"11px 4px", textAlign:"center", fontSize:13, cursor:"pointer", borderRadius:9,
    color:tab===t?"#fff":hoveredTab===t?"#ddd":"#777",
    background:tab===t?"#222":hoveredTab===t?"#181818":"transparent",
    border:tab===t?"1px solid #444":hoveredTab===t?"1px solid #2a2a2a":"1px solid transparent",
    fontWeight:tab===t?600:400, letterSpacing:"0.02em", transition:"all 0.12s", boxSizing:"border-box",
  });

  const inp = { width:"100%", background:"#161616", border:"1px solid #2e2e2e", borderRadius:10, color:"#f0f0f0", fontSize:15, padding:"12px 14px", outline:"none", boxSizing:"border-box", marginBottom:12 };
  const ta  = { width:"100%", background:"#111", border:"1px solid #2e2e2e", borderRadius:10, color:"#f0f0f0", fontSize:15, padding:"12px 14px", outline:"none", boxSizing:"border-box", resize:"vertical", minHeight:80, lineHeight:1.7, fontFamily:"inherit" };
  const lbl = { fontSize:13, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 };
  const card = { background:"#141414", border:"1px solid #2a2a2a", borderRadius:14, padding:20, marginBottom:12 };
  const aRow = { display:"flex", gap:8, flexWrap:"wrap" };
  const aBtn = { fontSize:13, padding:"7px 14px", borderRadius:8, cursor:"pointer", border:"1px solid #333", background:"transparent", color:"#aaa" };
  const gBtn = { fontSize:13, padding:"7px 14px", borderRadius:8, cursor:"pointer", border:"1px solid #1a5a30", background:"#0d3320", color:"#3ddc84" };
  const bBtn = { fontSize:13, padding:"7px 14px", borderRadius:8, cursor:"pointer", border:"1px solid #1a3060", background:"#0a1f40", color:"#6ab0ff" };
  const rBtn = { fontSize:13, padding:"7px 14px", borderRadius:8, cursor:"pointer", border:"1px solid #3a2020", background:"transparent", color:"#888" };
  const pBtn = (off) => ({ width:"100%", background:off?"#1e1e1e":"#fff", color:off?"#555":"#000", border:"none", borderRadius:10, padding:"14px 0", fontSize:16, fontWeight:700, cursor:off?"not-allowed":"pointer", marginBottom:14 });
  const sBadge = (l) => ({ fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20, background:l==="POST"?"#0d3320":l==="TWEAK"?"#2a2000":"#2a0d0d", color:l==="POST"?"#3ddc84":l==="TWEAK"?"#f5a623":"#ff6b6b" });

  const filteredLib = libFilter==="all" ? library : library.filter(q=>q.tag===libFilter);

  const TABS = [
    ["generate","Manage Quote"],
    ["queue",`Queue${queue.length?` (${queue.length})`:""}`],
    ["calendar","Calendar"],
    ["replies","Replies"],
    ["library",`Library${library.length?` (${library.length})`:""}`],
    ["settings","⚙"],
  ];

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", maxWidth:900, margin:"0 auto", padding:"28px 24px", color:"#f0f0f0", background:"#0a0a0a", minHeight:"100vh" }}>
      {scheduleModal && <ScheduleModal quote={scheduleModal} onConfirm={(d,t)=>schedulePost(scheduleModal,d,t)} onClose={()=>setScheduleModal(null)}/>}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <SiravLogo/>
        {threadsToken && <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"#0d2b1a", color:"#2ecc71", border:"0.5px solid #1a4a2a" }}>● Threads</span>}
      </div>

      <div style={{ display:"flex", gap:2, marginBottom:22, background:"#0f0f0f", borderRadius:10, padding:4, border:"0.5px solid #1c1c1c" }}>
        {TABS.map(([t,label])=>(
          <button key={t} style={tabStyle(t)} onClick={()=>setTab(t)}
            onMouseEnter={()=>setHoveredTab(t)} onMouseLeave={()=>setHoveredTab(null)}>{label}</button>
        ))}
      </div>

      {status && <div style={{ fontSize:12, color:status.ok?"#2ecc71":"#f39c12", textAlign:"center", marginBottom:10, padding:"8px", background:status.ok?"#0d2b1a":"#2a1f00", borderRadius:8 }}>{status.msg}</div>}

      {/* MANAGE QUOTE */}
      {tab==="generate" && (
        <>
          <div style={lbl}>Mode</div>
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {MODES.map(m=>(
              <button key={m} onClick={()=>setMode(m)}
                style={{ padding:"6px 10px", borderRadius:20, fontSize:12, cursor:"pointer", flex:1, border:`0.5px solid ${mode===m?"#444":"#222"}`, color:mode===m?"#fff":"#555", background:mode===m?"#1f1f1f":"transparent" }}>{m}</button>
            ))}
          </div>
          <input style={inp} placeholder="Optional seed idea..." value={seed} onChange={e=>setSeed(e.target.value)}/>
          <button style={pBtn(loading)} onClick={generate} disabled={loading}>{loading?"Generating...":"Generate quotes"}</button>
          {quotes.length===0&&!loading&&<div style={{ textAlign:"center", color:"#333", fontSize:14, padding:"48px 0" }}>Hit generate to get your batch.</div>}
          {quotes.map(q=>(
            <div key={q.id} style={card}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={sBadge(q.label)}>{q.label}</span>
                <span style={{ fontSize:12, color:"#555" }}>{q.score}/10</span>
                <span style={{ fontSize:12, color:"#444", flex:1 }}>{q.reason}</span>
              </div>
              {editingId===q.id?(
                <>
                  <textarea style={ta} value={editText} onChange={e=>setEditText(e.target.value)}/>
                  <div style={aRow}>
                    <button style={gBtn} onClick={()=>{setQuotes(prev=>prev.map(x=>x.id===q.id?{...x,text:editText}:x));setEditingId(null);}}>Save</button>
                    <button style={aBtn} onClick={()=>setEditingId(null)}>Cancel</button>
                  </div>
                </>
              ):(
                <>
                  <div style={{ fontSize:17, lineHeight:1.75, color:"#f0f0f0", whiteSpace:"pre-wrap", marginBottom:14 }}>{q.text}</div>
                  <div style={aRow}>
                    {q.label==="POST"&&<button style={gBtn} onClick={()=>publishToThreads(q.text,q.id)} disabled={publishing===q.id}>{publishing===q.id?"Publishing...":"↑ Post now"}</button>}
                    {q.label==="POST"&&<button style={bBtn} onClick={()=>setScheduleModal(q)}>📅 Schedule</button>}
                    {q.label==="POST"&&<button style={gBtn} onClick={()=>addToQueue(q)}>+ Queue</button>}
                    <button style={{ ...aBtn, border:"0.5px solid #1a4a2a", color:"#2ecc71" }} onClick={()=>addToLibrary(q)}>→ Library</button>
                    <button style={aBtn} onClick={()=>{setEditingId(q.id);setEditText(q.text);}}>Edit</button>
                    <button style={aBtn} onClick={()=>copyText(q.text,q.id)}>{copied===q.id?"✓":"Copy"}</button>
                    <button style={aBtn} onClick={generate}>↺</button>
                  </div>
                </>
              )}
            </div>
          ))}

        </>
      )}

      {/* QUEUE */}
      {tab==="queue" && (
        <>
          <div style={lbl}>Queue — {queue.length} ready</div>
          {queue.length===0&&<div style={{ textAlign:"center", color:"#333", fontSize:14, padding:"40px 0" }}>Empty. Approve posts from Manage Quote.</div>}
          {queue.map(q=>(
            <div key={q.id} style={card}>
              <div style={{ fontSize:17, lineHeight:1.75, color:"#f0f0f0", whiteSpace:"pre-wrap", marginBottom:12 }}>{q.text}</div>
              <div style={aRow}>
                <button style={gBtn} onClick={()=>publishToThreads(q.text,q.id)} disabled={publishing===q.id}>{publishing===q.id?"Publishing...":"↑ Post now"}</button>
                <button style={bBtn} onClick={()=>setScheduleModal(q)}>📅 Schedule</button>
                <button style={aBtn} onClick={()=>copyText(q.text,q.id)}>{copied===q.id?"✓":"Copy"}</button>
                <button style={rBtn} onClick={()=>removeFromQueue(q.id)}>Remove</button>
              </div>
            </div>
          ))}
          {queue.length>1&&<button onClick={async()=>{for(const q of queue)await publishToThreads(q.text,q.id);}}
            style={{ width:"100%", background:"#0d2b1a", color:"#2ecc71", border:"0.5px solid #1a4a2a", borderRadius:8, padding:"11px 0", fontSize:13, cursor:"pointer", marginTop:6 }}>↑ Publish all {queue.length} to Threads</button>}
          {scheduled.length>0&&(
            <>
              <div style={{ ...lbl, marginTop:24 }}>Scheduled — {scheduled.length}</div>
              {scheduled.map(s=>(
                <div key={s.scheduledId} style={{ ...card, background:"#0a1020", border:"0.5px solid #1a2a4a" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ fontSize:11, color:"#5b9bd5" }}>{s.date} · {s.time}</span>
                    <button style={rBtn} onClick={()=>removeScheduled(s.scheduledId)}>✕</button>
                  </div>
                  <div style={{ fontSize:14, color:"#ccc", whiteSpace:"pre-wrap" }}>{s.text}</div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* CALENDAR */}
      {tab==="calendar" && (
        <>
          <div style={lbl}>Content calendar</div>
          <CalendarView scheduled={scheduled} library={library} onSchedule={schedulePost}/>
        </>
      )}

      {/* REPLIES */}
      {tab==="replies" && (
        <>
          <div style={{ display:"flex", gap:3, marginBottom:18, background:"#0f0f0f", borderRadius:10, padding:3, border:"0.5px solid #1c1c1c" }}>
            {[["community","Community"],["custom","Custom"]].map(([t,l])=>(
              <button key={t} onClick={()=>setReplySubTab(t)}
                style={{ flex:1, padding:"8px 0", textAlign:"center", fontSize:12, cursor:"pointer", borderRadius:8, color:replySubTab===t?"#fff":"#555", background:replySubTab===t?"#1e1e1e":"transparent", border:replySubTab===t?"0.5px solid #333":"0.5px solid transparent", fontWeight:replySubTab===t?600:400 }}>
                {l}
              </button>
            ))}
          </div>

          {replySubTab==="community" && (
            <>
              <button onClick={fetchThreadsPosts} disabled={postsLoading} style={pBtn(postsLoading)}>
                {postsLoading?"Loading posts...":threadsPosts.length?"↺ Refresh posts":"Load posts from Threads"}
              </button>
              {threadsPosts.length===0&&!postsLoading&&<div style={{ textAlign:"center", color:"#333", fontSize:14, padding:"32px 0" }}>Load your Threads posts to see comments.</div>}
              {threadsPosts.map(post=>{
                const isExp = expandedPost===post.id;
                const replies = postReplies[post.id]||[];
                const isLd = repliesLoading[post.id];
                return (
                  <div key={post.id} style={{ marginBottom:10 }}>
                    <div onClick={()=>togglePost(post.id)}
                      style={{ background:"#111", border:"0.5px solid #1e1e1e", borderRadius:isExp?"10px 10px 0 0":10, padding:14, cursor:"pointer" }}>
                      <div style={{ fontSize:14, color:"#ccc", lineHeight:1.6, marginBottom:6 }}>{post.text||"(no text)"}</div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:11, color:"#444" }}>{post.timestamp?new Date(post.timestamp).toLocaleDateString():""}</span>
                        <span style={{ fontSize:11, color:"#555" }}>{isExp?"▲ Hide":"▼ Comments"}</span>
                      </div>
                    </div>
                    {isExp&&(
                      <div style={{ background:"#0d0d0d", border:"0.5px solid #1a1a1a", borderTop:"none", borderRadius:"0 0 10px 10px", padding:14 }}>
                        {isLd&&<div style={{ fontSize:13, color:"#444" }}>Loading comments...</div>}
                        {!isLd&&replies.length===0&&<div style={{ fontSize:13, color:"#333" }}>No comments yet.</div>}
                        {replies.map((r,i)=>{
                          const rKey=`comm-${post.id}-${i}`;
                          return (
                            <div key={r.id} style={{ paddingBottom:16, marginBottom:16, borderBottom:i<replies.length-1?"0.5px solid #1a1a1a":"none" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:11, color:"#555" }}>@{r.username||"user"} · {r.timestamp?new Date(r.timestamp).toLocaleDateString():""}</span>
                                <button style={{ fontSize:10, padding:"2px 8px", borderRadius:4, cursor:"pointer", border:"0.5px solid #222", background:"transparent", color:"#555" }}
                                  onClick={()=>copyText(r.text,`cr-${rKey}`)}>{copied===`cr-${rKey}`?"✓":"Copy"}</button>
                              </div>
                              <div style={{ fontSize:13, color:"#aaa", lineHeight:1.5, marginBottom:10 }}>{r.text}</div>
                              <div style={{ background:"#111", borderRadius:8, padding:10, marginBottom:8, border:"0.5px solid #1e1e1e" }}>
                                <div style={{ fontSize:10, color:"#444", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>Generate reply</div>
                                <button onClick={()=>generateReplyForComment(r.text,rKey)} disabled={genReplyLoading[rKey]}
                                  style={{ ...gBtn, fontSize:11, marginBottom:(genReplyResults[rKey]?.length?8:0) }}>
                                  {genReplyLoading[rKey]?"Generating...":"↺ Generate"}
                                </button>
                                {(genReplyResults[rKey]||[]).map((gr,gi)=>(
                                  <div key={gi} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"6px 0", borderTop:"0.5px solid #1a1a1a" }}>
                                    <div style={{ flex:1 }}>
                                      <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, background:"#1a1a1a", color:TONE_COLORS[gr.tone]||"#555", marginRight:5 }}>{gr.tone}</span>
                                      <div style={{ fontSize:12, color:"#fff", marginTop:4 }}>{gr.text}</div>
                                    </div>
                                    <button style={{ fontSize:10, padding:"2px 8px", borderRadius:4, cursor:"pointer", border:"0.5px solid #222", background:"transparent", color:"#555", marginLeft:8 }}
                                      onClick={()=>copyText(gr.text,`gr-${rKey}-${gi}`)}>{copied===`gr-${rKey}-${gi}`?"✓":"Copy"}</button>
                                  </div>
                                ))}
                              </div>
                              <div style={{ fontSize:10, color:"#333", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Reply bank</div>
                              <ReplyBank prefix={rKey} openCats={openCats} toggleCat={toggleCat} copyText={copyText} copied={copied}/>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {replySubTab==="custom" && (
            <>
              <div style={lbl}>Paste a comment</div>
              <div style={{ background:"#111", border:"0.5px solid #1e1e1e", borderRadius:12, padding:14, marginBottom:16 }}>
                <textarea style={{ ...ta, minHeight:56, marginBottom:10 }} placeholder="Paste the comment here..." value={commentInput} onChange={e=>setCommentInput(e.target.value)}/>
                <button style={pBtn(replyLoading||!commentInput.trim())} onClick={generateReply} disabled={replyLoading||!commentInput.trim()}>
                  {replyLoading?"Generating...":"Generate replies"}
                </button>
                {genReplies.length>0&&genReplies.map((r,i)=>(
                  <div key={i} style={{ padding:"10px 0", borderTop:"0.5px solid #1a1a1a" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"#1a1a1a", color:TONE_COLORS[r.tone]||"#555", marginRight:6 }}>{r.tone}</span>
                        <div style={{ fontSize:14, color:"#fff", lineHeight:1.5, marginTop:5 }}>{r.text}</div>
                      </div>
                      <button style={{ fontSize:11, padding:"3px 9px", borderRadius:5, cursor:"pointer", border:"0.5px solid #222", background:"transparent", color:"#555", marginLeft:10 }}
                        onClick={()=>copyText(r.text,`cgr-${i}`)}>{copied===`cgr-${i}`?"✓":"Copy"}</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={lbl}>Reply bank</div>
              <ReplyBank prefix="custom" openCats={openCats} toggleCat={toggleCat} copyText={copyText} copied={copied}/>
            </>
          )}
        </>
      )}

      {/* LIBRARY */}
      {tab==="library" && (
        <>
          <div style={lbl}>Write a quote</div>
          <div style={{ background:"#0d0d0d", border:"0.5px solid #222", borderRadius:12, padding:14, marginBottom:16 }}>
            <textarea style={{ ...ta, minHeight:80, marginBottom:10 }} placeholder={"they need you upset\ncalm you is dangerous."} value={newQuote} onChange={e=>setNewQuote(e.target.value)}/>
            <div style={aRow}>
              <button style={gBtn} onClick={()=>{if(!newQuote.trim())return;setLibrary(prev=>[{id:Date.now(),text:newQuote.trim(),label:"POST",score:null,source:"manual",tag:null},...prev]);setNewQuote("");flash("Saved to library.");}}>Save to library</button>
              <button style={aBtn} onClick={()=>setNewQuote("")}>Clear</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {["all","identity","relationship","wealth","posted"].map(f=>(
              <button key={f} onClick={()=>setLibFilter(f)}
                style={{ padding:"5px 12px", borderRadius:20, fontSize:11, cursor:"pointer", textTransform:"capitalize", border:`0.5px solid ${libFilter===f?(TAG_COLORS[f]||"#444"):"#222"}`, color:libFilter===f?(TAG_COLORS[f]||"#fff"):"#555", background:libFilter===f?(TAG_BG[f]||"#1a1a1a"):"transparent" }}>
                {f}
              </button>
            ))}
          </div>
          <div style={lbl}>Saved — {filteredLib.length} quotes</div>
          {filteredLib.length===0&&<div style={{ textAlign:"center", color:"#333", fontSize:14, padding:"48px 0" }}>No quotes yet.</div>}
          {filteredLib.map(q=>(
            <div key={q.id} style={{ background:"#111", border:"0.5px solid #1e1e1e", borderRadius:12, padding:14, marginBottom:8 }}>
              {libEditId===q.id?(
                <>
                  <textarea style={{ ...ta, marginBottom:10 }} value={libEditText} onChange={e=>setLibEditText(e.target.value)}/>
                  <div style={aRow}>
                    <button style={gBtn} onClick={()=>{setLibrary(prev=>prev.map(x=>x.id===q.id?{...x,text:libEditText}:x));setLibEditId(null);}}>Save</button>
                    <button style={aBtn} onClick={()=>setLibEditId(null)}>Cancel</button>
                  </div>
                </>
              ):(
                <>
                  <div style={{ fontSize:17, lineHeight:1.75, color:"#f0f0f0", whiteSpace:"pre-wrap", marginBottom:12 }}>{q.text}</div>
                  <div style={{ display:"flex", gap:5, marginBottom:10 }}>
                    {["identity","relationship","wealth","posted"].map(tag=>(
                      <button key={tag} onClick={()=>setLibraryTag(q.id,tag)}
                        style={{ padding:"4px 13px", borderRadius:20, fontSize:12, cursor:"pointer", textTransform:"capitalize", border:`1px solid ${q.tag===tag?TAG_COLORS[tag]:"#2e2e2e"}`, color:q.tag===tag?TAG_COLORS[tag]:"#777", background:q.tag===tag?TAG_BG[tag]:"transparent", fontWeight:q.tag===tag?600:400 }}>
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    {q.score&&<span style={sBadge(q.label)}>{q.score}/10</span>}
                    {q.source==="manual"&&<span style={{ fontSize:10, color:"#444" }}>written</span>}
                  </div>
                  <div style={aRow}>
                    <button style={gBtn} onClick={()=>publishToThreads(q.text,q.id)} disabled={publishing===q.id}>{publishing===q.id?"Publishing...":"↑ Post now"}</button>
                    <button style={bBtn} onClick={()=>setScheduleModal(q)}>📅 Schedule</button>
                    <button style={gBtn} onClick={()=>addToQueue(q)}>+ Queue</button>
                    <button style={aBtn} onClick={()=>{setLibEditId(q.id);setLibEditText(q.text);}}>Edit</button>
                    <button style={aBtn} onClick={()=>copyText(q.text,`lib-${q.id}`)}>{copied===`lib-${q.id}`?"✓":"Copy"}</button>
                    <button style={rBtn} onClick={()=>deleteFromLibrary(q.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* RECENT GENERATES */}
          {recentQuotes.length > 0 && (
            <>
              <div style={{ ...lbl, marginTop:28, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>Recent generates — {recentQuotes.length} / 20</span>
                <button onClick={()=>setRecentQuotes([])} style={{ fontSize:12, color:"#666", background:"transparent", border:"none", cursor:"pointer" }}>Clear all</button>
              </div>
              {recentQuotes.map(q=>(
                <div key={q.id} style={{ ...card, background:"#111", border:"1px solid #222", opacity:0.85 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={sBadge(q.label)}>{q.label}</span>
                    <span style={{ fontSize:12, color:"#666" }}>{q.score}/10</span>
                  </div>
                  <div style={{ fontSize:15, lineHeight:1.7, color:"#ccc", whiteSpace:"pre-wrap", marginBottom:10 }}>{q.text}</div>
                  <div style={aRow}>
                    <button style={{ ...aBtn, border:"1px solid #1a5a30", color:"#3ddc84" }} onClick={()=>addToLibrary(q)}>→ Library</button>
                    <button style={gBtn} onClick={()=>addToQueue(q)}>+ Queue</button>
                    <button style={aBtn} onClick={()=>copyText(q.text,`rec-${q.id}`)}>{copied===`rec-${q.id}`?"✓":"Copy"}</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* SETTINGS */}
      {tab==="settings" && (
        <>
          <div style={lbl}>Threads credentials</div>
          <div style={{ background:"#111", border:"0.5px solid #1e1e1e", borderRadius:12, padding:20, marginBottom:12 }}>
            <label style={{ fontSize:12, color:"#666", marginBottom:6, display:"block" }}>Access token</label>
            <input style={inp} type="password" placeholder="Threads access token..." value={tokenInput} onChange={e=>setTokenInput(e.target.value)}/>
            <label style={{ fontSize:12, color:"#666", marginBottom:6, display:"block" }}>User ID</label>
            <input style={inp} placeholder="Numeric user ID..." value={userIdInput} onChange={e=>setUserIdInput(e.target.value)}/>
            <button onClick={saveSettings} style={{ background:"#1a1a1a", color:"#fff", border:"0.5px solid #333", borderRadius:8, padding:"8px 20px", fontSize:13, cursor:"pointer" }}>Save</button>
          </div>
          <div style={{ fontSize:12, color:"#333", lineHeight:1.7 }}>
            Token expires in ~60 days. Regenerate at developers.facebook.com → Tools → Graph API Explorer.
          </div>
        </>
      )}
    </div>
  );
}
