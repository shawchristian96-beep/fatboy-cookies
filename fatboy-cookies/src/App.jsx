import { useState, useEffect } from "react";

const COOKIES = [
  { id: "lemon",     name: "Lemon",         emoji: "🍋", desc: "Bright, tangy, rich white coco & perfectly sweet"   },
  { id: "chocolate", name: "Chocolate",      emoji: "🍫", desc: "buttery, fudgy & deeply chocolatey"  },
  { id: "banana",    name: "Banana Foster",  emoji: "🍌", desc: "Caramelized banana, coconut with warm spice"  },
  { id: "berry",     name: "Oatmeal Berry",  emoji: "🫐", desc: "Hearty oats, forsted with juicy berry center" },
];

const DEFAULT_PICKUP_SLOTS = [
  "Tuesday 12:00 PM – 1:00 PM",
  "Tuesday 2:00 PM – 3:00 PM",
  "Tuesday 5:00 PM – 6:00 PM",
  "Tuesday 7:00 PM - 8:00 PM",
  "Wednesday 11:00 AM – 12:00 PM",
  "Wednesday 2:00 PM – 3:00 PM",
  "Wednesday 5:00 PM - 6:00 PM",
  "Wednesday 7:00 PM - 8:00PM",
  
];

const OWNER_PHONE   = "(470) 276-5026";
const ADMIN_PIN     = "0476";
const BOX_KEY       = "fatboy-boxes-remaining";
const MAX_KEY       = "fatboy-boxes-max";
const ORDERS_KEY    = "fatboy-orders";
const CUSTOMERS_KEY = "fatboy-customers";
const ARRIVALS_KEY  = "fatboy-arrivals";

// ── localStorage helpers (replaces window.storage)
const lsGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, val); } catch {} };

export default function App() {
  const [view, setView]             = useState("store");
  const [pinInput, setPinInput]     = useState("");
  const [pinError, setPinError]     = useState(false);
  const [showPin, setShowPin]       = useState(false);
  const [maxBoxes, setMaxBoxes]     = useState(12);
  const [boxesLeft, setBoxesLeft]   = useState(12);
  const [orders, setOrders]         = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [arrivals, setArrivals]     = useState([]);
  const [lookupNum, setLookupNum]   = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [iHereSuccess, setIHereSuccess] = useState(false);
  const [step, setStep]             = useState(1);
  const [selected, setSelected]     = useState([]);
  const [boxType, setBoxType]       = useState("");
  const [qty, setQty]               = useState(1);
  const [pickupSlot, setPickupSlot] = useState("");
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum]     = useState("");
  const [adminBoxes, setAdminBoxes] = useState(12);
  const [adminMax, setAdminMax]     = useState(12);
  const [adminSaved, setAdminSaved] = useState(false);
  const [adminTab, setAdminTab]     = useState("orders");

  useEffect(() => {
    const mRaw = lsGet(MAX_KEY);
    const bRaw = lsGet(BOX_KEY);
    const oRaw = lsGet(ORDERS_KEY);
    const cRaw = lsGet(CUSTOMERS_KEY);
    const aRaw = lsGet(ARRIVALS_KEY);
    const m = mRaw ? parseInt(mRaw) : 12;
    const b = bRaw !== null ? parseInt(bRaw) : m;
    setMaxBoxes(m); setBoxesLeft(b); setAdminMax(m); setAdminBoxes(b);
    if (oRaw) setOrders(JSON.parse(oRaw));
    if (cRaw) setCustomers(JSON.parse(cRaw));
    if (aRaw) setArrivals(JSON.parse(aRaw));
  }, []);

  const urgencyColor = boxesLeft === 0 ? "#e63946" : boxesLeft <= 3 ? "#e63946" : boxesLeft <= 6 ? "#f4a261" : "#4caf6e";

  const toggleCookie = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 4 ? [...p, id] : p);

  const submitOrder = async () => {
    if (!name || !phone || !pickupSlot || selected.length === 0) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1300));
    const newBoxes = Math.max(0, boxesLeft - qty);
    const num = "FBC" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = { num, name, phone, email, note, qty, boxType, flavors: selected, pickup: pickupSlot, ts: new Date().toLocaleString(), status: "pending" };
    const newOrders = [newOrder, ...orders];
    const existingIdx = customers.findIndex(c => c.phone === phone);
    const customerEntry = { name, phone, email, firstOrder: existingIdx === -1 ? new Date().toLocaleString() : customers[existingIdx].firstOrder, totalOrders: existingIdx === -1 ? 1 : customers[existingIdx].totalOrders + 1, lastOrder: new Date().toLocaleString() };
    const newCustomers = existingIdx === -1 ? [customerEntry, ...customers] : customers.map((c, i) => i === existingIdx ? customerEntry : c);
    setBoxesLeft(newBoxes); setAdminBoxes(newBoxes);
    setOrders(newOrders); setCustomers(newCustomers);
    lsSet(BOX_KEY, String(newBoxes));
    lsSet(ORDERS_KEY, JSON.stringify(newOrders));
    lsSet(CUSTOMERS_KEY, JSON.stringify(newCustomers));
    setOrderNum(num); setSubmitting(false); setStep(5);
  };

  const saveAdmin = () => {
    const nb = Math.max(0, Math.min(adminBoxes, adminMax));
    setBoxesLeft(nb); setMaxBoxes(adminMax); setAdminBoxes(nb);
    lsSet(BOX_KEY, String(nb)); lsSet(MAX_KEY, String(adminMax));
    setAdminSaved(true); setTimeout(() => setAdminSaved(false), 2200);
  };

  const resetWeek = () => {
    setBoxesLeft(adminMax); setMaxBoxes(adminMax); setAdminBoxes(adminMax);
    lsSet(BOX_KEY, String(adminMax)); lsSet(MAX_KEY, String(adminMax));
    setAdminSaved(true); setTimeout(() => setAdminSaved(false), 2200);
  };

  const clearOrders = () => { setOrders([]); lsSet(ORDERS_KEY, "[]"); };
  const clearCustomers = () => { setCustomers([]); lsSet(CUSTOMERS_KEY, "[]"); };

  const markReady = (oNum) => {
    const updated = orders.map(o => o.num === oNum ? { ...o, status: "ready" } : o);
    setOrders(updated); lsSet(ORDERS_KEY, JSON.stringify(updated));
  };

  const markPickedUp = (oNum) => {
    const updated = orders.map(o => o.num === oNum ? { ...o, status: "pickedup" } : o);
    const newArrivals = arrivals.filter(a => a !== oNum);
    setOrders(updated); setArrivals(newArrivals);
    lsSet(ORDERS_KEY, JSON.stringify(updated)); lsSet(ARRIVALS_KEY, JSON.stringify(newArrivals));
  };

  const dismissArrival = (oNum) => {
    const newArrivals = arrivals.filter(a => a !== oNum);
    setArrivals(newArrivals); lsSet(ARRIVALS_KEY, JSON.stringify(newArrivals));
  };

  const iAmHere = (oNum) => {
    if (arrivals.includes(oNum)) return;
    const newArrivals = [oNum, ...arrivals];
    setArrivals(newArrivals); setIHereSuccess(true);
    lsSet(ARRIVALS_KEY, JSON.stringify(newArrivals));
  };

  const lookupOrder = () => {
    const found = orders.find(o => o.num.toLowerCase() === lookupNum.trim().toLowerCase());
    setLookupResult(found || "notfound");
  };

  const tryPin = (pin) => {
    const code = pin !== undefined ? String(pin) : String(pinInput);
    if (code === String(ADMIN_PIN)) { setView("admin"); setShowPin(false); setPinError(false); setPinInput(""); }
    else { setPinError(true); setPinInput(""); }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&family=Nunito:wght@400;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    .btn-red{background:#e63946;color:#fff;border:3px solid #f5f0e8;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;padding:16px 40px;border-radius:10px;cursor:pointer;box-shadow:4px 4px 0 #f4a261;transition:transform .1s,box-shadow .1s;width:100%;}
    .btn-red:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 #f4a261;}
    .btn-red:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #f4a261;}
    .btn-red:disabled{opacity:.45;cursor:not-allowed;transform:none;}
    .btn-ghost{background:transparent;color:#f5f0e8;border:2px solid #444;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;padding:10px 22px;border-radius:8px;cursor:pointer;transition:border-color .2s,color .2s;}
    .btn-ghost:hover{border-color:#f4a261;color:#f4a261;}
    .btn-green{background:#4caf6e;color:#fff;border:3px solid #f5f0e8;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;padding:13px 28px;border-radius:10px;cursor:pointer;box-shadow:3px 3px 0 #2d7a4a;transition:transform .1s;}
    .btn-green:hover{transform:translate(-1px,-1px);}
    .ifield{width:100%;background:#1e1e1e;border:2px solid #333;color:#f5f0e8;font-family:'Nunito',sans-serif;font-size:15px;font-weight:600;padding:13px 15px;border-radius:10px;outline:none;transition:border-color .2s;}
    .ifield:focus{border-color:#f4a261;}
    .ifield::placeholder{color:#555;}
    .ccard{background:#1a1a1a;border:2.5px solid #333;border-radius:14px;padding:20px 14px;cursor:pointer;transition:all .15s;text-align:center;position:relative;}
    .ccard:hover{border-color:#f4a261;transform:translateY(-2px);}
    .ccard.on{border-color:#e63946;background:#1e1010;box-shadow:0 0 0 2px #e63946;}
    .slot{background:#1a1a1a;border:2px solid #333;color:#f5f0e8;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;padding:13px 16px;border-radius:10px;cursor:pointer;transition:all .15s;text-align:left;width:100%;}
    .slot:hover{border-color:#f4a261;}
    .slot.on{border-color:#e63946;background:#1e1010;color:#f4a261;}
    .num-btn{width:42px;height:42px;background:#2a2a2a;border:2px solid #444;color:#f5f0e8;font-size:22px;border-radius:8px;cursor:pointer;font-weight:900;display:flex;align-items:center;justify-content:center;transition:border-color .15s;}
    .num-btn:hover{border-color:#f4a261;color:#f4a261;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp .4s ease both;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .sp{width:20px;height:20px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px;}
    @keyframes pop{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    .pop{animation:pop .55s ease both;}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
    .blink{animation:blink 1.8s ease infinite;}
    .order-row:hover{background:#1e1e1e;}
    .pin-btn{background:#1e1e1e;border:2px solid #333;color:#f5f0e8;font-family:'Bebas Neue',sans-serif;font-size:22px;border-radius:10px;padding:14px;cursor:pointer;transition:all .15s;flex:1;}
    .pin-btn:hover{border-color:#f4a261;background:#2a2a2a;}
    .pin-btn:active{transform:scale(.95);}
    .saved-toast{background:#4caf6e;color:#fff;font-family:'Bebas Neue',sans-serif;font-size:14px;letter-spacing:2px;padding:8px 20px;border-radius:20px;position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:999;box-shadow:0 4px 20px rgba(76,175,110,.4);}
  `;

  const TopBar = () => (
    <div style={{background:"#1a1a1a",borderBottom:"3px solid #e63946",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:38,height:38,background:"radial-gradient(circle at 38% 38%,#d4956a,#b5692e)",borderRadius:"50%",border:"2px solid #f5f0e8",flexShrink:0}}/>
        <div style={{lineHeight:1}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"#f5f0e8",lineHeight:.9}}>FATBOY</div>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2,color:"#e63946",lineHeight:.9}}>COOKIES</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:"#111",border:`2px solid ${urgencyColor}`,borderRadius:20,padding:"5px 12px"}}>
          <div className="blink" style={{width:7,height:7,borderRadius:"50%",background:urgencyColor,boxShadow:`0 0 5px ${urgencyColor}`}}/>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:1,color:urgencyColor}}>
            {boxesLeft===0?"SOLD OUT":`${boxesLeft} LEFT`}
          </span>
        </div>
        <button onClick={()=>view==="admin"?setView("store"):setShowPin(true)}
          style={{background:"#2a2a2a",border:"2px solid #f4a261",color:"#f4a261",fontSize:13,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,borderRadius:8,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:5,position:"relative"}}>
          ⚙️ ADMIN
          {arrivals.length>0&&<span style={{position:"absolute",top:-6,right:-6,background:"#e63946",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:11,fontFamily:"'Bebas Neue',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #111"}}>{arrivals.length}</span>}
        </button>
      </div>
    </div>
  );

  // PIN
  if (showPin) return (
    <div style={{minHeight:"100vh",background:"#111",fontFamily:"'Nunito',sans-serif",color:"#f5f0e8"}}>
      <style>{css}</style><TopBar/>
      <div style={{maxWidth:340,margin:"60px auto",padding:"0 18px"}} className="fu">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:44,marginBottom:10}}>🔐</div>
          <h2 style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2}}>ADMIN ACCESS</h2>
          <p style={{fontSize:13,color:"#666",marginTop:6,fontWeight:600}}>Enter your PIN to manage your drop</p>
        </div>
        <div style={{background:"#1a1a1a",border:`2px solid ${pinError?"#e63946":"#333"}`,borderRadius:14,padding:"18px",marginBottom:16,textAlign:"center",fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:10,color:"#f4a261",minHeight:60}}>
          {pinInput.replace(/./g,"●")||<span style={{color:"#333"}}>● ● ● ●</span>}
        </div>
        {pinError&&<p style={{color:"#e63946",fontSize:12,fontWeight:800,textAlign:"center",marginBottom:10}}>Wrong PIN. Try again.</p>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <button key={n} className="pin-btn" onClick={()=>{const next=pinInput.length<4?pinInput+String(n):pinInput;setPinInput(next);if(next.length===4)setTimeout(()=>tryPin(next),120);}}>{n}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          <button className="pin-btn" onClick={()=>{setPinError(false);setPinInput(p=>p.slice(0,-1));}} style={{fontSize:16}}>⌫</button>
          <button className="pin-btn" onClick={()=>{const next=pinInput.length<4?pinInput+"0":pinInput;setPinInput(next);if(next.length===4)setTimeout(()=>tryPin(next),120);}}>0</button>
          <button className="pin-btn" style={{background:"#e63946",borderColor:"#e63946",color:"#fff"}} onClick={()=>tryPin(pinInput)}>→</button>
        </div>
        <button className="btn-ghost" style={{width:"100%"}} onClick={()=>{setShowPin(false);setPinError(false);setPinInput("");}}>Cancel</button>
      </div>
    </div>
  );

  // ADMIN
  if (view==="admin") return (
    <div style={{minHeight:"100vh",background:"#111",fontFamily:"'Nunito',sans-serif",color:"#f5f0e8"}}>
      <style>{css}</style><TopBar/>
      {adminSaved&&<div className="saved-toast">✓ SAVED!</div>}
      <div style={{maxWidth:520,margin:"0 auto",padding:"28px 18px 60px"}}>
        <div className="fu">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:"#555"}}>OWNER DASHBOARD</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:38,letterSpacing:2,lineHeight:1}}>MANAGE <span style={{color:"#e63946"}}>DROP</span></h2>
            </div>
            <button className="btn-ghost" onClick={()=>setView("store")}>← Store</button>
          </div>

          <div style={{background:"#1a1a1a",border:`3px solid ${urgencyColor}`,borderRadius:16,padding:"20px 22px",marginBottom:20}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:6}}>LIVE STATUS</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:48,color:urgencyColor,lineHeight:1}}>{boxesLeft}<span style={{fontSize:20,color:"#555"}}> / {maxBoxes}</span></div>
                <div style={{fontSize:12,color:"#666",fontWeight:700,marginTop:2}}>boxes remaining this week</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {Array.from({length:maxBoxes}).map((_,i)=>(
                  <div key={i} style={{width:14,height:6,borderRadius:3,background:i<(maxBoxes-boxesLeft)?"#2a2a2a":urgencyColor}}/>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:"#1a1a1a",border:"2px solid #2a2a2a",borderRadius:16,padding:"22px",marginBottom:16}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:2,color:"#888",marginBottom:18}}>ADJUST AVAILABILITY</div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:800,color:"#666",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:10}}>Total boxes for this drop</label>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button className="num-btn" onClick={()=>setAdminMax(m=>Math.max(1,m-1))}>−</button>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:40,color:"#f4a261",minWidth:48,textAlign:"center"}}>{adminMax}</span>
                <button className="num-btn" onClick={()=>setAdminMax(m=>m+1)}>+</button>
                <span style={{fontSize:12,color:"#555",fontWeight:700}}>boxes max</span>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,fontWeight:800,color:"#666",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:10}}>Boxes still available right now</label>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button className="num-btn" onClick={()=>setAdminBoxes(b=>Math.max(0,b-1))}>−</button>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:40,color:adminBoxes===0?"#e63946":adminBoxes<=3?"#e63946":adminBoxes<=6?"#f4a261":"#4caf6e",minWidth:48,textAlign:"center"}}>{adminBoxes}</span>
                <button className="num-btn" onClick={()=>setAdminBoxes(b=>Math.min(adminMax,b+1))}>+</button>
                <span style={{fontSize:12,color:"#555",fontWeight:700}}>remaining</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-green" onClick={saveAdmin} style={{flex:1}}>SAVE CHANGES ✓</button>
              <button onClick={resetWeek} style={{background:"#2a2a2a",color:"#f4a261",border:"2px solid #f4a261",fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:1,padding:"13px 16px",borderRadius:10,cursor:"pointer",whiteSpace:"nowrap"}}>🔄 NEW WEEK RESET</button>
            </div>
            <p style={{fontSize:11,color:"#444",fontWeight:700,marginTop:10,lineHeight:1.5}}>"New Week Reset" sets available back to your max — use every time you start a fresh drop.</p>
          </div>

          <div style={{background:"#1a1a1a",border:"2px solid #2a2a2a",borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"flex",borderBottom:"2px solid #2a2a2a"}}>
              {[{id:"orders",label:`📦 Orders (${orders.length})`},{id:"customers",label:`👥 Customers (${customers.length})`}].map(t=>(
                <button key={t.id} onClick={()=>setAdminTab(t.id)} style={{flex:1,padding:"14px 10px",background:adminTab===t.id?"#2a2a2a":"transparent",border:"none",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1,color:adminTab===t.id?"#f4a261":"#555",cursor:"pointer",borderBottom:adminTab===t.id?"3px solid #e63946":"3px solid transparent"}}>{t.label}</button>
              ))}
            </div>
            <div style={{padding:"18px"}}>
              {adminTab==="orders"&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:"#666"}}>ORDER LOG</div>
                    {orders.length>0&&<button onClick={clearOrders} style={{background:"transparent",border:"1px solid #444",color:"#666",fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:6,cursor:"pointer"}}>Clear All</button>}
                  </div>
                  {arrivals.length>0&&(
                    <div style={{marginBottom:16}}>
                      {arrivals.map(arrNum=>{
                        const o=orders.find(x=>x.num===arrNum);
                        if(!o)return null;
                        return(
                          <div key={arrNum} style={{background:"#1a2a1e",border:"2px solid #4caf6e",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <span style={{fontSize:22}}>🚗</span>
                              <div>
                                <div style={{fontFamily:"'Bebas Neue'",fontSize:14,letterSpacing:1,color:"#4caf6e"}}>CUSTOMER ARRIVED</div>
                                <div style={{fontSize:12,color:"#f5f0e8",fontWeight:800}}>{o.name} · {arrNum}</div>
                              </div>
                            </div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>markPickedUp(arrNum)} style={{background:"#4caf6e",border:"none",color:"#fff",fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1,padding:"7px 12px",borderRadius:8,cursor:"pointer"}}>✓ DONE</button>
                              <button onClick={()=>dismissArrival(arrNum)} style={{background:"transparent",border:"1px solid #444",color:"#666",fontSize:11,fontWeight:700,padding:"7px 10px",borderRadius:8,cursor:"pointer"}}>✕</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {orders.length===0
                    ?<div style={{textAlign:"center",padding:"28px 0",color:"#444",fontSize:13,fontWeight:700}}>No orders yet this drop 🍪</div>
                    :<div style={{display:"flex",flexDirection:"column",gap:2,maxHeight:440,overflowY:"auto"}}>
                      {orders.map((o,i)=>{
                        const isArrived=arrivals.includes(o.num);
                        const statusColor=o.status==="pickedup"?"#555":o.status==="ready"?"#4caf6e":isArrived?"#f4a261":"#666";
                        const statusLabel=o.status==="pickedup"?"PICKED UP":o.status==="ready"?"READY":isArrived?"🚗 ARRIVED":"PENDING";
                        const msgBody=`Hey ${o.name}! Your Fatboy Cookies order ${o.num} is ready for pickup! Come grab 'em 🍪 - (470) 276-5026`;
                        const smsLink=`sms:${o.phone.replace(/\D/g,"")}?body=${encodeURIComponent(msgBody)}`;
                        return(
                          <div key={i} className="order-row" style={{padding:"12px 10px",borderRadius:10,border:`1px solid ${isArrived&&o.status!=="pickedup"?"#f4a261":"#222"}`,background:o.status==="pickedup"?"#1a1a1a":isArrived?"#1e1a10":"#1a1a1a",marginBottom:4}}>
                            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                              <div style={{flex:1}}>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                                  <span style={{fontFamily:"'Bebas Neue'",fontSize:13,color:"#f4a261",letterSpacing:1}}>{o.num}</span>
                                  <span style={{fontSize:10,color:"#555",fontWeight:700}}>{o.ts}</span>
                                  <span style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:1,color:statusColor,background:"#222",padding:"2px 8px",borderRadius:20,border:`1px solid ${statusColor}`}}>{statusLabel}</span>
                                </div>
                                <div style={{fontWeight:800,fontSize:13,color:o.status==="pickedup"?"#555":"#f5f0e8",marginBottom:2}}>{o.name} · {o.phone}</div>
                                {o.email&&<div style={{fontSize:10,color:"#555",fontWeight:600,marginBottom:2}}>{o.email}</div>}
                                <div style={{fontSize:11,color:"#777",fontWeight:600,marginBottom:6}}>{o.qty} box{o.qty>1?"es":""} · {o.flavors.map(id=>COOKIES.find(c=>c.id===id)?.emoji).join(" ")} · {o.pickup}</div>
                                {o.note&&<div style={{fontSize:10,color:"#555",fontStyle:"italic",marginBottom:6}}>"{o.note}"</div>}
                                {o.status!=="pickedup"&&(
                                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                    {o.status!=="ready"&&<button onClick={()=>markReady(o.num)} style={{background:"#1a2a1e",border:"1.5px solid #4caf6e",color:"#4caf6e",fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1,padding:"6px 12px",borderRadius:8,cursor:"pointer"}}>✓ MARK READY</button>}
                                    <a href={smsLink} style={{background:"#1a1e2a",border:"1.5px solid #5b8dee",color:"#5b8dee",fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1,padding:"6px 12px",borderRadius:8,cursor:"pointer",textDecoration:"none",display:"inline-block"}}>💬 TEXT CUSTOMER</a>
                                    {o.status==="ready"&&<button onClick={()=>markPickedUp(o.num)} style={{background:"#2a1a1a",border:"1.5px solid #e63946",color:"#e63946",fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:1,padding:"6px 12px",borderRadius:8,cursor:"pointer"}}>📦 PICKED UP</button>}
                                  </div>
                                )}
                              </div>
                            </div>
                            {i<orders.length-1&&<div style={{borderBottom:"1px solid #1e1e1e",marginTop:10}}/>}
                          </div>
                        );
                      })}
                    </div>
                  }
                </>
              )}
              {adminTab==="customers"&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:"#666"}}>CUSTOMER LIST</div>
                    {customers.length>0&&<button onClick={clearCustomers} style={{background:"transparent",border:"1px solid #444",color:"#666",fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:6,cursor:"pointer"}}>Clear All</button>}
                  </div>
                  {customers.length===0
                    ?<div style={{textAlign:"center",padding:"28px 0",color:"#444",fontSize:13,fontWeight:700}}>No customers yet 👥</div>
                    :<div style={{display:"flex",flexDirection:"column",gap:1,maxHeight:420,overflowY:"auto"}}>
                      {customers.map((c,i)=>(
                        <div key={i} className="order-row" style={{padding:"14px 10px",borderRadius:8}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:800,fontSize:14,color:"#f5f0e8",marginBottom:3}}>{c.name}</div>
                              <span style={{fontSize:12,color:"#f4a261",fontWeight:700}}>📱 {c.phone}</span>
                              {c.email?<div style={{fontSize:11,color:"#4caf6e",fontWeight:700,marginTop:2}}>✉ {c.email}</div>:<div style={{fontSize:11,color:"#444",fontWeight:600,marginTop:2}}>No email provided</div>}
                              <div style={{fontSize:10,color:"#555",fontWeight:600,marginTop:4}}>First order: {c.firstOrder} · Total: <span style={{color:"#f4a261"}}>{c.totalOrders}</span></div>
                            </div>
                            <div style={{background:"#2a2a2a",border:"2px solid #f4a261",borderRadius:20,padding:"4px 12px",fontFamily:"'Bebas Neue'",fontSize:18,color:"#f4a261"}}>{c.totalOrders}x</div>
                          </div>
                          {i<customers.length-1&&<div style={{borderBottom:"1px solid #222",marginTop:10}}/>}
                        </div>
                      ))}
                    </div>
                  }
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // STORE
  return (
    <div style={{minHeight:"100vh",background:"#111",fontFamily:"'Nunito',sans-serif",color:"#f5f0e8",overflowX:"hidden"}}>
      <style>{css}</style>
      <TopBar/>
      <div style={{maxWidth:500,margin:"0 auto",padding:"28px 18px 60px"}}>

        {step===1&&(
          <div className="fu">
            <div style={{textAlign:"center",marginBottom:26}}>
              <div style={{fontSize:66,marginBottom:6}}>🍪</div>
              <h1 style={{fontFamily:"'Bebas Neue'",fontSize:52,letterSpacing:3,lineHeight:1,marginBottom:10}}>ORDER<br/><span style={{color:"#e63946"}}>FATBOY</span><br/>COOKIES</h1>
              <p style={{fontFamily:"'Permanent Marker'",fontSize:16,color:"#f4a261",marginBottom:16}}>Baked fresh. Right on your block.</p>
              <p style={{fontSize:13,color:"#999",lineHeight:1.7,maxWidth:340,margin:"0 auto"}}>Real ingredients. No shortcuts. Made to order — thick, warm, and packed with flavor. Your neighbors already know. Now it's your turn.</p>
            </div>
            <div style={{background:"#1a1a1a",border:`3px solid ${urgencyColor}`,borderRadius:16,padding:"18px 22px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:2,color:"#555",marginBottom:4}}>THIS WEEK'S AVAILABILITY</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:44,color:urgencyColor,lineHeight:1}}>{boxesLeft===0?"SOLD OUT":`${boxesLeft} / ${maxBoxes}`}</div>
                <div style={{fontSize:11,color:"#555",fontWeight:700,marginTop:2}}>{boxesLeft===0?"Check back next week":urgencyColor==="#e63946"?"🔥 Almost gone!":urgencyColor==="#f4a261"?"⚡ Going fast":"✅ Available now"}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {Array.from({length:maxBoxes}).map((_,i)=>(
                  <div key={i} style={{width:14,height:6,borderRadius:3,background:i<(maxBoxes-boxesLeft)?"#2a2a2a":urgencyColor}}/>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {COOKIES.map(c=>(
                <div key={c.id} style={{background:"#1a1a1a",border:"2px solid #222",borderRadius:12,padding:"13px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{c.emoji}</span>
                  <div><div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:"#f5f0e8"}}>{c.name}</div><div style={{fontSize:10,color:"#555",fontWeight:600}}>{c.desc}</div></div>
                </div>
              ))}
            </div>
            <div style={{background:"#f4e04d",border:"3px solid #1c1c1c",borderRadius:12,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:22,boxShadow:"4px 4px 0 #1c1c1c"}}>
              <span style={{fontSize:24}}>🎁</span>
              <div><div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#1c1c1c",letterSpacing:1}}>FIRST ORDER SPECIAL</div><div style={{fontSize:11,color:"#5a3010",fontWeight:800,textTransform:"uppercase"}}>Buy a box — get a FREE bonus cookie</div></div>
            </div>
            <button className="btn-red" onClick={()=>setStep(2)} disabled={boxesLeft===0}>{boxesLeft===0?"SOLD OUT THIS WEEK":"BUILD MY BOX →"}</button>
            <p style={{textAlign:"center",fontSize:12,color:"#444",marginTop:12,fontWeight:700}}>📍 Local pickup only · {OWNER_PHONE}</p>

            <div style={{marginTop:32,borderTop:"1px solid #222",paddingTop:28}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:"#555",marginBottom:10,textAlign:"center"}}>ALREADY ORDERED? CHECK YOUR STATUS</div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <input className="ifield" placeholder="Enter order # (e.g. FBC1234)" value={lookupNum} onChange={e=>{setLookupNum(e.target.value.toUpperCase());setLookupResult(null);}} style={{flex:1,fontSize:13,padding:"11px 14px"}}/>
                <button onClick={lookupOrder} style={{background:"#2a2a2a",border:"2px solid #f4a261",color:"#f4a261",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:1,padding:"11px 16px",borderRadius:10,cursor:"pointer",flexShrink:0}}>FIND</button>
              </div>
              {lookupResult==="notfound"&&<div style={{background:"#2a1a1a",border:"1px solid #e63946",borderRadius:10,padding:"12px 14px",fontSize:12,color:"#e63946",fontWeight:700,textAlign:"center"}}>Order not found. Double-check your order number.</div>}
              {lookupResult&&lookupResult!=="notfound"&&(()=>{
                const o=lookupResult;
                const isArrived=arrivals.includes(o.num);
                const statusColor=o.status==="pickedup"?"#555":o.status==="ready"?"#4caf6e":"#f4a261";
                const statusLabel=o.status==="pickedup"?"✅ PICKED UP":o.status==="ready"?"🍪 READY FOR PICKUP":"⏳ BEING PREPARED";
                const statusDesc=o.status==="pickedup"?"Hope you loved it! See you next drop 🍪":o.status==="ready"?"Your box is ready! Tap below when you pull up.":"We're still baking. We'll text you when it's ready!";
                return(
                  <div style={{background:"#1a1a1a",border:`2px solid ${statusColor}`,borderRadius:14,padding:"18px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div><div style={{fontFamily:"'Bebas Neue'",fontSize:11,letterSpacing:2,color:"#555",marginBottom:3}}>ORDER STATUS</div><div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:statusColor,letterSpacing:1}}>{statusLabel}</div></div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:"#f4a261",letterSpacing:2}}>{o.num}</div>
                    </div>
                    <div style={{fontSize:12,color:"#888",fontWeight:600,marginBottom:14,lineHeight:1.5}}>{statusDesc}</div>
                    {o.status==="ready"&&!isArrived&&<button onClick={()=>iAmHere(o.num)} style={{width:"100%",background:"#4caf6e",color:"#fff",border:"2px solid #f5f0e8",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,padding:"14px",borderRadius:10,cursor:"pointer",boxShadow:"3px 3px 0 #2d7a4a"}}>🚗 I'M HERE!</button>}
                    {isArrived&&o.status!=="pickedup"&&<div style={{background:"#1a2a1e",border:"1px solid #4caf6e",borderRadius:8,padding:"10px",textAlign:"center",fontSize:12,color:"#4caf6e",fontWeight:700}}>✅ We know you're here! Coming to the door now.</div>}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {step===2&&(
          <div className="fu">
            <div style={{height:4,background:"#222",borderRadius:2,overflow:"hidden",marginBottom:26}}><div style={{height:"100%",width:"33%",background:"linear-gradient(to right,#e63946,#f4a261)",borderRadius:2}}/></div>
            <div style={{marginBottom:22}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:3}}>STEP 1 OF 3</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2,lineHeight:1,marginBottom:6}}>BUILD YOUR <span style={{color:"#e63946"}}>BOX</span></h2>
              <p style={{fontSize:13,color:"#888",fontWeight:600}}>Pick your style below. Each box = 4 cookies.</p>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:10}}>CHOOSE YOUR BOX TYPE</div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                {[{type:"variety",emoji:"🎉",title:"VARIETY PACK",desc:"1 of each flavor — Lemon, Chocolate, Banana Foster & Oatmeal Berry"},{type:"single",emoji:"🍪",title:"SINGLE FLAVOR",desc:"All 4 cookies the same flavor — you pick which one"},{type:"custom",emoji:"✏️",title:"CUSTOM MIX",desc:"Pick up to 4 flavors and we'll mix your box your way"}].map(bt=>(
                  <div key={bt.type} className={`ccard ${boxType===bt.type?"on":""}`} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",textAlign:"left"}} onClick={()=>{setBoxType(bt.type);if(bt.type==="variety")setSelected(COOKIES.map(c=>c.id));else setSelected([]);}}>
                    {boxType===bt.type&&<div style={{position:"absolute",top:10,right:10,background:"#e63946",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900}}>✓</div>}
                    <span style={{fontSize:32}}>{bt.emoji}</span>
                    <div><div style={{fontFamily:"'Bebas Neue'",fontSize:20,letterSpacing:1,color:"#f5f0e8"}}>{bt.title}</div><div style={{fontSize:11,color:"#888",fontWeight:600}}>{bt.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
            {boxType==="single"&&(
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:10}}>WHICH FLAVOR?</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {COOKIES.map(c=>(
                    <div key={c.id} className={`ccard ${selected.length===1&&selected[0]===c.id?"on":""}`} onClick={()=>setSelected([c.id])} style={{padding:"14px 12px"}}>
                      {selected.length===1&&selected[0]===c.id&&<div style={{position:"absolute",top:8,right:8,background:"#e63946",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>✓</div>}
                      <div style={{fontSize:30,marginBottom:6}}>{c.emoji}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:"#f5f0e8"}}>{c.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {boxType==="custom"&&(
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:10}}>PICK YOUR FLAVORS <span style={{color:"#f4a261"}}>({selected.length}/4)</span></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {COOKIES.map(c=>(
                    <div key={c.id} className={`ccard ${selected.includes(c.id)?"on":""}`} onClick={()=>toggleCookie(c.id)} style={{padding:"14px 12px"}}>
                      {selected.includes(c.id)&&<div style={{position:"absolute",top:8,right:8,background:"#e63946",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>✓</div>}
                      <div style={{fontSize:30,marginBottom:6}}>{c.emoji}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:15,letterSpacing:1,color:"#f5f0e8"}}>{c.name}</div>
                      <div style={{fontSize:10,color:"#666",fontWeight:600,marginTop:2}}>{c.desc}</div>
                    </div>
                  ))}
                </div>
                {selected.length===0&&<p style={{fontSize:11,color:"#e63946",fontWeight:800,marginTop:8}}>Pick at least 1 flavor to continue.</p>}
              </div>
            )}
            <div style={{background:"#1a1a1a",border:"2px solid #2a2a2a",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:13,letterSpacing:2,color:"#666",marginBottom:10}}>HOW MANY BOXES?</div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <button className="num-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:34,color:"#f4a261",minWidth:28,textAlign:"center"}}>{qty}</span>
                <button className="num-btn" onClick={()=>setQty(q=>Math.min(boxesLeft,q+1))}>+</button>
                <span style={{fontSize:12,color:"#555",fontWeight:700}}>× 4 cookies each</span>
              </div>
              {qty>=boxesLeft&&<div style={{fontSize:11,color:"#e63946",fontWeight:800,marginTop:8}}>⚠ Max available this week!</div>}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn-red" onClick={()=>setStep(3)} disabled={!boxType||selected.length===0} style={{flex:1}}>NEXT: PICKUP TIME →</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div className="fu">
            <div style={{height:4,background:"#222",borderRadius:2,overflow:"hidden",marginBottom:26}}><div style={{height:"100%",width:"66%",background:"linear-gradient(to right,#e63946,#f4a261)",borderRadius:2}}/></div>
            <div style={{marginBottom:22}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:3}}>STEP 2 OF 3</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2,lineHeight:1}}>YOUR INFO & <span style={{color:"#e63946"}}>PICKUP TIME</span></h2>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
              {[{label:"Your Name",val:name,set:setName,ph:"First & last name",type:"text"},{label:"Phone Number",val:phone,set:setPhone,ph:"(404) 555-0000",type:"tel"},{label:"Email Address",val:email,set:setEmail,ph:"you@email.com",type:"email",opt:true}].map(f=>(
                <div key={f.label}>
                  <label style={{fontSize:11,fontWeight:800,color:"#666",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>{f.label}{f.opt&&<span style={{color:"#555",fontWeight:600,textTransform:"none",letterSpacing:0}}> (optional)</span>}</label>
                  <input className="ifield" type={f.type} placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:800,color:"#666",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>Special Requests (optional)</label>
                <textarea className="ifield" placeholder="Allergies, notes, etc." value={note} onChange={e=>setNote(e.target.value)} rows={2} style={{resize:"none"}}/>
              </div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:11,fontWeight:800,color:"#666",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:10}}>Choose Pickup Time</label>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {DEFAULT_PICKUP_SLOTS.map(slot=>(
                  <button key={slot} className={`slot ${pickupSlot===slot?"on":""}`} onClick={()=>setPickupSlot(slot)}>📍 {slot}{pickupSlot===slot&&<span style={{float:"right",color:"#e63946"}}>✓</span>}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn-red" onClick={()=>setStep(4)} disabled={!name||!phone||!pickupSlot} style={{flex:1}}>REVIEW ORDER →</button>
            </div>
          </div>
        )}

        {step===4&&(
          <div className="fu">
            <div style={{height:4,background:"#222",borderRadius:2,overflow:"hidden",marginBottom:26}}><div style={{height:"100%",width:"90%",background:"linear-gradient(to right,#e63946,#f4a261)",borderRadius:2}}/></div>
            <div style={{marginBottom:22}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:3}}>STEP 3 OF 3</div>
              <h2 style={{fontFamily:"'Bebas Neue'",fontSize:36,letterSpacing:2,lineHeight:1}}>CONFIRM <span style={{color:"#e63946"}}>ORDER</span></h2>
            </div>
            <div style={{background:"#1a1a1a",border:"3px solid #2a2a2a",borderRadius:16,padding:"20px",marginBottom:16,boxShadow:"4px 4px 0 #2a2a2a"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:12}}>ORDER SUMMARY</div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:"#555",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>Box Type</div>
                <span style={{background:"#2a2a2a",border:"2px solid #f4a261",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700,color:"#f4a261"}}>{boxType==="variety"?"🎉 Variety Pack":boxType==="single"?"🍪 Single Flavor":"✏️ Custom Mix"}</span>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:"#555",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>Flavors</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{selected.map(id=>{const c=COOKIES.find(x=>x.id===id);return<span key={id} style={{background:"#2a2a2a",border:"2px solid #e63946",borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:700}}>{c.emoji} {c.name}</span>;})}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <div style={{background:"#111",borderRadius:10,padding:"11px 13px"}}>
                  <div style={{fontSize:10,color:"#555",fontWeight:800,textTransform:"uppercase",marginBottom:3}}>Boxes</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:24,color:"#f4a261"}}>{qty} BOX{qty>1?"ES":""}</div>
                  <div style={{fontSize:10,color:"#444",fontWeight:600}}>{qty*4} cookies</div>
                </div>
                <div style={{background:"#111",borderRadius:10,padding:"11px 13px"}}>
                  <div style={{fontSize:10,color:"#555",fontWeight:800,textTransform:"uppercase",marginBottom:3}}>Pickup</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:14,color:"#f5f0e8",lineHeight:1.2}}>{pickupSlot}</div>
                </div>
              </div>
              <div style={{borderTop:"1px solid #222",paddingTop:10,display:"flex",flexDirection:"column",gap:5}}>
                {[["Name",name],["Phone",phone],note&&["Note",note]].filter(Boolean).map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:"#555",fontWeight:700}}>{k}</span>
                    <span style={{fontSize:12,color:"#f5f0e8",fontWeight:700,maxWidth:"65%",textAlign:"right"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#f4e04d",border:"2px solid #1c1c1c",borderRadius:10,padding:"11px 15px",display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:20}}>🎁</span>
              <span style={{fontSize:12,color:"#5a3010",fontWeight:800}}>FREE BONUS COOKIE included with your first order!</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" onClick={()=>setStep(3)}>← Back</button>
              <button className="btn-red" onClick={submitOrder} disabled={submitting} style={{flex:1}}>{submitting?<><span className="sp"/>PLACING ORDER...</>:"PLACE ORDER 🍪"}</button>
            </div>
            <p style={{textAlign:"center",fontSize:11,color:"#444",marginTop:12,fontWeight:700,lineHeight:1.5}}>You'll receive a confirmation text from {OWNER_PHONE}</p>
          </div>
        )}

        {step===5&&(
          <div className="fu" style={{textAlign:"center"}}>
            <div className="pop" style={{fontSize:76,marginBottom:12}}>🍪</div>
            <h2 style={{fontFamily:"'Bebas Neue'",fontSize:48,letterSpacing:3,lineHeight:1,marginBottom:10}}>ORDER<br/><span style={{color:"#4caf6e"}}>CONFIRMED!</span></h2>
            <p style={{fontFamily:"'Permanent Marker'",fontSize:17,color:"#f4a261",marginBottom:24}}>Can't wait to bake for you! 🙌</p>
            <div style={{background:"#1a1a1a",border:"3px solid #4caf6e",borderRadius:16,padding:"20px",marginBottom:16,boxShadow:"4px 4px 0 #4caf6e",textAlign:"left"}}>
              <div style={{textAlign:"center",marginBottom:12}}>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555"}}>YOUR ORDER NUMBER</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:32,color:"#f4a261",letterSpacing:3}}>{orderNum}</div>
                <div style={{fontSize:11,color:"#666",fontWeight:600,marginTop:2}}>Save this — you'll need it to check in</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[["Flavors",selected.map(id=>COOKIES.find(c=>c.id===id)?.emoji).join(" ")],["Pickup",pickupSlot]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #222",paddingBottom:7}}>
                    <span style={{fontSize:12,color:"#555",fontWeight:700}}>{k}</span>
                    <span style={{fontSize:12,color:"#f5f0e8",fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#1a1a1a",border:"2px solid #2a2a2a",borderRadius:12,padding:"14px 16px",marginBottom:16,textAlign:"left"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:12,letterSpacing:2,color:"#555",marginBottom:6}}>HOW PICKUP WORKS</div>
              <div style={{fontSize:12,color:"#999",fontWeight:600,lineHeight:1.7}}>
                1️⃣ We'll text <span style={{color:"#f4a261"}}>{phone}</span> when your box is ready<br/>
                2️⃣ Come to the pickup spot<br/>
                3️⃣ Tap <span style={{color:"#4caf6e",fontWeight:800}}>"I'm Here"</span> below so we know you've arrived
              </div>
            </div>
            {!iHereSuccess
              ?<button onClick={()=>iAmHere(orderNum)} style={{width:"100%",background:"#4caf6e",color:"#fff",border:"3px solid #f5f0e8",fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,padding:"18px",borderRadius:12,cursor:"pointer",boxShadow:"4px 4px 0 #2d7a4a",marginBottom:16}}>🚗 I'M HERE — PULLING UP!</button>
              :<div style={{background:"#1a2a1e",border:"2px solid #4caf6e",borderRadius:12,padding:"16px",marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:6}}>✅</div>
                <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:"#4caf6e",letterSpacing:1}}>WE'VE BEEN NOTIFIED!</div>
                <div style={{fontSize:12,color:"#5a8a5e",fontWeight:600,marginTop:4}}>Come to the door — your cookies are ready 🍪</div>
              </div>
            }
            <button className="btn-red" onClick={()=>{setStep(1);setSelected([]);setBoxType("");setQty(1);setPickupSlot("");setName("");setPhone("");setEmail("");setNote("");setIHereSuccess(false);}}>ORDER AGAIN 🍪</button>
          </div>
        )}

      </div>
    </div>
  );
}
