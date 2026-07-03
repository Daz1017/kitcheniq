import { useState, useContext, createContext, Fragment, ReactNode, CSSProperties, ChangeEvent } from 'react';

// ════════════════════════════════════════════════════════════════════════════
// THEME / SHARED STYLES
// ════════════════════════════════════════════════════════════════════════════

const C = {
  navy:'#0F1623', panel:'#162032', card:'#1A2840', border:'#2A3F5F',
  amber:'#F59E0B', emerald:'#10B981', red:'#EF4444', blue:'#378ADD',
  purple:'#A855F7', text:'#F8FAFC', muted:'#94A3B8', dim:'#4A6080',
  mono:"ui-monospace,'SF Mono',monospace",
};

const card: CSSProperties = { background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:16, marginBottom:12 };
const label: CSSProperties = { fontSize:11, color:C.muted, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:0.7 };
const inputSt: CSSProperties = { width:'100%', padding:'8px 10px', background:C.navy, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box' };
const selectSt: CSSProperties = { ...inputSt };
const th: CSSProperties = { fontSize:10, textTransform:'uppercase', letterSpacing:0.7, color:C.dim, padding:'6px 8px', borderBottom:`1px solid ${C.border}`, textAlign:'left', whiteSpace:'nowrap' };
const td: CSSProperties = { padding:'7px 8px', borderBottom:'1px solid rgba(42,63,95,0.4)', verticalAlign:'middle', fontSize:12 };
const tdInput: CSSProperties = { width:'100%', padding:'4px 6px', background:'transparent', border:'1px solid transparent', borderRadius:4, color:C.text, fontSize:12, outline:'none' };
const sectionTitle: CSSProperties = { fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:12, paddingBottom:8, borderBottom:`1px solid ${C.border}` };

// ════════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function Btn({ primary, danger, children, onClick, small }: { primary?:boolean; danger?:boolean; children:ReactNode; onClick?:()=>void; small?:boolean }) {
  return (
    <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:5, padding: small ? '4px 10px' : '7px 14px', borderRadius:6, fontSize: small ? 11 : 12, cursor:'pointer', border:`1px solid ${primary ? C.amber : danger ? C.red : C.border}`, background: primary ? C.amber : danger ? 'rgba(239,68,68,0.12)' : 'transparent', color: primary ? '#0F1623' : danger ? C.red : C.muted, fontWeight: primary ? 600 : 400 }}>
      {children}
    </button>
  );
}

type BadgeColor = 'red'|'amber'|'green'|'blue'|'purple';

function Badge({ color, children }: { color:BadgeColor; children:ReactNode }) {
  const colors: Record<BadgeColor, [string,string,string]> = {
    red:    [C.red,'rgba(239,68,68,0.12)','rgba(239,68,68,0.3)'],
    amber:  [C.amber,'rgba(245,158,11,0.1)','rgba(245,158,11,0.3)'],
    green:  [C.emerald,'rgba(16,185,129,0.1)','rgba(16,185,129,0.25)'],
    blue:   [C.blue,'rgba(55,138,221,0.1)','rgba(55,138,221,0.25)'],
    purple: [C.purple,'rgba(168,85,247,0.1)','rgba(168,85,247,0.25)'],
  };
  const [fg,bg,bd] = colors[color];
  return <span style={{ fontSize:10, padding:'2px 7px', borderRadius:3, background:bg, border:`1px solid ${bd}`, color:fg, whiteSpace:'nowrap' }}>{children}</span>;
}

function KpiCard({ label, value, color, delta, deltaUp }: { label:string; value:string; color?:string; delta?:string; deltaUp?:boolean }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
      <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:500, fontFamily:C.mono, lineHeight:1, color:color||C.text }}>{value}</div>
      {delta && <div style={{ fontSize:11, marginTop:4, color:deltaUp ? C.red : C.emerald }}>{delta}</div>}
    </div>
  );
}

function StatRow({ label, value, valueColor }: { label:string; value:string; valueColor?:string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(42,63,95,0.5)', fontSize:12 }}>
      <span style={{ color:C.muted }}>{label}</span>
      <span style={{ fontFamily:C.mono, fontWeight:500, color:valueColor||C.text }}>{value}</span>
    </div>
  );
}

function AlertItem({ iconColor, iconBg, title, sub }: { iconColor:string; iconBg:string; title:string; sub:string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:24, height:24, borderRadius:5, background:iconBg, color:iconColor, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13 }}>⚠</div>
      <div>
        <div style={{ color:C.text, fontWeight:500, fontSize:12 }}>{title}</div>
        <div style={{ color:C.muted, fontSize:11, marginTop:1 }}>{sub}</div>
      </div>
    </div>
  );
}

// Reusable date-range picker with quick presets and free custom start/end selection.
// Used by Dashboard (single period) and Analytics (period A vs period B comparison).
function DateRangePicker({ start, end, onChange, compact }: { start:string; end:string; onChange:(start:string, end:string)=>void; compact?:boolean }) {
  const shiftRange = (days: number) => {
    const s = new Date(start), e = new Date(end);
    s.setDate(s.getDate() + days); e.setDate(e.getDate() + days);
    onChange(s.toISOString().split('T')[0], e.toISOString().split('T')[0]);
  };
  const applyPreset = (preset: 'thisWeek'|'lastWeek'|'thisMonth'|'last7'|'last30') => {
    const today = new Date();
    let s = new Date(today), e = new Date(today);
    if (preset === 'thisWeek') { s = new Date(mondayOf()); e = new Date(s); e.setDate(e.getDate()+6); }
    else if (preset === 'lastWeek') { s = new Date(mondayOf()); s.setDate(s.getDate()-7); e = new Date(s); e.setDate(e.getDate()+6); }
    else if (preset === 'thisMonth') { s = new Date(today.getFullYear(), today.getMonth(), 1); e = new Date(today.getFullYear(), today.getMonth()+1, 0); }
    else if (preset === 'last7') { s.setDate(s.getDate()-6); }
    else if (preset === 'last30') { s.setDate(s.getDate()-29); }
    onChange(s.toISOString().split('T')[0], e.toISOString().split('T')[0]);
  };
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
        <Btn small onClick={()=>shiftRange(-7)}>◀ Prev</Btn>
        <input type="date" style={{ ...inputSt, width:130, fontFamily:C.mono, fontSize:12 }} value={start} onChange={e=>onChange(e.target.value, end)} />
        <span style={{ color:C.muted, fontSize:12 }}>to</span>
        <input type="date" style={{ ...inputSt, width:130, fontFamily:C.mono, fontSize:12 }} value={end} onChange={e=>onChange(start, e.target.value)} />
        <Btn small onClick={()=>shiftRange(7)}>Next ▶</Btn>
      </div>
      {!compact && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <Btn small onClick={()=>applyPreset('thisWeek')}>This week</Btn>
          <Btn small onClick={()=>applyPreset('lastWeek')}>Last week</Btn>
          <Btn small onClick={()=>applyPreset('last7')}>Last 7 days</Btn>
          <Btn small onClick={()=>applyPreset('last30')}>Last 30 days</Btn>
          <Btn small onClick={()=>applyPreset('thisMonth')}>This month</Btn>
        </div>
      )}
    </div>
  );
}

// Simple flat horizontal bar comparison — no external chart library needed.
function ComparisonBar({ labelA, labelB, valueA, valueB, format }: { labelA:string; labelB:string; valueA:number; valueB:number; format:(n:number)=>string }) {
  const max = Math.max(valueA, valueB, 0.01);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{ width:70, fontSize:11, color:C.blue, textAlign:'right' }}>{labelA}</span>
        <div style={{ flex:1, height:16, background:'rgba(42,63,95,0.4)', borderRadius:4, overflow:'hidden' }}>
          <div style={{ width:`${pctA}%`, height:'100%', background:C.blue, borderRadius:4 }} />
        </div>
        <span style={{ width:70, fontSize:11, fontFamily:C.mono, color:C.text }}>{format(valueA)}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:70, fontSize:11, color:C.purple, textAlign:'right' }}>{labelB}</span>
        <div style={{ flex:1, height:16, background:'rgba(42,63,95,0.4)', borderRadius:4, overflow:'hidden' }}>
          <div style={{ width:`${pctB}%`, height:'100%', background:C.purple, borderRadius:4 }} />
        </div>
        <span style={{ width:70, fontSize:11, fontFamily:C.mono, color:C.text }}>{format(valueB)}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DATA MODEL + SEED DATA
// ════════════════════════════════════════════════════════════════════════════

interface PriceHistoryEntry { date:string; price:string; invoiceId?:string; }

interface Ingredient {
  id:number; name:string; category:string; vendor:string; vendorItemCode:string;
  purchaseUnit:string; packSizeOz:string; currentCost:string; baselineCost:string;
  priceHistory:PriceHistoryEntry[]; storage:string; shelfLifeDays:string;
  parLevel:string; countUnit:string; minQty:string; maxQty:string; allergens:string;
  glutenFree:boolean; vegetarian:boolean; vegan:boolean; notes:string;
}

interface RecipeComponent { id:number; refType:'ingredient'|'recipe'; refId:number; refName:string; qty:string; unit:string; }

interface Recipe {
  id:number; name:string; category:string; type:'batch'|'plate';
  yieldQty:string; yieldUnit:string; portionSize:string; portionUnit:string;
  components:RecipeComponent[];
  sellPrice:string;
  prepInstructions:string; cookingInstructions:string; holdingInstructions:string;
  shelfLifeDays:string; haccpNotes:string; allergens:string; station:string;
  plateGuide:string; version:number;
}

interface Invoice {
  id:number; invoiceNumber:string; vendor:string; invoiceDate:string; deliveryDate:string;
  poNumber:string;
  lines:{ id:number; ingredientId:number|null; itemName:string; qty:string; unit:string; cost:string; previousCost:string }[];
  status:'pending'|'reviewed'|'discrepancy';
}

interface InventoryRow {
  id:number; ingredientId:number|null; name:string; storage:string;
  beginningQty:string; purchasesQty:string; endingQty:string;
  theoreticalUsage:string; actualUsage:string; parLevel:string; countUnit:string;
}

interface WasteEntry {
  id:number; date:string; item:string; qty:string; unit:string; cost:string;
  reason:string; station:string; employee:string; notes:string; correctiveAction:string;
}

interface YieldTest {
  id:number; ingredientName:string; rawWeightOz:string; trimWeightOz:string;
  usableWeightOz:string; costBeforeYield:string; notes:string;
}

interface SopEntry {
  id:number; title:string; station:string; type:'sop'|'plating'|'opening'|'closing'|'training';
  content:string;
}

interface WeeklyEntry { weekStart:string; weeklySales:string; foodSpend:string; }

interface Vendor {
  id:number; name:string; repName:string; phone:string; email:string;
  accountNumber:string; deliveryDays:string; orderMinimum:string;
  paymentTerms:string; notes:string;
}

const SEED_INGREDIENTS: Ingredient[] = [
  { id:1,  name:'Lump Crab Meat',       category:'Seafood',   vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'1 lb tub',   packSizeOz:'16',  currentCost:'18.00', baselineCost:'18.00', priceHistory:[{date:'2025-01-01',price:'18.00'}], storage:'Walk-In',     shelfLifeDays:'4', parLevel:'10', countUnit:'lbs',   minQty:'4',  maxQty:'20', allergens:'Shellfish', glutenFree:true,  vegetarian:false, vegan:false, notes:'' },
  { id:2,  name:'Grouper Fingers',      category:'Seafood',   vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'10 lb case', packSizeOz:'160', currentCost:'9.50',  baselineCost:'9.50',  priceHistory:[{date:'2025-01-01',price:'9.50'}],  storage:'Freezer',     shelfLifeDays:'90',parLevel:'2',  countUnit:'cases', minQty:'1',  maxQty:'4',  allergens:'Fish',      glutenFree:true,  vegetarian:false, vegan:false, notes:'' },
  { id:3,  name:'Lobster Meat',         category:'Seafood',   vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'2 lb pack',  packSizeOz:'32',  currentCost:'28.00', baselineCost:'28.00', priceHistory:[{date:'2025-01-01',price:'28.00'}], storage:'Walk-In',     shelfLifeDays:'4', parLevel:'4',  countUnit:'packs',  minQty:'1',  maxQty:'8',  allergens:'Shellfish', glutenFree:true,  vegetarian:false, vegan:false, notes:'' },
  { id:4,  name:'Purcells (Oysters)',   category:'Seafood',   vendor:'Local Seafood',  vendorItemCode:'', purchaseUnit:'each',       packSizeOz:'1',   currentCost:'0.85',  baselineCost:'0.85',  priceHistory:[{date:'2025-01-01',price:'0.85'}],  storage:'Walk-In',     shelfLifeDays:'7', parLevel:'200',countUnit:'each',   minQty:'50', maxQty:'400',allergens:'Shellfish', glutenFree:true,  vegetarian:false, vegan:false, notes:'Verify price every delivery' },
  { id:5,  name:'Pineapple',            category:'Produce',   vendor:'Produce Vendor', vendorItemCode:'', purchaseUnit:'case',       packSizeOz:'160', currentCost:'20.00', baselineCost:'20.00', priceHistory:[{date:'2025-01-01',price:'20.00'}], storage:'Walk-In',     shelfLifeDays:'7', parLevel:'1',  countUnit:'cases',  minQty:'0',  maxQty:'3',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:true,  notes:'' },
  { id:6,  name:'Lime Juice',           category:'Dry Goods', vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'bottle',     packSizeOz:'32',  currentCost:'8.00',  baselineCost:'8.00',  priceHistory:[{date:'2025-01-01',price:'8.00'}],  storage:'Dry Storage', shelfLifeDays:'180',parLevel:'4', countUnit:'bottles',minQty:'1',  maxQty:'8',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:true,  notes:'' },
  { id:7,  name:'Honey',                category:'Dry Goods', vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'bottle',     packSizeOz:'48',  currentCost:'12.00', baselineCost:'12.00', priceHistory:[{date:'2025-01-01',price:'12.00'}], storage:'Dry Storage', shelfLifeDays:'365',parLevel:'2', countUnit:'bottles',minQty:'1',  maxQty:'4',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:false, notes:'' },
  { id:8,  name:'Red Onion',            category:'Produce',   vendor:'Produce Vendor', vendorItemCode:'', purchaseUnit:'case',       packSizeOz:'160', currentCost:'18.00', baselineCost:'18.00', priceHistory:[{date:'2025-01-01',price:'18.00'}], storage:'Walk-In',     shelfLifeDays:'21',parLevel:'1', countUnit:'cases',  minQty:'0',  maxQty:'2',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:true,  notes:'' },
  { id:9,  name:'Cilantro',             category:'Produce',   vendor:'Produce Vendor', vendorItemCode:'', purchaseUnit:'bunch pack', packSizeOz:'16',  currentCost:'8.00',  baselineCost:'8.00',  priceHistory:[{date:'2025-01-01',price:'8.00'}],  storage:'Walk-In',     shelfLifeDays:'7', parLevel:'2',  countUnit:'bunches',minQty:'1',  maxQty:'4',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:true,  notes:'' },
  { id:10, name:'I.O. Mango (Bar Mix)', category:'Bar Mixes', vendor:'Cheney Bros',    vendorItemCode:'', purchaseUnit:'bottle',     packSizeOz:'32',  currentCost:'12.00', baselineCost:'12.00', priceHistory:[{date:'2025-01-01',price:'12.00'}], storage:'Bar',         shelfLifeDays:'180',parLevel:'2', countUnit:'bottles',minQty:'1',  maxQty:'4',  allergens:'',          glutenFree:true,  vegetarian:true,  vegan:true,  notes:'' },
];

const SEED_RECIPES: Recipe[] = [
  { id:101, name:'Mango Chili Sauce 1x', category:'Sauce', type:'batch', yieldQty:'64', yieldUnit:'oz', portionSize:'1', portionUnit:'oz',
    components:[
      { id:1, refType:'ingredient', refId:5, refName:'Pineapple',  qty:'2', unit:'cup' },
      { id:2, refType:'ingredient', refId:6, refName:'Lime Juice', qty:'4', unit:'T' },
      { id:3, refType:'ingredient', refId:7, refName:'Honey',      qty:'2', unit:'T' },
    ],
    sellPrice:'', prepInstructions:'Blend pineapple, lime juice, and honey until smooth. Strain.', cookingInstructions:'',
    holdingInstructions:'Refrigerate in sealed container', shelfLifeDays:'5', haccpNotes:'Keep below 40°F', allergens:'', station:'Prep', plateGuide:'', version:1 },

  { id:102, name:'Cole Slaw Batch 1x', category:'Side', type:'batch', yieldQty:'', yieldUnit:'oz', portionSize:'2', portionUnit:'oz',
    components:[ { id:1, refType:'ingredient', refId:8, refName:'Red Onion', qty:'', unit:'oz' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'Refrigerate', shelfLifeDays:'3', haccpNotes:'', allergens:'', station:'Prep', plateGuide:'', version:1 },

  { id:103, name:'Lobster Bisque 1x', category:'Soup', type:'batch', yieldQty:'', yieldUnit:'qt', portionSize:'8', portionUnit:'oz',
    components:[ { id:1, refType:'ingredient', refId:3, refName:'Lobster Meat', qty:'', unit:'oz' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'Simmer 45 min', holdingInstructions:'Hold above 140°F', shelfLifeDays:'3', haccpNotes:'Hot hold above 140°F', allergens:'Shellfish, Dairy', station:'Sauté', plateGuide:'', version:1 },

  { id:201, name:'Grouper Tacos', category:'Entree', type:'plate', yieldQty:'1', yieldUnit:'plate', portionSize:'1', portionUnit:'plate',
    components:[
      { id:1, refType:'ingredient', refId:2,   refName:'Grouper Fingers',      qty:'6', unit:'oz' },
      { id:2, refType:'recipe',     refId:101, refName:'Mango Chili Sauce 1x', qty:'1', unit:'oz' },
      { id:3, refType:'recipe',     refId:102, refName:'Cole Slaw Batch 1x',   qty:'2', unit:'oz' },
    ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'Fry grouper at 350°F for 4 min', holdingInstructions:'', shelfLifeDays:'', haccpNotes:'Internal temp 145°F', allergens:'Fish', station:'Fry', plateGuide:'3 tortillas, fan grouper, sauce drizzle, slaw on side', version:1 },

  { id:202, name:'Lobster Roll', category:'Sandwich', type:'plate', yieldQty:'1', yieldUnit:'plate', portionSize:'1', portionUnit:'plate',
    components:[ { id:1, refType:'ingredient', refId:3, refName:'Lobster Meat', qty:'4', unit:'oz' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'', shelfLifeDays:'', haccpNotes:'', allergens:'Shellfish', station:'Raw Bar', plateGuide:'', version:1 },

  { id:203, name:'Maryland Crab Cakes', category:'Entree', type:'plate', yieldQty:'1', yieldUnit:'plate', portionSize:'1', portionUnit:'plate',
    components:[ { id:1, refType:'ingredient', refId:1, refName:'Lump Crab Meat', qty:'6', unit:'oz' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'', shelfLifeDays:'', haccpNotes:'', allergens:'Shellfish', station:'Sauté', plateGuide:'', version:1 },

  { id:204, name:'Lobster Bisque (bowl)', category:'Soup', type:'plate', yieldQty:'1', yieldUnit:'plate', portionSize:'1', portionUnit:'plate',
    components:[ { id:1, refType:'recipe', refId:103, refName:'Lobster Bisque 1x', qty:'8', unit:'oz' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'', shelfLifeDays:'', haccpNotes:'', allergens:'Shellfish, Dairy', station:'Expo', plateGuide:'', version:1 },

  { id:205, name:'Fresh Oyster', category:'Raw Bar', type:'plate', yieldQty:'1', yieldUnit:'plate', portionSize:'1', portionUnit:'ea',
    components:[ { id:1, refType:'ingredient', refId:4, refName:'Purcells (Oysters)', qty:'1', unit:'ea' } ],
    sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'On ice', shelfLifeDays:'', haccpNotes:'Keep below 40°F until service', allergens:'Shellfish', station:'Raw Bar', plateGuide:'On crushed ice with lemon and mignonette', version:1 },
];

const SEED_INVOICES: Invoice[] = [];
const SEED_WASTE: WasteEntry[] = [];
const SEED_VENDORS: Vendor[] = [
  { id:1, name:'Cheney Bros',    repName:'', phone:'', email:'', accountNumber:'', deliveryDays:'Mon, Wed, Fri', orderMinimum:'$250',  paymentTerms:'Net 30', notes:'Primary food vendor — seafood, dry goods, dairy' },
  { id:2, name:'Local Seafood',  repName:'', phone:'', email:'', accountNumber:'', deliveryDays:'Daily',         orderMinimum:'',      paymentTerms:'COD',    notes:'Purcells oysters — verify price every delivery' },
  { id:3, name:'Produce Vendor', repName:'', phone:'', email:'', accountNumber:'', deliveryDays:'Tue, Thu',      orderMinimum:'$100',  paymentTerms:'Net 7',  notes:'Pineapple, onions, cilantro, produce' },
  { id:4, name:'Sysco',          repName:'', phone:'', email:'', accountNumber:'', deliveryDays:'Mon, Thu',      orderMinimum:'$300',  paymentTerms:'Net 30', notes:'Non-food supplies, paper goods' },
];

const SEED_YIELD_TESTS: YieldTest[] = [
  { id:1, ingredientName:'Lobster Meat (whole, pre-pick)', rawWeightOz:'', trimWeightOz:'', usableWeightOz:'', costBeforeYield:'', notes:'' },
];
const SEED_SOP: SopEntry[] = [
  { id:1, title:'Raw Bar Opening Checklist', station:'Raw Bar', type:'opening', content:'1. Check ice levels\n2. Verify oyster temps below 40°F\n3. Stock mignonette, cocktail sauce, lemons\n4. Sanitize shucking station' },
  { id:2, title:'Fry Station Closing Checklist', station:'Fry', type:'closing', content:'1. Filter fryer oil\n2. Break down breading station\n3. Sanitize all surfaces\n4. Log oil temp and clarity' },
];

const CATEGORIES = ['Seafood','Produce','Dry Goods','Dairy','Bar Mixes','Paper Goods','Soda','Other'];
const STORAGE_AREAS = ['Walk-In','Freezer','Dry Storage','Bar','Prep Cooler','Raw Bar','Dessert Station','Line'];
const STATIONS = ['Raw Bar','Grill','Fry','Sauté','Pantry','Prep','Dessert','Expo'];
const UNITS = ['oz','lb','ea','cup','T','tsp','qt','gal','ml','pinch','bunch','case','bottle'];
const COUNT_UNITS = ['lbs','oz','cases','each','packs','bottles','bunches','gallons','quarts','bags','boxes'];
const WASTE_REASONS = ['Spoilage','Overproduction','Overportioning','Burnt product','Dropped product','Wrong prep','Expired prep','Returned food','Comp — food issue','Void — kitchen issue','Vendor shortage','Vendor quality issue'];
const ROLES = ['Owner','Executive Chef','Sous Chef','Kitchen Manager','Prep Cook','Line Cook'];

// ════════════════════════════════════════════════════════════════════════════
// COST ENGINE — recursive multi-level recipe cost resolution
// ════════════════════════════════════════════════════════════════════════════

const UNIT_TO_OZ: Record<string, number> = {
  oz:1, lb:16, ea:1, cup:8, T:0.5, tsp:0.166, qt:32, gal:128, ml:0.0338, pinch:0.02, bunch:4, case:1, bottle:1,
};

function toOz(qty: string, unit: string): number {
  const n = parseFloat(qty || '0');
  if (!n) return 0;
  const factor = UNIT_TO_OZ[unit] ?? 1;
  return n * factor;
}

function ingredientCostPerOz(ing: Ingredient): number {
  const cost = parseFloat(ing.currentCost || '0');
  const oz = parseFloat(ing.packSizeOz || '1');
  if (!cost || !oz) return 0;
  return cost / oz;
}

interface ResolveContext { ingredients: Ingredient[]; recipes: Recipe[]; visiting: Set<number>; }

function resolveRecipeCost(recipeId: number, ctx: ResolveContext): { totalCost:number; costPerUnit:number; missing:string[] } {
  const recipe = ctx.recipes.find(r => r.id === recipeId);
  if (!recipe) return { totalCost:0, costPerUnit:0, missing:['Recipe not found'] };
  if (ctx.visiting.has(recipeId)) return { totalCost:0, costPerUnit:0, missing:['Circular reference detected'] };

  ctx.visiting.add(recipeId);
  let totalCost = 0;
  const missing: string[] = [];

  for (const comp of recipe.components) {
    const compOz = toOz(comp.qty, comp.unit);
    if (compOz === 0) { missing.push(`${comp.refName}: enter quantity`); continue; }

    if (comp.refType === 'ingredient') {
      const ing = ctx.ingredients.find(i => i.id === comp.refId);
      if (!ing) { missing.push(`${comp.refName}: ingredient not found`); continue; }
      const perOz = ingredientCostPerOz(ing);
      if (!perOz) { missing.push(`${comp.refName}: enter price`); continue; }
      totalCost += perOz * compOz;
    } else {
      const sub = resolveRecipeCost(comp.refId, ctx);
      missing.push(...sub.missing.map(m => `${comp.refName} → ${m}`));
      totalCost += sub.costPerUnit * compOz;
    }
  }

  ctx.visiting.delete(recipeId);

  const yieldOz = recipe.type === 'batch' ? toOz(recipe.yieldQty, recipe.yieldUnit) : toOz(recipe.portionSize, recipe.portionUnit);
  const costPerUnit = yieldOz > 0 ? totalCost / yieldOz : totalCost;

  return { totalCost, costPerUnit, missing: [...new Set(missing)] };
}

function recipeCost(recipe: Recipe, ingredients: Ingredient[], recipes: Recipe[]) {
  return resolveRecipeCost(recipe.id, { ingredients, recipes, visiting: new Set() });
}

function foodCostPct(plateCost: number, sellPrice: number): number | null {
  if (!sellPrice) return null;
  return (plateCost / sellPrice) * 100;
}

function idealSellPrice(plateCost: number, targetFcPct: number): number {
  if (!targetFcPct) return 0;
  return plateCost / (targetFcPct / 100);
}

function findDependents(refType: 'ingredient'|'recipe', refId: number, recipes: Recipe[]): Recipe[] {
  const direct = recipes.filter(r => r.components.some(c => c.refType === refType && c.refId === refId));
  const directIds = new Set(direct.map(r => r.id));
  const indirect = recipes.filter(r => !directIds.has(r.id) && r.components.some(c => c.refType === 'recipe' && directIds.has(c.refId)));
  return [...direct, ...indirect];
}

function priceVariancePct(current: string, baseline: string): number | null {
  const c = parseFloat(current || '0');
  const b = parseFloat(baseline || '0');
  if (!b) return null;
  return ((c - b) / b) * 100;
}

function mondayOf(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL STORE (React Context shared across all pages)
// ════════════════════════════════════════════════════════════════════════════

interface StoreShape {
  ingredients: Ingredient[]; setIngredients: (v: Ingredient[] | ((p:Ingredient[])=>Ingredient[])) => void;
  recipes: Recipe[]; setRecipes: (v: Recipe[] | ((p:Recipe[])=>Recipe[])) => void;
  invoices: Invoice[]; setInvoices: (v: Invoice[] | ((p:Invoice[])=>Invoice[])) => void;
  inventory: InventoryRow[]; setInventory: (v: InventoryRow[] | ((p:InventoryRow[])=>InventoryRow[])) => void;
  waste: WasteEntry[]; setWaste: (v: WasteEntry[] | ((p:WasteEntry[])=>WasteEntry[])) => void;
  yieldTests: YieldTest[]; setYieldTests: (v: YieldTest[] | ((p:YieldTest[])=>YieldTest[])) => void;
  sops: SopEntry[]; setSops: (v: SopEntry[] | ((p:SopEntry[])=>SopEntry[])) => void;
  vendors: Vendor[]; setVendors: (v: Vendor[] | ((p:Vendor[])=>Vendor[])) => void;
  weeklyEntries: WeeklyEntry[]; setWeeklyEntries: (v: WeeklyEntry[] | ((p:WeeklyEntry[])=>WeeklyEntry[])) => void;
  targetFcPct: number; setTargetFcPct: (v:number) => void;
  role: string; setRole: (r:string) => void;
}

const StoreContext = createContext<StoreShape | null>(null);

// ─── Persistence layer ────────────────────────────────────────────────────────
// usePersistedState behaves exactly like useState but reads the initial value
// from localStorage and writes every update back automatically.
// Key prefix 'kiq_' namespaces all data so it doesn't collide with other apps.
// To clear all data: localStorage.clear() in the browser console.
function usePersistedState<T>(key: string, seed: T): [T, (v: T | ((p:T)=>T)) => void] {
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const stored = localStorage.getItem('kiq_' + key);
      return stored ? (JSON.parse(stored) as T) : seed;
    } catch {
      return seed;
    }
  });

  const setState = (v: T | ((p:T)=>T)) => {
    setStateRaw(prev => {
      const next = typeof v === 'function' ? (v as (p:T)=>T)(prev) : v;
      try { localStorage.setItem('kiq_' + key, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [state, setState];
}

function StoreProvider({ children }: { children: ReactNode }) {
  const [ingredients,   setIngredients]   = usePersistedState<Ingredient[]>  ('ingredients',   SEED_INGREDIENTS);
  const [recipes,       setRecipes]        = usePersistedState<Recipe[]>      ('recipes',       SEED_RECIPES);
  const [invoices,      setInvoices]       = usePersistedState<Invoice[]>     ('invoices',      SEED_INVOICES);
  const [inventory,     setInventory]      = usePersistedState<InventoryRow[]>('inventory',     []);
  const [waste,         setWaste]          = usePersistedState<WasteEntry[]>  ('waste',         SEED_WASTE);
  const [yieldTests,    setYieldTests]     = usePersistedState<YieldTest[]>   ('yieldTests',    SEED_YIELD_TESTS);
  const [sops,          setSops]           = usePersistedState<SopEntry[]>    ('sops',          SEED_SOP);
  const [vendors,       setVendors]        = usePersistedState<Vendor[]>      ('vendors',       SEED_VENDORS);
  const [weeklyEntries, setWeeklyEntries]  = usePersistedState<WeeklyEntry[]> ('weeklyEntries', []);
  const [targetFcPct,   setTargetFcPct]    = usePersistedState<number>        ('targetFcPct',   29);
  const [role,          setRole]           = usePersistedState<string>        ('role',          'Executive Chef');

  return (
    <StoreContext.Provider value={{ ingredients, setIngredients, recipes, setRecipes, invoices, setInvoices, inventory, setInventory, waste, setWaste, yieldTests, setYieldTests, sops, setSops, vendors, setVendors, weeklyEntries, setWeeklyEntries, targetFcPct, setTargetFcPct, role, setRole }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

function Dashboard() {
  const { ingredients, recipes, waste, invoices, weeklyEntries, setWeeklyEntries } = useStore();
  const [rangeStart, setRangeStart] = useState(mondayOf());
  const [rangeEnd, setRangeEnd] = useState(() => { const d = new Date(mondayOf()); d.setDate(d.getDate()+6); return d.toISOString().split('T')[0]; });

  const weekStart = mondayOf(rangeStart);
  const currentEntry = weeklyEntries.find(w => w.weekStart === weekStart);
  const weeklySales = currentEntry?.weeklySales || '';
  const foodSpend = currentEntry?.foodSpend || '';

  const updateEntry = (field: 'weeklySales'|'foodSpend', val: string) => {
    setWeeklyEntries(prev => {
      const exists = prev.find(w => w.weekStart === weekStart);
      if (exists) return prev.map(w => w.weekStart === weekStart ? { ...w, [field]: val } : w);
      return [...prev, { weekStart, weeklySales:'', foodSpend:'', [field]: val } as WeeklyEntry];
    });
  };

  const onRangeChange = (s: string, e: string) => { setRangeStart(s); setRangeEnd(e); };

  const inRange = (dateStr: string) => dateStr >= rangeStart && dateStr <= rangeEnd;
  const wasteInRange = waste.filter(w => inRange(w.date));
  const invoicesInRange = invoices.filter(i => inRange(i.invoiceDate));

  const fcPct = weeklySales && foodSpend ? (parseFloat(foodSpend) / parseFloat(weeklySales)) * 100 : null;
  const fcColor = fcPct === null ? C.muted : fcPct > 31 ? C.red : fcPct > 29 ? C.amber : C.emerald;

  const spikes = ingredients
    .map(i => ({ ing:i, pct: priceVariancePct(i.currentCost, i.baselineCost) }))
    .filter(x => x.pct !== null && x.pct > 5);

  const plates = recipes.filter(r => r.type === 'plate');
  const platesMissingPrice = plates.filter(p => !p.sellPrice);
  const totalWaste = wasteInRange.reduce((s,w) => s + (parseFloat(w.cost||'0')||0), 0);

  const weeksWithData = weeklyEntries.filter(w => w.weeklySales || w.foodSpend).sort((a,b)=>b.weekStart.localeCompare(a.weekStart));

  return (
    <div>
      <div style={{ ...card, border:`1px solid ${C.amber}`, marginBottom:14 }}>
        <div style={sectionTitle}>Date range — drives waste, invoices, and weekly entry below</div>
        <DateRangePicker start={rangeStart} end={rangeEnd} onChange={onRangeChange} />
        <div style={{ fontSize:11, color:C.muted, margin:'10px 0' }}>Weekly sales/spend entry is keyed to the Monday of your range start: <strong style={{ color:C.text }}>{weekStart}</strong></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <span style={label}>Weekly food sales ($)</span>
            <input type="number" style={{ ...inputSt, fontSize:18, fontFamily:C.mono, color:C.emerald }} placeholder="0.00" value={weeklySales} onChange={e=>updateEntry('weeklySales', e.target.value)} />
          </div>
          <div>
            <span style={label}>Total food spend ($)</span>
            <input type="number" style={{ ...inputSt, fontSize:18, fontFamily:C.mono, color:C.amber }} placeholder="0.00" value={foodSpend} onChange={e=>updateEntry('foodSpend', e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        <KpiCard label="Weekly Food Cost %" value={fcPct !== null ? `${fcPct.toFixed(1)}%` : '—'} color={fcColor} delta={fcPct !== null ? (fcPct > 29 ? 'Above 29% target' : 'On target') : undefined} deltaUp={fcPct !== null && fcPct > 29} />
        <KpiCard label="Price Spikes" value={`${spikes.length}`} color={spikes.length ? C.red : C.emerald} delta={spikes.length ? 'Ingredients up 5%+' : undefined} deltaUp={spikes.length > 0} />
        <KpiCard label="Waste in range" value={`$${totalWaste.toFixed(2)}`} color={totalWaste > 0 ? C.amber : C.muted} delta={`${wasteInRange.length} entries`} />
        <KpiCard label="Invoices in range" value={`${invoicesInRange.length}`} color={C.text} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={card}>
          <div style={sectionTitle}>🚨 Kitchen alerts</div>
          {spikes.length === 0 && platesMissingPrice.length === 0 && (
            <div style={{ fontSize:12, color:C.muted, padding:'8px 0' }}>No active alerts. Enter ingredient prices and sell prices to surface alerts here.</div>
          )}
          {spikes.map(({ing,pct})=>(
            <AlertItem key={ing.id} iconColor={C.red} iconBg="rgba(239,68,68,0.15)" title={`${ing.name} up ${pct!.toFixed(1)}%`} sub={`${ing.vendor} · baseline $${ing.baselineCost} → current $${ing.currentCost}`} />
          ))}
          {platesMissingPrice.slice(0,5).map(p=>(
            <AlertItem key={p.id} iconColor={C.amber} iconBg="rgba(245,158,11,0.15)" title={`${p.name} — no sell price set`} sub="Add a sell price in Plate Costing to calculate food cost %" />
          ))}
        </div>

        <div style={card}>
          <div style={sectionTitle}>📅 Recent weeks</div>
          {weeksWithData.length === 0 && <div style={{ fontSize:12, color:C.muted, padding:'8px 0' }}>No weeks logged yet — enter numbers above to start building history.</div>}
          {weeksWithData.slice(0,8).map(w=>{
            const wfc = w.weeklySales && w.foodSpend ? (parseFloat(w.foodSpend)/parseFloat(w.weeklySales))*100 : null;
            return (
              <div key={w.weekStart} onClick={()=>{ setRangeStart(w.weekStart); const d=new Date(w.weekStart); d.setDate(d.getDate()+6); setRangeEnd(d.toISOString().split('T')[0]); }} style={{ cursor:'pointer' }}>
                <StatRow label={new Date(w.weekStart).toLocaleDateString(undefined,{month:'short',day:'numeric'})} value={wfc!==null?`${wfc.toFixed(1)}%`:'—'} valueColor={wfc!==null ? (wfc>31?C.red:wfc>29?C.amber:C.emerald) : C.muted} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={card}>
        <div style={sectionTitle}>💸 Top profit leak candidates</div>
        {plates.filter(p=>p.sellPrice).map(p=>{
          const { totalCost } = recipeCost(p, ingredients, recipes);
          const sell = parseFloat(p.sellPrice||'0');
          const fc = sell ? (totalCost/sell)*100 : 0;
          return { p, totalCost, fc };
        }).filter(x=>x.fc > 31).sort((a,b)=>b.fc-a.fc).slice(0,6).map(({p,fc})=>(
          <StatRow key={p.id} label={p.name} value={`FC ${fc.toFixed(1)}%`} valueColor={C.red} />
        ))}
        {plates.filter(p=>p.sellPrice).length === 0 && <div style={{ fontSize:12, color:C.muted, padding:'8px 0' }}>Enter sell prices on plates to see profit leak ranking.</div>}
      </div>

      <div style={card}>
        <div style={sectionTitle}>System setup checklist</div>
        {[
          ['1','Enter current invoice prices','Ingredients tab → updates cost basis system-wide'],
          ['2','Process an invoice','Invoices tab → auto-updates ingredient costs + shows impact'],
          ['3','Enter sell prices on plates','Plate Costing tab → activates food cost % per item'],
          ['4','Set inventory par levels & counts','Inventory tab → enables variance tracking'],
          ['5','Log waste as it happens','Waste Tracker tab → builds your loss trend data'],
        ].map(([n,t,s])=>(
          <div key={n} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(245,158,11,0.15)', border:`1px solid ${C.amber}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:C.amber, flexShrink:0 }}>{n}</div>
            <div><div style={{ fontSize:12, color:C.text, fontWeight:500 }}>{t}</div><div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: INGREDIENTS
// ════════════════════════════════════════════════════════════════════════════

const INGREDIENT_BLANK: Omit<Ingredient,'id'> = {
  name:'', category:'Seafood', vendor:'', vendorItemCode:'', purchaseUnit:'', packSizeOz:'',
  currentCost:'', baselineCost:'', priceHistory:[], storage:'Walk-In', shelfLifeDays:'',
  parLevel:'', countUnit:'lbs', minQty:'', maxQty:'', allergens:'', glutenFree:false, vegetarian:false, vegan:false, notes:'',
};

function IngredientsPage() {
  const { ingredients, setIngredients, inventory } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newIng, setNewIng] = useState(INGREDIENT_BLANK);
  const [expandedId, setExpandedId] = useState<number|null>(null);

  const parStatusBadge = (ing: Ingredient) => {
    const invRow = inventory.find(r => r.ingredientId === ing.id || r.name === ing.name);
    const par = parseFloat(ing.parLevel || '0');
    const unit = ing.countUnit || 'units';
    if (!par) return <Badge color="blue">No par set</Badge>;
    if (!invRow || !invRow.endingQty) return <Badge color="amber">No count yet</Badge>;
    const onHand = parseFloat(invRow.endingQty || '0');
    if (onHand < par) return <Badge color="red">Below par ({onHand}/{par} {unit})</Badge>;
    return <Badge color="green">OK ({onHand}/{par} {unit})</Badge>;
  };

  const update = (id:number, field:keyof Ingredient, val:string|boolean) =>
    setIngredients(prev=>prev.map(i=>i.id===id ? { ...i,[field]:val } : i));

  const updatePrice = (id:number, newPrice:string) => {
    setIngredients(prev=>prev.map(i=>{
      if (i.id !== id) return i;
      const history = [...i.priceHistory, { date:new Date().toISOString().split('T')[0], price:newPrice }];
      return { ...i, currentCost:newPrice, priceHistory:history };
    }));
  };

  const del = (id:number) => setIngredients(prev=>prev.filter(i=>i.id!==id));
  const add = () => {
    if (!newIng.name) return;
    const baseline = newIng.baselineCost || newIng.currentCost || '0';
    setIngredients(prev=>[...prev,{ ...newIng, baselineCost:baseline, priceHistory:[{date:new Date().toISOString().split('T')[0], price:newIng.currentCost}], id:Date.now() }]);
    setNewIng(INGREDIENT_BLANK); setShowAdd(false);
  };

  const alertBadge = (ing:Ingredient) => {
    const pct = priceVariancePct(ing.currentCost, ing.baselineCost);
    if (pct === null) return <Badge color="amber">Enter price</Badge>;
    if (pct > 5) return <Badge color="red">+{pct.toFixed(1)}% spike</Badge>;
    if (pct < -2) return <Badge color="green">{pct.toFixed(1)}%</Badge>;
    return <Badge color="green">Stable</Badge>;
  };

  const filtered = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.vendor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <Btn primary onClick={()=>setShowAdd(!showAdd)}>+ Add ingredient</Btn>
        <input style={{ ...inputSt, flex:1, minWidth:180 }} placeholder="Search name, category, vendor..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {showAdd && (
        <div style={{ ...card, border:`1px solid ${C.amber}` }}>
          <div style={sectionTitle}>New ingredient</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            {([['name','Name *','text'],['vendor','Vendor','text'],['vendorItemCode','Vendor item code','text'],['purchaseUnit','Purchase unit','text'],['currentCost','Invoice cost ($)','number'],['packSizeOz','Pack size (oz)','number'],['shelfLifeDays','Shelf life (days)','number'],['parLevel','Par level','number'],['minQty','Min qty','number'],['maxQty','Max qty','number'],['allergens','Allergens','text']] as [keyof Omit<Ingredient,'id'>,string,string][]).map(([f,l,t])=>(
              <div key={f}><span style={label}>{l}</span><input type={t} style={inputSt} value={String(newIng[f])} onChange={e=>setNewIng(p=>({...p,[f]:e.target.value}))} /></div>
            ))}
            <div><span style={label}>Category</span><select style={selectSt} value={newIng.category} onChange={e=>setNewIng(p=>({...p,category:e.target.value}))}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><span style={label}>Storage</span><select style={selectSt} value={newIng.storage} onChange={e=>setNewIng(p=>({...p,storage:e.target.value}))}>{STORAGE_AREAS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><span style={label}>Count unit (par/inventory)</span><select style={selectSt} value={newIng.countUnit} onChange={e=>setNewIng(p=>({...p,countUnit:e.target.value}))}>{COUNT_UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
          <div style={{ display:'flex', gap:14, marginBottom:10 }}>
            {(['glutenFree','vegetarian','vegan'] as const).map(f=>(
              <label key={f} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.muted }}>
                <input type="checkbox" checked={newIng[f]} onChange={e=>setNewIng(p=>({...p,[f]:e.target.checked}))} />
                {f==='glutenFree'?'Gluten-free':f==='vegetarian'?'Vegetarian':'Vegan'}
              </label>
            ))}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn primary onClick={add}>Save ingredient</Btn>
            <Btn onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Ingredient','Category','Vendor','Storage','Current cost ✏','Cost/oz','Par','Par status','Alert','History',''].map(h=><th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(i=>(
                <Fragment key={i.id}>
                  <tr>
                    <td style={td}><input style={{ ...tdInput, fontWeight:500, color:C.text, minWidth:140 }} value={i.name} onChange={e=>update(i.id,'name',e.target.value)} /></td>
                    <td style={td}><select style={{ ...tdInput, background:'transparent' }} value={i.category} onChange={e=>update(i.id,'category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></td>
                    <td style={td}><input style={{ ...tdInput, minWidth:100 }} value={i.vendor} onChange={e=>update(i.id,'vendor',e.target.value)} /></td>
                    <td style={td}><select style={{ ...tdInput, background:'transparent' }} value={i.storage} onChange={e=>update(i.id,'storage',e.target.value)}>{STORAGE_AREAS.map(s=><option key={s}>{s}</option>)}</select></td>
                    <td style={td}>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ color:C.muted }}>$</span>
                        <input type="number" style={{ ...tdInput, color:C.amber, fontFamily:C.mono, width:70 }} value={i.currentCost} onChange={e=>updatePrice(i.id, e.target.value)} />
                      </div>
                    </td>
                    <td style={{ ...td, fontFamily:C.mono, color:C.text }}>${ingredientCostPerOz(i).toFixed(2)}</td>
                    <td style={td}>
                      <div style={{ display:'flex', gap:3, alignItems:'center' }}>
                        <input style={{ ...tdInput, width:42 }} value={i.parLevel} onChange={e=>update(i.id,'parLevel',e.target.value)} />
                        <select style={{ ...tdInput, background:'transparent', width:62, fontSize:11, color:C.muted }} value={i.countUnit} onChange={e=>update(i.id,'countUnit',e.target.value)}>{COUNT_UNITS.map(u=><option key={u}>{u}</option>)}</select>
                      </div>
                    </td>
                    <td style={td}>{parStatusBadge(i)}</td>
                    <td style={td}>{alertBadge(i)}</td>
                    <td style={td}><Btn small onClick={()=>setExpandedId(expandedId===i.id?null:i.id)}>{expandedId===i.id?'Hide':`${i.priceHistory.length} entries`}</Btn></td>
                    <td style={td}><Btn small danger onClick={()=>del(i.id)}>✕</Btn></td>
                  </tr>
                  {expandedId === i.id && (
                    <tr>
                      <td colSpan={10} style={{ padding:'10px 16px', background:'rgba(245,158,11,0.04)', borderBottom:`1px solid ${C.border}` }}>
                        <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Price history — {i.name}</div>
                        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                          {i.priceHistory.map((h,idx)=>(
                            <div key={idx} style={{ fontSize:11 }}>
                              <span style={{ color:C.dim }}>{h.date}</span> <span style={{ color:C.text, fontFamily:C.mono }}>${h.price}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:8, fontSize:11, color:C.muted }}>
                          Baseline: <span style={{ color:C.emerald, fontFamily:C.mono }}>${i.baselineCost}</span> · Allergens: {i.allergens||'none'} · GF: {i.glutenFree?'Yes':'No'} · Veg: {i.vegetarian?'Yes':'No'} · Vegan: {i.vegan?'Yes':'No'}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: RECIPE BUILDER (multi-level: recipes can reference other recipes)
// ════════════════════════════════════════════════════════════════════════════

function ScalingCalculator({ recipe, ingredients, recipes }: { recipe:Recipe; ingredients:Ingredient[]; recipes:Recipe[] }) {
  const [scaleTarget, setScaleTarget] = useState('');
  const [scaleUnit, setScaleUnit] = useState<'portions'|'oz'|'x'>('portions');

  const baseYieldOz   = toOz(recipe.yieldQty, recipe.yieldUnit) || 1;
  const basePortionOz = toOz(recipe.portionSize, recipe.portionUnit) || 1;
  const basePortions  = baseYieldOz / basePortionOz;
  const baseCost      = recipeCost(recipe, ingredients, recipes);

  const scaleFactor = (() => {
    const n = parseFloat(scaleTarget || '0');
    if (!n) return null;
    if (scaleUnit === 'portions') return n / basePortions;
    if (scaleUnit === 'oz') return n / baseYieldOz;
    return n; // multiplier
  })();

  const scaledYieldOz   = scaleFactor ? baseYieldOz * scaleFactor : null;
  const scaledPortions  = scaledYieldOz ? scaledYieldOz / basePortionOz : null;
  const scaledCost      = scaleFactor ? baseCost.totalCost * scaleFactor : null;

  return (
    <div>
      <div style={sectionTitle}>Batch scaling calculator</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:8, marginBottom:10 }}>
        <div>
          <span style={label}>Scale to</span>
          <input type="number" style={inputSt} value={scaleTarget} onChange={e=>setScaleTarget(e.target.value)} placeholder={scaleUnit==='portions'?'# of portions':scaleUnit==='oz'?'oz needed':'multiplier (e.g. 3)'} />
        </div>
        <div>
          <span style={label}>Unit</span>
          <select style={selectSt} value={scaleUnit} onChange={e=>setScaleUnit(e.target.value as 'portions'|'oz'|'x')}>
            <option value="portions">Portions</option>
            <option value="oz">Oz yield</option>
            <option value="x">× Multiplier</option>
          </select>
        </div>
      </div>
      {scaleFactor && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          <div style={{ background:C.navy, borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.7, marginBottom:3 }}>Scale factor</div>
            <div style={{ fontFamily:C.mono, color:C.blue, fontSize:16 }}>{scaleFactor.toFixed(2)}×</div>
          </div>
          <div style={{ background:C.navy, borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.7, marginBottom:3 }}>Scaled yield</div>
            <div style={{ fontFamily:C.mono, color:C.text, fontSize:16 }}>{scaledYieldOz?.toFixed(1)} oz {scaledPortions ? `(${scaledPortions.toFixed(0)} portions)` : ''}</div>
          </div>
          <div style={{ background:C.navy, borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.7, marginBottom:3 }}>Scaled batch cost</div>
            <div style={{ fontFamily:C.mono, color:C.amber, fontSize:16 }}>{scaledCost!==null ? `$${scaledCost.toFixed(2)}` : '—'}</div>
          </div>
        </div>
      )}
      {scaleFactor && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Scaled ingredient quantities:</div>
          {recipe.components.map((c,idx) => {
            const scaledQty = (parseFloat(c.qty)||0) * scaleFactor;
            return (
              <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ color:C.text }}>{c.refName}</span>
                <span style={{ fontFamily:C.mono, color:C.amber }}>{scaledQty.toFixed(2)} {c.unit}</span>
              </div>
            );
          })}
        </div>
      )}
      {!scaleFactor && (
        <div style={{ fontSize:11, color:C.muted }}>
          Base: {recipe.yieldQty}{recipe.yieldUnit} yield · {basePortions.toFixed(0)} portions · {baseCost.totalCost>0?`$${baseCost.totalCost.toFixed(2)} batch cost`:'enter ingredient prices to see cost'}
        </div>
      )}
    </div>
  );
}

function RecipeBuilder() {
  const { recipes, setRecipes, ingredients } = useStore();
  const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? 0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all'|'batch'|'plate'>('all');

  const current = recipes.find(r => r.id === selectedId);

  const updateRecipe = (field: keyof Recipe, val: string) =>
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, [field]: val } : r));

  const updateComp = (idx: number, field: keyof RecipeComponent, val: string) =>
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, components: r.components.map((c,ci) => ci===idx ? { ...c, [field]: val } : c) } : r));

  const setCompRef = (idx: number, refType: 'ingredient'|'recipe', refId: number) => {
    const name = refType === 'ingredient'
      ? ingredients.find(i=>i.id===refId)?.name || ''
      : recipes.find(r=>r.id===refId)?.name || '';
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, components: r.components.map((c,ci) => ci===idx ? { ...c, refType, refId, refName:name } : c) } : r));
  };

  const addComp = () =>
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, components:[...r.components, { id:Date.now(), refType:'ingredient', refId:ingredients[0]?.id||0, refName:ingredients[0]?.name||'', qty:'', unit:'oz' }] } : r));

  const removeComp = (idx: number) =>
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, components: r.components.filter((_,ci)=>ci!==idx) } : r));

  // Sums all component quantities (converted to oz) to suggest a batch yield.
  // This is an estimate, not a substitute for measuring actual yield after cooking/reduction —
  // the chef can always override the resulting number.
  const autoCalcYield = () => {
    if (!current) return;
    const totalOz = current.components.reduce((sum, c) => sum + toOz(c.qty, c.unit), 0);
    setRecipes(prev => prev.map(r => r.id === selectedId ? { ...r, yieldQty: totalOz.toFixed(2), yieldUnit: 'oz' } : r));
  };

  const addRecipe = (type:'batch'|'plate') => {
    const nr: Recipe = { id:Date.now(), name:`New ${type === 'batch' ? 'Batch Recipe' : 'Menu Item'}`, category:'', type, yieldQty:'', yieldUnit:'oz', portionSize:'1', portionUnit:'oz', components:[], sellPrice:'', prepInstructions:'', cookingInstructions:'', holdingInstructions:'', shelfLifeDays:'', haccpNotes:'', allergens:'', station:'Prep', plateGuide:'', version:1 };
    setRecipes(prev=>[...prev, nr]);
    setSelectedId(nr.id);
  };

  const delRecipe = (id:number) => {
    setRecipes(prev=>prev.filter(r=>r.id!==id));
    if (selectedId === id) setSelectedId(recipes[0]?.id ?? 0);
  };

  const filtered = recipes.filter(r =>
    (typeFilter === 'all' || r.type === typeFilter) &&
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const cost = current ? recipeCost(current, ingredients, recipes) : null;
  const dependents = current ? findDependents('recipe', current.id, recipes) : [];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:12, height:'calc(100vh - 100px)' }}>
      <div style={{ ...card, overflowY:'auto', padding:10 }}>
        <input style={{ ...inputSt, marginBottom:8 }} placeholder="Search recipes..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:4, marginBottom:8 }}>
          {(['all','batch','plate'] as const).map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} style={{ flex:1, padding:'5px 0', fontSize:11, borderRadius:5, cursor:'pointer', border:`1px solid ${typeFilter===t?C.amber:C.border}`, background:typeFilter===t?'rgba(245,158,11,0.1)':'transparent', color:typeFilter===t?C.amber:C.muted }}>
              {t==='all'?'All':t==='batch'?'Batches':'Plates'}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:4, marginBottom:10 }}>
          <Btn small primary onClick={()=>addRecipe('batch')}>+ Batch</Btn>
          <Btn small primary onClick={()=>addRecipe('plate')}>+ Plate</Btn>
        </div>
        {filtered.map(r=>(
          <div key={r.id} onClick={()=>setSelectedId(r.id)} style={{ padding:'7px 8px', borderRadius:5, cursor:'pointer', fontSize:12, marginBottom:2, color: selectedId===r.id ? C.amber : C.text, background: selectedId===r.id ? 'rgba(245,158,11,0.08)' : 'transparent', borderLeft:`2px solid ${selectedId===r.id ? C.amber : 'transparent'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{r.name}</span>
              <Badge color={r.type==='batch'?'blue':'purple'}>{r.type}</Badge>
            </div>
          </div>
        ))}
      </div>

      {current && (
        <div style={{ overflowY:'auto' }}>
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ ...sectionTitle, marginBottom:0, paddingBottom:0, border:'none' }}>Recipe editor — v{current.version}</div>
              <Btn small danger onClick={()=>delRecipe(current.id)}>Delete recipe</Btn>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10 }}>
              <div><span style={label}>Recipe name</span><input style={{ ...inputSt, fontSize:15, fontWeight:500 }} value={current.name} onChange={e=>updateRecipe('name', e.target.value)} /></div>
              <div><span style={label}>Category</span><input style={inputSt} value={current.category} onChange={e=>updateRecipe('category', e.target.value)} /></div>
              <div><span style={label}>Station</span><select style={selectSt} value={current.station} onChange={e=>updateRecipe('station', e.target.value)}>{STATIONS.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <span style={label}>{current.type==='batch'?'Batch yield':'Yield'}</span>
                <div style={{ display:'flex', gap:6 }}>
                  <input type="number" style={inputSt} value={current.yieldQty} onChange={e=>updateRecipe('yieldQty', e.target.value)} placeholder="e.g. 64" />
                  {current.type === 'batch' && current.components.length > 0 && (
                    <Btn small onClick={autoCalcYield}>Auto</Btn>
                  )}
                </div>
              </div>
              <div><span style={label}>Yield unit</span><select style={selectSt} value={current.yieldUnit} onChange={e=>updateRecipe('yieldUnit', e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              <div><span style={label}>Portion size</span><input type="number" style={inputSt} value={current.portionSize} onChange={e=>updateRecipe('portionSize', e.target.value)} /></div>
              {current.type === 'plate' ? (
                <div><span style={label}>Sell price ($) ✏</span><input type="number" style={{ ...inputSt, color:C.amber, fontFamily:C.mono }} value={current.sellPrice} onChange={e=>updateRecipe('sellPrice', e.target.value)} placeholder="0.00" /></div>
              ) : (
                <div><span style={label}>Portion unit</span><select style={selectSt} value={current.portionUnit} onChange={e=>updateRecipe('portionUnit', e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              )}
            </div>
            {current.type === 'batch' && current.components.length > 0 && (
              <div style={{ fontSize:11, color:C.muted, marginTop:-8, marginBottom:14 }}>
                "Auto" sums your component quantities into an estimated yield. Override with the actual measured yield after cooking/reduction if it differs.
              </div>
            )}

            <div style={sectionTitle}>Components — ingredients or sub-recipes</div>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:10 }}>
              <thead><tr>{['Type','Reference','Qty','Unit',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {current.components.map((c,idx)=>(
                  <tr key={c.id}>
                    <td style={td}>
                      <select style={{ ...tdInput, background:'transparent', minWidth:90 }} value={c.refType} onChange={e=>setCompRef(idx, e.target.value as 'ingredient'|'recipe', e.target.value==='ingredient' ? (ingredients[0]?.id||0) : (recipes.filter(r=>r.id!==current.id)[0]?.id||0))}>
                        <option value="ingredient">Ingredient</option>
                        <option value="recipe">Sub-recipe</option>
                      </select>
                    </td>
                    <td style={td}>
                      <select style={{ ...tdInput, background:'transparent', minWidth:180 }} value={c.refId} onChange={e=>setCompRef(idx, c.refType, parseInt(e.target.value))}>
                        {c.refType === 'ingredient'
                          ? ingredients.map(i=><option key={i.id} value={i.id}>{i.name}</option>)
                          : recipes.filter(r=>r.id !== current.id).map(r=><option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                      </select>
                    </td>
                    <td style={td}><input style={{ ...tdInput, width:60 }} value={c.qty} onChange={e=>updateComp(idx,'qty',e.target.value)} /></td>
                    <td style={td}><select style={{ ...tdInput, background:'transparent', minWidth:65 }} value={c.unit} onChange={e=>updateComp(idx,'unit',e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></td>
                    <td style={td}><Btn small danger onClick={()=>removeComp(idx)}>✕</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Btn small onClick={addComp}>+ Add component</Btn>

            <div style={{ marginTop:16 }}>
              <div style={sectionTitle}>Instructions &amp; notes</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div><span style={label}>Prep instructions</span><textarea style={{ ...inputSt, minHeight:60 }} value={current.prepInstructions} onChange={e=>updateRecipe('prepInstructions', e.target.value)} /></div>
                <div><span style={label}>Cooking instructions</span><textarea style={{ ...inputSt, minHeight:60 }} value={current.cookingInstructions} onChange={e=>updateRecipe('cookingInstructions', e.target.value)} /></div>
                <div><span style={label}>Holding instructions</span><textarea style={{ ...inputSt, minHeight:60 }} value={current.holdingInstructions} onChange={e=>updateRecipe('holdingInstructions', e.target.value)} /></div>
                <div><span style={label}>HACCP notes</span><textarea style={{ ...inputSt, minHeight:60 }} value={current.haccpNotes} onChange={e=>updateRecipe('haccpNotes', e.target.value)} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><span style={label}>Allergens</span><input style={inputSt} value={current.allergens} onChange={e=>updateRecipe('allergens', e.target.value)} /></div>
                <div><span style={label}>Shelf life (days)</span><input type="number" style={inputSt} value={current.shelfLifeDays} onChange={e=>updateRecipe('shelfLifeDays', e.target.value)} /></div>
              </div>
              {current.type === 'plate' && (
                <div style={{ marginTop:10 }}><span style={label}>Plating guide</span><textarea style={{ ...inputSt, minHeight:50 }} value={current.plateGuide} onChange={e=>updateRecipe('plateGuide', e.target.value)} /></div>
              )}
            </div>

            <div style={{ marginTop:16, background:'rgba(245,158,11,0.05)', border:`1px solid rgba(245,158,11,0.2)`, borderRadius:8, padding:14 }}>
              <div style={sectionTitle}>Live cost calculation</div>
              {cost && (
                <>
                  <StatRow label="Total cost" value={`$${cost.totalCost.toFixed(2)}`} valueColor={C.amber} />
                  <StatRow label={current.type==='batch' ? 'Cost per oz of yield' : 'Plate cost'} value={`$${cost.costPerUnit.toFixed(2)}`} valueColor={C.amber} />
                  {current.type === 'plate' && current.sellPrice && (
                    <>
                      <StatRow label="Food cost %" value={`${((cost.costPerUnit / parseFloat(current.sellPrice)) * 100).toFixed(1)}%`} valueColor={(cost.costPerUnit / parseFloat(current.sellPrice)) * 100 > 31 ? C.red : C.emerald} />
                      <StatRow label="Gross profit" value={`$${(parseFloat(current.sellPrice) - cost.costPerUnit).toFixed(2)}`} valueColor={C.emerald} />
                    </>
                  )}
                  {cost.missing.length > 0 && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ fontSize:11, color:C.amber, marginBottom:4 }}>⚠ Missing data:</div>
                      {cost.missing.map((m,idx)=>(<div key={idx} style={{ fontSize:11, color:C.muted, paddingLeft:8 }}>• {m}</div>))}
                    </div>
                  )}
                </>
              )}
            </div>

            {current.type === 'batch' && (
              <div style={{ marginTop:12, ...card, marginBottom:0, background:'rgba(55,138,221,0.05)', border:`1px solid rgba(55,138,221,0.2)` }}>
                <ScalingCalculator recipe={current} ingredients={ingredients} recipes={recipes} />
              </div>
            )}

            {dependents.length > 0 && (
              <div style={{ marginTop:12, ...card, marginBottom:0 }}>
                <div style={sectionTitle}>Dependency map — recipes using this</div>
                {dependents.map(d=>(<StatRow key={d.id} label={d.name} value={d.type} />))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: PLATE COSTING
// ════════════════════════════════════════════════════════════════════════════

function PlateCosting() {
  const { recipes, setRecipes, ingredients, targetFcPct, setTargetFcPct } = useStore();
  const [search, setSearch] = useState('');
  const target = targetFcPct;

  const updateSellPrice = (id:number, val:string) =>
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, sellPrice: val } : r));

  const plates = recipes.filter(r => r.type === 'plate' && r.name.toLowerCase().includes(search.toLowerCase()));

  const rows = plates.map(p => {
    const cost = recipeCost(p, ingredients, recipes);
    const sell = parseFloat(p.sellPrice || '0');
    const fc   = foodCostPct(cost.costPerUnit, sell);
    const gp   = sell ? sell - cost.costPerUnit : null;
    const ideal = idealSellPrice(cost.costPerUnit, target);
    return { p, cost, sell, fc, gp, ideal };
  });

  const flagged = rows.filter(r => r.fc !== null && r.fc > target + 2);
  const healthy = rows.filter(r => r.fc !== null && r.fc <= target + 2);
  const noPrice = rows.filter(r => r.fc === null);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Plates over target FC</div>
          <div style={{ fontSize:26, fontFamily:C.mono, color:flagged.length?C.red:C.emerald }}>{flagged.length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Plates on target</div>
          <div style={{ fontSize:26, fontFamily:C.mono, color:C.emerald }}>{healthy.length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Missing sell price</div>
          <div style={{ fontSize:26, fontFamily:C.mono, color:noPrice.length?C.amber:C.emerald }}>{noPrice.length}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Target FC % ✏</div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input type="number" style={{ ...inputSt, fontSize:22, fontFamily:C.mono, color:C.amber, padding:'2px 6px', width:70 }} value={target} onChange={e=>setTargetFcPct(parseFloat(e.target.value)||29)} />
            <span style={{ color:C.muted, fontSize:14 }}>%</span>
          </div>
        </div>
      </div>

      <input style={{ ...inputSt, marginBottom:12 }} placeholder="Search menu items..." value={search} onChange={e=>setSearch(e.target.value)} />

      <div style={card}>
        <div style={sectionTitle}>Plate profitability — target food cost {target}%</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', minWidth:820 }}>
            <thead><tr>{['Menu item','Category','Plate cost','Sell price ✏','Food cost %','Gross profit','Ideal sell','Status'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.sort((a,b)=>(b.fc||0)-(a.fc||0)).map(({p,cost,sell,fc,gp,ideal})=>(
                <tr key={p.id}>
                  <td style={{ ...td, fontWeight:500, color:C.text }}>{p.name}</td>
                  <td style={td}>{p.category}</td>
                  <td style={{ ...td, fontFamily:C.mono, color:C.amber }}>{cost.missing.length ? '⚠ incomplete' : `$${cost.costPerUnit.toFixed(2)}`}</td>
                  <td style={td}>
                    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <span style={{ color:C.muted, fontSize:11 }}>$</span>
                      <input type="number" step="0.01" style={{ ...tdInput, color:C.text, fontFamily:C.mono, width:65 }} value={p.sellPrice||''} placeholder="0.00" onChange={e=>updateSellPrice(p.id, e.target.value)} />
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily:C.mono, color: fc===null?C.muted : fc>target+2?C.red : fc>target?C.amber : C.emerald }}>{fc!==null ? `${fc.toFixed(1)}%` : '—'}</td>
                  <td style={{ ...td, fontFamily:C.mono, color:C.emerald }}>{gp!==null ? `$${gp.toFixed(2)}` : '—'}</td>
                  <td style={{ ...td, fontFamily:C.mono, color:C.blue }}>{ideal ? `$${ideal.toFixed(2)}` : '—'}</td>
                  <td style={td}>
                    {fc===null ? <Badge color="amber">Enter sell price</Badge> :
                     cost.missing.length ? <Badge color="amber">Cost incomplete</Badge> :
                     fc>target+2 ? <Badge color="red">Raise price / cut cost</Badge> :
                     fc>target ? <Badge color="amber">Watch</Badge> :
                     <Badge color="green">Healthy</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: INVENTORY CONTROL
// ════════════════════════════════════════════════════════════════════════════

function InventoryPage() {
  const { inventory, setInventory, ingredients } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow] = useState<Omit<InventoryRow,'id'>>({ ingredientId:null, name:'', storage:'Walk-In', beginningQty:'', purchasesQty:'', endingQty:'', theoreticalUsage:'', actualUsage:'', parLevel:'', countUnit:'lbs' });

  const update = (id:number, field:keyof InventoryRow, val:string) =>
    setInventory(prev=>prev.map(r=>r.id===id ? { ...r,[field]:val } : r));
  const del = (id:number) => setInventory(prev=>prev.filter(r=>r.id!==id));

  const add = () => {
    if (!newRow.name) return;
    setInventory(prev=>[...prev,{ ...newRow, id:Date.now() }]);
    setNewRow({ ingredientId:null, name:'', storage:'Walk-In', beginningQty:'', purchasesQty:'', endingQty:'', theoreticalUsage:'', actualUsage:'', parLevel:'', countUnit:'lbs' });
    setShowAdd(false);
  };

  const importFromIngredients = () => {
    const existing = new Set(inventory.map(r=>r.name));
    const toAdd = ingredients.filter(i=>!existing.has(i.name)).map(i => ({
      id: Date.now() + i.id, ingredientId: i.id, name: i.name, storage: i.storage,
      beginningQty:'', purchasesQty:'', endingQty:'', theoreticalUsage:'', actualUsage:'', parLevel: i.parLevel, countUnit: i.countUnit || 'lbs',
    }));
    setInventory(prev=>[...prev, ...toAdd]);
  };

  const actualUsage = (r:InventoryRow) => {
    const b=parseFloat(r.beginningQty||'0'), p=parseFloat(r.purchasesQty||'0'), e=parseFloat(r.endingQty||'0');
    if (!r.beginningQty && !r.purchasesQty && !r.endingQty) return null;
    return b + p - e;
  };

  const variance = (r:InventoryRow) => {
    const actual = actualUsage(r);
    const theo = parseFloat(r.theoreticalUsage||'0');
    if (actual === null || !r.theoreticalUsage) return null;
    return actual - theo;
  };

  const belowPar = (r:InventoryRow) => {
    const end = parseFloat(r.endingQty||'0');
    const par = parseFloat(r.parLevel||'0');
    return r.endingQty && par && end < par;
  };

  const filtered = inventory.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())||r.storage.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        <Btn primary onClick={()=>setShowAdd(!showAdd)}>+ Add item</Btn>
        <Btn onClick={importFromIngredients}>↓ Import from ingredients</Btn>
        <input style={{ ...inputSt, flex:1, minWidth:180 }} placeholder="Search items, storage area..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {inventory.length === 0 && (
        <div style={{ ...card, textAlign:'center', color:C.muted, padding:30 }}>
          No inventory items yet. Click "Import from ingredients" to pull in your ingredient list, or add items manually.
        </div>
      )}

      {showAdd && (
        <div style={{ ...card, border:`1px solid ${C.amber}` }}>
          <div style={sectionTitle}>Add inventory item</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:10 }}>
            <div><span style={label}>Item name *</span><input style={inputSt} value={newRow.name} onChange={e=>setNewRow(p=>({...p,name:e.target.value}))} /></div>
            <div><span style={label}>Storage</span><select style={selectSt} value={newRow.storage} onChange={e=>setNewRow(p=>({...p,storage:e.target.value}))}>{STORAGE_AREAS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><span style={label}>Par level</span><input type="number" style={inputSt} value={newRow.parLevel} onChange={e=>setNewRow(p=>({...p,parLevel:e.target.value}))} /></div>
            <div><span style={label}>Unit</span><select style={selectSt} value={newRow.countUnit} onChange={e=>setNewRow(p=>({...p,countUnit:e.target.value}))}>{COUNT_UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
          </div>
          <div style={{ display:'flex', gap:8 }}><Btn primary onClick={add}>Save</Btn><Btn onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
        </div>
      )}

      {inventory.length > 0 && (
        <div style={card}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', minWidth:960 }}>
              <thead><tr>{['Item','Storage','Unit','Beginning','Purchases','Ending','Theo. usage','Actual usage','Variance','Par','Status',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(r=>{
                  const au = actualUsage(r);
                  const v = variance(r);
                  const unit = r.countUnit || 'units';
                  return (
                    <tr key={r.id}>
                      <td style={td}><input style={{ ...tdInput, minWidth:130, fontWeight:500, color:C.text }} value={r.name} onChange={e=>update(r.id,'name',e.target.value)} /></td>
                      <td style={td}><select style={{ ...tdInput, background:'transparent', minWidth:90 }} value={r.storage} onChange={e=>update(r.id,'storage',e.target.value)}>{STORAGE_AREAS.map(s=><option key={s}>{s}</option>)}</select></td>
                      <td style={td}><select style={{ ...tdInput, background:'transparent', minWidth:70 }} value={r.countUnit} onChange={e=>update(r.id,'countUnit',e.target.value)}>{COUNT_UNITS.map(u=><option key={u}>{u}</option>)}</select></td>
                      <td style={td}><input type="number" style={{ ...tdInput, width:55 }} placeholder="0" value={r.beginningQty} onChange={e=>update(r.id,'beginningQty',e.target.value)} /></td>
                      <td style={td}><input type="number" style={{ ...tdInput, width:55 }} placeholder="0" value={r.purchasesQty} onChange={e=>update(r.id,'purchasesQty',e.target.value)} /></td>
                      <td style={td}><input type="number" style={{ ...tdInput, width:55 }} placeholder="0" value={r.endingQty} onChange={e=>update(r.id,'endingQty',e.target.value)} /></td>
                      <td style={td}><input type="number" style={{ ...tdInput, width:60 }} placeholder="optional" value={r.theoreticalUsage} onChange={e=>update(r.id,'theoreticalUsage',e.target.value)} /></td>
                      <td style={{ ...td, fontFamily:C.mono, color:C.text }}>{au !== null ? `${au.toFixed(1)} ${unit}` : '—'}</td>
                      <td style={{ ...td, fontFamily:C.mono, color: v===null?C.muted : Math.abs(v)>1 ? C.red : C.emerald }}>{v !== null ? `${v>0?'+':''}${v.toFixed(1)} ${unit}` : '—'}</td>
                      <td style={td}><input type="number" style={{ ...tdInput, width:45 }} value={r.parLevel} onChange={e=>update(r.id,'parLevel',e.target.value)} /></td>
                      <td style={td}>{belowPar(r) ? <Badge color="red">Below par ({r.endingQty} {unit})</Badge> : <Badge color="green">OK</Badge>}</td>
                      <td style={td}><Btn small danger onClick={()=>del(r.id)}>✕</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: WASTE & PROFIT LEAK TRACKER
// ════════════════════════════════════════════════════════════════════════════

const WASTE_BLANK: Omit<WasteEntry,'id'> = { date:new Date().toISOString().split('T')[0], item:'', qty:'', unit:'ea', cost:'', reason:'Spoilage', station:'Prep', employee:'', notes:'', correctiveAction:'' };

function WasteTracker() {
  const { waste, setWaste } = useStore();
  const [form, setForm] = useState(WASTE_BLANK);
  const [showForm, setShowForm] = useState(true);

  const add = () => {
    if (!form.item) return;
    setWaste(prev => [{ ...form, id: Date.now() }, ...prev]);
    setForm({ ...WASTE_BLANK, date: form.date });
  };
  const del = (id:number) => setWaste(prev => prev.filter(w=>w.id!==id));

  const totalCost = waste.reduce((s,w)=>s+(parseFloat(w.cost||'0')||0),0);
  const byReason = WASTE_REASONS.map(r => ({ reason:r, cost: waste.filter(w=>w.reason===r).reduce((s,w)=>s+(parseFloat(w.cost||'0')||0),0) })).filter(x=>x.cost>0).sort((a,b)=>b.cost-a.cost);
  const byStation = STATIONS.map(s => ({ station:s, cost: waste.filter(w=>w.station===s).reduce((s2,w)=>s2+(parseFloat(w.cost||'0')||0),0) })).filter(x=>x.cost>0).sort((a,b)=>b.cost-a.cost);
  const projectedAnnual = totalCost > 0 ? totalCost * 52 : 0;

  const units = ['ea','oz','lb','qt','gal','portion','batch','cup'];

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        {[['Entries logged', `${waste.length}`, C.text], ['Total waste cost', `$${totalCost.toFixed(2)}`, totalCost>0?C.red:C.muted], ['Top reason', byReason[0]?.reason||'—', C.amber], ['Projected annual', projectedAnnual ? `$${projectedAnnual.toFixed(0)}` : '—', C.red]].map(([l,v,c])=>(
          <div key={String(l)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>{String(l)}</div>
            <div style={{ fontSize: String(l)==='Top reason' ? 16 : 26, fontFamily:C.mono, color:String(c) }}>{String(v)}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, border:`1px solid ${C.amber}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={sectionTitle}>Log waste event</div>
          <Btn small onClick={()=>setShowForm(!showForm)}>{showForm ? 'Hide form' : 'Show form'}</Btn>
        </div>
        {showForm && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'100px 1fr 70px 70px 90px', gap:10, marginBottom:10 }}>
              <div><span style={label}>Date</span><input type="date" style={inputSt} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
              <div><span style={label}>Item *</span><input style={inputSt} placeholder="e.g. Purcells Oysters" value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} /></div>
              <div><span style={label}>Qty</span><input type="number" style={inputSt} placeholder="0" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} /></div>
              <div><span style={label}>Unit</span><select style={selectSt} value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}>{units.map(u=><option key={u}>{u}</option>)}</select></div>
              <div><span style={label}>Cost ($)</span><input type="number" style={{ ...inputSt, color:C.red, fontFamily:C.mono }} placeholder="0.00" value={form.cost} onChange={e=>setForm(p=>({...p,cost:e.target.value}))} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
              <div><span style={label}>Reason</span><select style={selectSt} value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}>{WASTE_REASONS.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><span style={label}>Station</span><select style={selectSt} value={form.station} onChange={e=>setForm(p=>({...p,station:e.target.value}))}>{STATIONS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><span style={label}>Employee</span><input style={inputSt} value={form.employee} onChange={e=>setForm(p=>({...p,employee:e.target.value}))} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div><span style={label}>Notes</span><input style={inputSt} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} /></div>
              <div><span style={label}>Corrective action</span><input style={inputSt} value={form.correctiveAction} onChange={e=>setForm(p=>({...p,correctiveAction:e.target.value}))} /></div>
            </div>
            <Btn primary onClick={add}>Save waste entry</Btn>
          </>
        )}
      </div>

      {(byReason.length > 0 || byStation.length > 0) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div style={card}>
            <div style={sectionTitle}>Root cause analysis — by reason</div>
            {byReason.map(({reason,cost})=>(
              <div key={reason} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ color:C.muted }}>{reason}</span><span style={{ fontFamily:C.mono, color:C.red }}>${cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={sectionTitle}>By station</div>
            {byStation.map(({station,cost})=>(
              <div key={station} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ color:C.muted }}>{station}</span><span style={{ fontFamily:C.mono, color:C.red }}>${cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {waste.length > 0 ? (
        <div style={card}>
          <div style={sectionTitle}>Waste log ({waste.length} entries)</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
              <thead><tr>{['Date','Item','Qty','Reason','Station','Employee','Cost','Action',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {waste.map(w=>(
                  <tr key={w.id}>
                    <td style={td}>{w.date}</td>
                    <td style={td}><strong style={{ color:C.text }}>{w.item}</strong></td>
                    <td style={td}>{w.qty} {w.unit}</td>
                    <td style={td}>{w.reason}</td>
                    <td style={td}>{w.station}</td>
                    <td style={td}>{w.employee||'—'}</td>
                    <td style={{ ...td, fontFamily:C.mono, color:C.red }}>{w.cost?`$${parseFloat(w.cost).toFixed(2)}`:'—'}</td>
                    <td style={{ ...td, color:C.muted }}>{w.correctiveAction||'—'}</td>
                    <td style={td}><Btn small danger onClick={()=>del(w.id)}>✕</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ ...card, textAlign:'center', color:C.muted, padding:30 }}>No waste entries yet — use the form above to log your first one.</div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: YIELD & BUTCHERY SYSTEM
// ════════════════════════════════════════════════════════════════════════════

function YieldButchery() {
  const { yieldTests, setYieldTests } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newTest, setNewTest] = useState<Omit<YieldTest,'id'>>({ ingredientName:'', rawWeightOz:'', trimWeightOz:'', usableWeightOz:'', costBeforeYield:'', notes:'' });

  const update = (id:number, field:keyof YieldTest, val:string) =>
    setYieldTests(prev=>prev.map(t=>t.id===id ? { ...t,[field]:val } : t));
  const del = (id:number) => setYieldTests(prev=>prev.filter(t=>t.id!==id));
  const add = () => {
    if (!newTest.ingredientName) return;
    setYieldTests(prev=>[...prev,{ ...newTest, id:Date.now() }]);
    setNewTest({ ingredientName:'', rawWeightOz:'', trimWeightOz:'', usableWeightOz:'', costBeforeYield:'', notes:'' });
    setShowAdd(false);
  };

  const calc = (t:YieldTest) => {
    const raw = parseFloat(t.rawWeightOz||'0');
    const usable = parseFloat(t.usableWeightOz||'0');
    const cost = parseFloat(t.costBeforeYield||'0');
    if (!raw || !usable) return { yieldPct:null as number|null, trimLossPct:null as number|null, costAfterYield:null as number|null };
    const yieldPct = (usable / raw) * 100;
    const trimLossPct = 100 - yieldPct;
    const costAfterYield = cost ? cost / (usable / raw) : null;
    return { yieldPct, trimLossPct, costAfterYield };
  };

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <Btn primary onClick={()=>setShowAdd(!showAdd)}>+ New yield test</Btn>
      </div>

      {showAdd && (
        <div style={{ ...card, border:`1px solid ${C.amber}` }}>
          <div style={sectionTitle}>New yield test</div>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <div><span style={label}>Ingredient *</span><input style={inputSt} value={newTest.ingredientName} onChange={e=>setNewTest(p=>({...p,ingredientName:e.target.value}))} placeholder="e.g. Whole Lobster" /></div>
            <div><span style={label}>Raw weight (oz)</span><input type="number" style={inputSt} value={newTest.rawWeightOz} onChange={e=>setNewTest(p=>({...p,rawWeightOz:e.target.value}))} /></div>
            <div><span style={label}>Trim weight (oz)</span><input type="number" style={inputSt} value={newTest.trimWeightOz} onChange={e=>setNewTest(p=>({...p,trimWeightOz:e.target.value}))} /></div>
            <div><span style={label}>Usable weight (oz)</span><input type="number" style={inputSt} value={newTest.usableWeightOz} onChange={e=>setNewTest(p=>({...p,usableWeightOz:e.target.value}))} /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:10, marginBottom:10 }}>
            <div><span style={label}>Cost before yield ($)</span><input type="number" style={inputSt} value={newTest.costBeforeYield} onChange={e=>setNewTest(p=>({...p,costBeforeYield:e.target.value}))} /></div>
            <div><span style={label}>Notes</span><input style={inputSt} value={newTest.notes} onChange={e=>setNewTest(p=>({...p,notes:e.target.value}))} /></div>
          </div>
          <div style={{ display:'flex', gap:8 }}><Btn primary onClick={add}>Save test</Btn><Btn onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
        </div>
      )}

      <div style={card}>
        <div style={sectionTitle}>Yield tests — true usable cost after trim loss</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', minWidth:900 }}>
            <thead><tr>{['Ingredient','Raw (oz)','Trim (oz)','Usable (oz)','Yield %','Trim loss %','Cost before','Cost after yield','Notes',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {yieldTests.map(t=>{
                const { yieldPct, trimLossPct, costAfterYield } = calc(t);
                return (
                  <tr key={t.id}>
                    <td style={td}><input style={{ ...tdInput, minWidth:140, fontWeight:500, color:C.text }} value={t.ingredientName} onChange={e=>update(t.id,'ingredientName',e.target.value)} /></td>
                    <td style={td}><input type="number" style={{ ...tdInput, width:60 }} value={t.rawWeightOz} onChange={e=>update(t.id,'rawWeightOz',e.target.value)} /></td>
                    <td style={td}><input type="number" style={{ ...tdInput, width:60 }} value={t.trimWeightOz} onChange={e=>update(t.id,'trimWeightOz',e.target.value)} /></td>
                    <td style={td}><input type="number" style={{ ...tdInput, width:60 }} value={t.usableWeightOz} onChange={e=>update(t.id,'usableWeightOz',e.target.value)} /></td>
                    <td style={{ ...td, fontFamily:C.mono, color: yieldPct!==null ? (yieldPct>80?C.emerald:yieldPct>60?C.amber:C.red) : C.muted }}>{yieldPct!==null?`${yieldPct.toFixed(1)}%`:'—'}</td>
                    <td style={{ ...td, fontFamily:C.mono, color:C.amber }}>{trimLossPct!==null?`${trimLossPct.toFixed(1)}%`:'—'}</td>
                    <td style={td}><input type="number" style={{ ...tdInput, width:65 }} value={t.costBeforeYield} onChange={e=>update(t.id,'costBeforeYield',e.target.value)} /></td>
                    <td style={{ ...td, fontFamily:C.mono, color:C.red }}>{costAfterYield!==null?`$${costAfterYield.toFixed(2)}`:'—'}</td>
                    <td style={td}><input style={{ ...tdInput, minWidth:100 }} value={t.notes} onChange={e=>update(t.id,'notes',e.target.value)} /></td>
                    <td style={td}><Btn small danger onClick={()=>del(t.id)}>✕</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {yieldTests.length === 0 && <div style={{ color:C.muted, fontSize:12, padding:'10px 0' }}>No yield tests yet. Add one for any protein, seafood, or produce item that has trim loss.</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: STATION DASHBOARDS
// ════════════════════════════════════════════════════════════════════════════

interface EightySixItem { id:number; item:string; time:string; }

function Stations() {
  const { recipes } = useStore();
  const [active, setActive] = useState(STATIONS[0]);
  const [eightySix, setEightySix] = useState<EightySixItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [checklist, setChecklist] = useState<Record<string, { opening:string[]; closing:string[] }>>({});

  const stationRecipes = recipes.filter(r => r.station === active);

  const add86 = () => {
    if (!newItem) return;
    setEightySix(prev => [...prev, { id: Date.now(), item: newItem, time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }]);
    setNewItem('');
  };
  const remove86 = (id:number) => setEightySix(prev => prev.filter(e=>e.id!==id));

  const icons: Record<string,string> = { 'Raw Bar':'🦪', Grill:'🔥', Fry:'🍟', Sauté:'🍳', Pantry:'🥗', Prep:'🔪', Dessert:'🍮', Expo:'📋' };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
        {STATIONS.map(s=>(
          <div key={s} onClick={()=>setActive(s)} style={{ background: active===s ? 'rgba(245,158,11,0.06)' : C.card, border:`1px solid ${active===s ? C.amber : C.border}`, borderRadius:8, padding:12, cursor:'pointer' }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icons[s]}</div>
            <div style={{ fontSize:12, fontWeight:500 }}>{s}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{recipes.filter(r=>r.station===s).length} recipes</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={card}>
          <div style={sectionTitle}>86 list — {active}</div>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input style={{ ...inputSt, flex:1 }} placeholder="Item to 86..." value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==='Enter' && add86()} />
            <Btn primary onClick={add86}>86 it</Btn>
          </div>
          {eightySix.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No items 86'd right now.</div>}
          {eightySix.map(e=>(
            <div key={e.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, marginBottom:6, fontSize:13 }}>
              <span style={{ color:C.red }}>✕</span>
              <span style={{ flex:1 }}>{e.item}</span>
              <span style={{ fontSize:10, color:C.dim }}>{e.time}</span>
              <Btn small onClick={()=>remove86(e.id)}>Clear</Btn>
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={sectionTitle}>{active} — station recipes</div>
          {stationRecipes.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No recipes assigned to this station yet. Set the station field on a recipe in Recipe Builder.</div>}
          {stationRecipes.map(r=>(
            <StatRow key={r.id} label={r.name} value={r.type === 'plate' ? (r.sellPrice ? `$${r.sellPrice}` : 'No price') : `${r.yieldQty}${r.yieldUnit} batch`} />
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
        <ChecklistCard title="Opening checklist" stationKey={active} type="opening" checklist={checklist} setChecklist={setChecklist} />
        <ChecklistCard title="Closing checklist" stationKey={active} type="closing" checklist={checklist} setChecklist={setChecklist} />
      </div>
    </div>
  );
}

function ChecklistCard({ title, stationKey, type, checklist, setChecklist }: {
  title:string; stationKey:string; type:'opening'|'closing';
  checklist: Record<string,{opening:string[];closing:string[]}>;
  setChecklist: (v: Record<string,{opening:string[];closing:string[]}> | ((p:Record<string,{opening:string[];closing:string[]}>)=>Record<string,{opening:string[];closing:string[]}>)) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const items = checklist[stationKey]?.[type] || [];

  const addTask = () => {
    if (!newTask) return;
    setChecklist(prev => {
      const station = prev[stationKey] || { opening:[], closing:[] };
      return { ...prev, [stationKey]: { ...station, [type]: [...station[type], newTask] } };
    });
    setNewTask('');
  };
  const removeTask = (idx:number) => {
    setChecklist(prev => {
      const station = prev[stationKey] || { opening:[], closing:[] };
      return { ...prev, [stationKey]: { ...station, [type]: station[type].filter((_,i)=>i!==idx) } };
    });
  };

  return (
    <div style={card}>
      <div style={sectionTitle}>{title} — {stationKey}</div>
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <input style={{ ...inputSt, flex:1 }} placeholder="Add checklist item..." value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter' && addTask()} />
        <Btn small primary onClick={addTask}>+ Add</Btn>
      </div>
      {items.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No items yet.</div>}
      {items.map((item,idx)=>(
        <div key={idx} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
          <span style={{ flex:1, color:C.text }}>{idx+1}. {item}</span>
          <Btn small danger onClick={()=>removeTask(idx)}>✕</Btn>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: INVOICE PROCESSING & COST INTELLIGENCE (source of truth engine)
// ════════════════════════════════════════════════════════════════════════════

function Invoices() {
  const { invoices, setInvoices, ingredients, setIngredients, recipes } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number|null>(null);
  const [header, setHeader] = useState({ invoiceNumber:'', vendor:'', invoiceDate:new Date().toISOString().split('T')[0], deliveryDate:'', poNumber:'' });
  const [lines, setLines] = useState<{ ingredientId:number|null; itemName:string; qty:string; unit:string; cost:string }[]>([{ ingredientId:null, itemName:'', qty:'', unit:'ea', cost:'' }]);

  const addLine = () => setLines(prev => [...prev, { ingredientId:null, itemName:'', qty:'', unit:'ea', cost:'' }]);
  const updateLine = (idx:number, field:string, val:string) =>
    setLines(prev => prev.map((l,i) => i===idx ? { ...l, [field]: field==='ingredientId' ? (val ? parseInt(val) : null) : val, itemName: field==='ingredientId' ? (ingredients.find(ing=>ing.id===parseInt(val))?.name || l.itemName) : l.itemName } : l));
  const removeLine = (idx:number) => setLines(prev => prev.filter((_,i)=>i!==idx));

  const saveInvoice = () => {
    if (!header.vendor || lines.every(l=>!l.itemName)) return;
    const linesWithPrev = lines.filter(l=>l.itemName).map(l => ({
      id: Date.now() + Math.random(),
      ...l,
      previousCost: l.ingredientId ? (ingredients.find(i=>i.id===l.ingredientId)?.currentCost || '') : '',
    }));
    const invoice: Invoice = { id: Date.now(), ...header, lines: linesWithPrev, status:'pending' };
    setInvoices(prev => [invoice, ...prev]);

    setIngredients(prev => prev.map(ing => {
      const line = linesWithPrev.find(l => l.ingredientId === ing.id);
      if (!line || !line.cost) return ing;
      return { ...ing, currentCost: line.cost, priceHistory: [...ing.priceHistory, { date: header.invoiceDate, price: line.cost, invoiceId: String(invoice.id) }] };
    }));

    setHeader({ invoiceNumber:'', vendor:'', invoiceDate:new Date().toISOString().split('T')[0], deliveryDate:'', poNumber:'' });
    setLines([{ ingredientId:null, itemName:'', qty:'', unit:'ea', cost:'' }]);
    setShowAdd(false);
    setSelectedId(invoice.id);
  };

  const selected = invoices.find(i => i.id === selectedId);

  const impactFor = (ingredientId:number|null) => {
    if (!ingredientId) return [];
    return findDependents('ingredient', ingredientId, recipes);
  };

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <Btn primary onClick={()=>setShowAdd(!showAdd)}>+ Enter invoice</Btn>
      </div>

      <div style={{ ...card, background:'rgba(55,138,221,0.05)', border:'1px solid rgba(55,138,221,0.2)' }}>
        <div style={{ fontSize:12, color:C.blue }}>💡 Invoices are the source of truth. Entering a price here automatically updates the ingredient's current cost, logs it to price history, and recalculates every recipe and plate that uses it.</div>
      </div>

      {showAdd && (
        <div style={{ ...card, border:`1px solid ${C.amber}` }}>
          <div style={sectionTitle}>New invoice</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:14 }}>
            <div><span style={label}>Vendor *</span><input style={inputSt} value={header.vendor} onChange={e=>setHeader(p=>({...p,vendor:e.target.value}))} /></div>
            <div><span style={label}>Invoice #</span><input style={inputSt} value={header.invoiceNumber} onChange={e=>setHeader(p=>({...p,invoiceNumber:e.target.value}))} /></div>
            <div><span style={label}>Invoice date</span><input type="date" style={inputSt} value={header.invoiceDate} onChange={e=>setHeader(p=>({...p,invoiceDate:e.target.value}))} /></div>
            <div><span style={label}>PO number</span><input style={inputSt} value={header.poNumber} onChange={e=>setHeader(p=>({...p,poNumber:e.target.value}))} /></div>
          </div>

          <div style={sectionTitle}>Line items</div>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:10 }}>
            <thead><tr>{['Match to ingredient','Item name','Qty','Unit','New cost ($)','Previous',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {lines.map((l,idx)=>{
                const prevCost = l.ingredientId ? ingredients.find(i=>i.id===l.ingredientId)?.currentCost : '';
                return (
                  <tr key={idx}>
                    <td style={td}>
                      <select style={{ ...tdInput, background:'transparent', minWidth:160 }} value={l.ingredientId ?? ''} onChange={e=>updateLine(idx,'ingredientId',e.target.value)}>
                        <option value="">— new item —</option>
                        {ingredients.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </td>
                    <td style={td}><input style={{ ...tdInput, minWidth:140 }} value={l.itemName} onChange={e=>updateLine(idx,'itemName',e.target.value)} /></td>
                    <td style={td}><input style={{ ...tdInput, width:60 }} value={l.qty} onChange={e=>updateLine(idx,'qty',e.target.value)} /></td>
                    <td style={td}><input style={{ ...tdInput, width:60 }} value={l.unit} onChange={e=>updateLine(idx,'unit',e.target.value)} /></td>
                    <td style={td}><input type="number" style={{ ...tdInput, color:C.amber, fontFamily:C.mono, width:80 }} value={l.cost} onChange={e=>updateLine(idx,'cost',e.target.value)} /></td>
                    <td style={{ ...td, fontFamily:C.mono, color:C.muted }}>{prevCost ? `$${prevCost}` : '—'}</td>
                    <td style={td}><Btn small danger onClick={()=>removeLine(idx)}>✕</Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display:'flex', gap:8 }}>
            <Btn small onClick={addLine}>+ Add line</Btn>
            <Btn primary onClick={saveInvoice}>Save invoice &amp; update costs</Btn>
            <Btn onClick={()=>setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:12 }}>
        <div style={{ ...card, padding:10 }}>
          <div style={sectionTitle}>Invoice history</div>
          {invoices.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No invoices entered yet.</div>}
          {invoices.map(inv=>(
            <div key={inv.id} onClick={()=>setSelectedId(inv.id)} style={{ padding:'8px', borderRadius:5, cursor:'pointer', fontSize:12, marginBottom:4, background: selectedId===inv.id ? 'rgba(245,158,11,0.08)' : 'transparent', borderLeft:`2px solid ${selectedId===inv.id?C.amber:'transparent'}` }}>
              <div style={{ color:C.text, fontWeight:500 }}>{inv.vendor}</div>
              <div style={{ color:C.dim, fontSize:10 }}>{inv.invoiceDate} · {inv.lines.length} items</div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={card}>
            <div style={sectionTitle}>Invoice detail — {selected.vendor} ({selected.invoiceDate})</div>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse', marginBottom:14 }}>
              <thead><tr>{['Item','Qty','Unit','New cost','Previous','Variance','Affects'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {selected.lines.map(l=>{
                  const pct = priceVariancePct(l.cost, l.previousCost);
                  const affected = impactFor(l.ingredientId);
                  return (
                    <tr key={l.id}>
                      <td style={{ ...td, color:C.text, fontWeight:500 }}>{l.itemName}</td>
                      <td style={td}>{l.qty} {l.unit}</td>
                      <td style={td}>{l.unit}</td>
                      <td style={{ ...td, fontFamily:C.mono, color:C.amber }}>${l.cost}</td>
                      <td style={{ ...td, fontFamily:C.mono, color:C.muted }}>{l.previousCost ? `$${l.previousCost}` : '—'}</td>
                      <td style={td}>{pct !== null ? <Badge color={pct>5?'red':pct<-2?'green':'blue'}>{pct>0?'+':''}{pct.toFixed(1)}%</Badge> : '—'}</td>
                      <td style={td}>{affected.length > 0 ? <Badge color="purple">{affected.length} recipes</Badge> : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={sectionTitle}>Impact analysis</div>
            {selected.lines.filter(l=>l.ingredientId).map(l=>{
              const affected = impactFor(l.ingredientId);
              if (affected.length === 0) return null;
              return (
                <div key={l.id} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12, color:C.text, fontWeight:500, marginBottom:4 }}>{l.itemName} affects:</div>
                  {affected.map(r => (<StatRow key={r.id} label={r.name} value={r.type} />))}
                </div>
              );
            })}
            {selected.lines.every(l => impactFor(l.ingredientId).length === 0) && (
              <div style={{ fontSize:12, color:C.muted }}>No recipes currently reference these ingredients, or items weren't matched to an existing ingredient.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: VENDORS
// ════════════════════════════════════════════════════════════════════════════

const VENDOR_BLANK: Omit<Vendor,'id'> = { name:'', repName:'', phone:'', email:'', accountNumber:'', deliveryDays:'', orderMinimum:'', paymentTerms:'', notes:'' };

function VendorsPage() {
  const { vendors, setVendors, ingredients } = useStore();
  const [selectedId, setSelectedId] = useState<number|null>(vendors[0]?.id ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [newVendor, setNewVendor] = useState(VENDOR_BLANK);

  const current = vendors.find(v => v.id === selectedId);

  const update = (id:number, field:keyof Vendor, val:string) =>
    setVendors(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));

  const del = (id:number) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    setSelectedId(vendors[0]?.id ?? null);
  };

  const add = () => {
    if (!newVendor.name) return;
    const nv = { ...newVendor, id: Date.now() };
    setVendors(prev => [...prev, nv]);
    setSelectedId(nv.id);
    setNewVendor(VENDOR_BLANK);
    setShowAdd(false);
  };

  // Show all ingredients linked to this vendor
  const vendorIngredients = current
    ? ingredients.filter(i => i.vendor.toLowerCase() === current.name.toLowerCase())
    : [];

  const FIELDS: [keyof Omit<Vendor,'id'>, string][] = [
    ['name','Vendor name *'], ['repName','Rep name'], ['phone','Phone'],
    ['email','Email'], ['accountNumber','Account number'], ['deliveryDays','Delivery days'],
    ['orderMinimum','Order minimum ($)'], ['paymentTerms','Payment terms'],
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:12, height:'calc(100vh - 100px)' }}>
      <div style={{ ...card, overflowY:'auto', padding:10 }}>
        <Btn small primary onClick={()=>setShowAdd(!showAdd)}>+ Add vendor</Btn>
        <div style={{ marginTop:10 }}>
          {vendors.map(v => (
            <div key={v.id} onClick={()=>setSelectedId(v.id)} style={{ padding:'8px', borderRadius:5, cursor:'pointer', fontSize:12, marginBottom:3, background: selectedId===v.id ? 'rgba(245,158,11,0.08)' : 'transparent', borderLeft:`2px solid ${selectedId===v.id?C.amber:'transparent'}` }}>
              <div style={{ color:C.text, fontWeight:500 }}>{v.name}</div>
              <div style={{ color:C.dim, fontSize:10 }}>{v.deliveryDays || 'No delivery days set'}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowY:'auto' }}>
        {showAdd && (
          <div style={{ ...card, border:`1px solid ${C.amber}` }}>
            <div style={sectionTitle}>New vendor</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              {FIELDS.map(([f,l]) => (
                <div key={f}><span style={label}>{l}</span><input style={inputSt} value={String(newVendor[f])} onChange={e=>setNewVendor(p=>({...p,[f]:e.target.value}))} /></div>
              ))}
            </div>
            <div><span style={label}>Notes</span><textarea style={{ ...inputSt, minHeight:50 }} value={newVendor.notes} onChange={e=>setNewVendor(p=>({...p,notes:e.target.value}))} /></div>
            <div style={{ display:'flex', gap:8, marginTop:10 }}><Btn primary onClick={add}>Save vendor</Btn><Btn onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
          </div>
        )}

        {current && !showAdd && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:16, fontWeight:500 }}>{current.name}</div>
              <Btn small danger onClick={()=>del(current.id)}>Delete vendor</Btn>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {FIELDS.map(([f,l]) => (
                <div key={f}>
                  <span style={label}>{l}</span>
                  <input style={inputSt} value={String(current[f])} onChange={e=>update(current.id, f, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <span style={label}>Notes</span>
              <textarea style={{ ...inputSt, minHeight:60 }} value={current.notes} onChange={e=>update(current.id,'notes',e.target.value)} />
            </div>

            <div style={sectionTitle}>Ingredients from {current.name} ({vendorIngredients.length})</div>
            {vendorIngredients.length === 0 && (
              <div style={{ fontSize:12, color:C.muted }}>No ingredients linked to this vendor yet. Set the vendor field on ingredients to match "{current.name}" exactly.</div>
            )}
            {vendorIngredients.map(i => {
              const pct = priceVariancePct(i.currentCost, i.baselineCost);
              return (
                <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                  <span style={{ color:C.text }}>{i.name}</span>
                  <span style={{ color:C.muted, fontSize:11 }}>{i.purchaseUnit}</span>
                  <span style={{ fontFamily:C.mono, color:C.amber }}>${parseFloat(i.currentCost||'0').toFixed(2)}</span>
                  {pct!==null && pct>5 ? <Badge color="red">+{pct.toFixed(1)}%</Badge> : pct!==null ? <Badge color="green">Stable</Badge> : <Badge color="amber">No price</Badge>}
                </div>
              );
            })}
          </div>
        )}

        {!current && !showAdd && (
          <div style={{ ...card, textAlign:'center', color:C.muted, padding:40 }}>Select a vendor from the left or create a new one.</div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: MENU PRICE OPTIMIZATION ENGINE
// ════════════════════════════════════════════════════════════════════════════

function PriceOptimization() {
  const { recipes, ingredients, targetFcPct, setTargetFcPct } = useStore();
  const target = targetFcPct;

  const plates = recipes.filter(r => r.type === 'plate' && r.sellPrice);
  const analysis = plates.map(p => {
    const cost = recipeCost(p, ingredients, recipes);
    const sell = parseFloat(p.sellPrice);
    const fc = foodCostPct(cost.costPerUnit, sell);
    const ideal = idealSellPrice(cost.costPerUnit, target);
    const priceGap = ideal - sell;
    const annualImpact = priceGap * 52 * 10;
    return { p, cost: cost.costPerUnit, sell, fc, ideal, priceGap, annualImpact, missing: cost.missing.length > 0 };
  }).filter(a => !a.missing && a.fc !== null && a.fc > target).sort((a,b)=>b.priceGap-a.priceGap);

  const recommendation = (gap:number) => {
    if (gap > 5) return 'Raise price significantly or rework recipe';
    if (gap > 2) return 'Raise price moderately';
    if (gap > 0) return 'Small price increase';
    return 'Reduce portion or substitute ingredient';
  };

  return (
    <div>
      <div style={{ ...card, border:`1px solid ${C.amber}`, marginBottom:14 }}>
        <div style={sectionTitle}>Target food cost %</div>
        <div style={{ maxWidth:200 }}>
          <span style={label}>Target FC %</span>
          <input type="number" style={{ ...inputSt, fontFamily:C.mono, color:C.amber, fontSize:16 }} value={target} onChange={e=>setTargetFcPct(parseFloat(e.target.value)||29)} />
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
        <div style={{ ...card, marginBottom:0 }}><div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Items needing price action</div><div style={{ fontSize:26, fontFamily:C.mono, color:analysis.length?C.red:C.emerald }}>{analysis.length}</div></div>
        <div style={{ ...card, marginBottom:0 }}><div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Total price gap</div><div style={{ fontSize:26, fontFamily:C.mono, color:C.amber }}>${analysis.reduce((s,a)=>s+Math.max(0,a.priceGap),0).toFixed(2)}</div></div>
        <div style={{ ...card, marginBottom:0 }}><div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Est. annual impact*</div><div style={{ fontSize:26, fontFamily:C.mono, color:C.emerald }}>${analysis.reduce((s,a)=>s+Math.max(0,a.annualImpact),0).toFixed(0)}</div></div>
      </div>
      <div style={{ fontSize:11, color:C.dim, marginBottom:14 }}>*Illustrative estimate assuming ~10 units sold per week per item. Connect real sales data for accurate projections.</div>

      <div style={card}>
        <div style={sectionTitle}>Price optimization recommendations</div>
        {analysis.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No items currently exceed your target food cost %, or sell prices/ingredient costs haven't been fully entered yet.</div>}
        {analysis.map(a=>(
          <div key={a.p.id} style={{ padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <strong style={{ color:C.text, fontSize:13 }}>{a.p.name}</strong>
              <Badge color="red">FC {a.fc!.toFixed(1)}%</Badge>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:6 }}>
              <StatRow label="Current price" value={`$${a.sell.toFixed(2)}`} />
              <StatRow label="Plate cost" value={`$${a.cost.toFixed(2)}`} valueColor={C.amber} />
              <StatRow label="Ideal price" value={`$${a.ideal.toFixed(2)}`} valueColor={C.emerald} />
              <StatRow label="Price gap" value={`$${a.priceGap.toFixed(2)}`} valueColor={C.red} />
            </div>
            <div style={{ fontSize:11, color:C.blue }}>→ {recommendation(a.priceGap)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: KITCHEN KPI & ANALYTICS ENGINE
// ════════════════════════════════════════════════════════════════════════════

function Analytics() {
  const { ingredients, recipes, waste, invoices, weeklyEntries } = useStore();

  const defaultAEnd = mondayOf();
  const defaultAStart = (() => { const d = new Date(defaultAEnd); d.setDate(d.getDate()-6); return d.toISOString().split('T')[0]; })();
  const defaultBEnd = (() => { const d = new Date(defaultAStart); d.setDate(d.getDate()-1); return d.toISOString().split('T')[0]; })();
  const defaultBStart = (() => { const d = new Date(defaultBEnd); d.setDate(d.getDate()-6); return d.toISOString().split('T')[0]; })();

  const [aStart, setAStart] = useState(defaultAStart);
  const [aEnd, setAEnd] = useState(defaultAEnd);
  const [bStart, setBStart] = useState(defaultBStart);
  const [bEnd, setBEnd] = useState(defaultBEnd);

  const plates = recipes.filter(r => r.type === 'plate' && r.sellPrice);
  const avgFc = plates.length ? plates.reduce((s,p) => {
    const cost = recipeCost(p, ingredients, recipes);
    const fc = foodCostPct(cost.costPerUnit, parseFloat(p.sellPrice)) || 0;
    return s + fc;
  }, 0) / plates.length : null;

  const inflationItems = ingredients.map(i => ({ name:i.name, pct: priceVariancePct(i.currentCost, i.baselineCost) })).filter(x => x.pct !== null);
  const avgInflation = inflationItems.length ? inflationItems.reduce((s,x)=>s+(x.pct||0),0) / inflationItems.length : null;

  const wasteThisPeriod = waste.reduce((s,w) => s + (parseFloat(w.cost||'0')||0), 0);
  const recipeVersionChanges = recipes.reduce((s,r) => s + (r.version - 1), 0);

  const metrics = [
    { label:'Average plate food cost %', value: avgFc !== null ? `${avgFc.toFixed(1)}%` : '—', color: avgFc !== null ? (avgFc > 31 ? C.red : avgFc > 29 ? C.amber : C.emerald) : C.muted },
    { label:'Average ingredient inflation', value: avgInflation !== null ? `${avgInflation > 0 ? '+' : ''}${avgInflation.toFixed(1)}%` : '—', color: avgInflation !== null ? (avgInflation > 5 ? C.red : C.emerald) : C.muted },
    { label:'Waste logged this period', value: `$${wasteThisPeriod.toFixed(2)}`, color: wasteThisPeriod > 0 ? C.amber : C.muted },
    { label:'Invoices processed', value: `${invoices.length}`, color: C.text },
    { label:'Recipe revisions tracked', value: `${recipeVersionChanges}`, color: C.text },
    { label:'Active menu items', value: `${plates.length}`, color: C.text },
  ];

  const trendNote = (label:string) => {
    if (label.includes('food cost') && avgFc !== null && avgFc > 29) return 'Trending above target — review highest-cost plates in Price Optimization';
    if (label.includes('inflation') && avgInflation !== null && avgInflation > 3) return 'Vendor costs rising faster than usual — check Invoices for recent spikes';
    if (label.includes('Waste') && wasteThisPeriod > 100) return 'Waste cost is material — review Root Cause Analysis in Waste Tracker';
    return null;
  };

  // Period comparison calculations
  const wasteInPeriod = (s:string, e:string) => waste.filter(w => w.date >= s && w.date <= e).reduce((sum,w)=>sum+(parseFloat(w.cost||'0')||0),0);
  const invoicesInPeriod = (s:string, e:string) => invoices.filter(i => i.invoiceDate >= s && i.invoiceDate <= e).length;
  const salesInPeriod = (s:string, e:string) => {
    const weeks = weeklyEntries.filter(w => w.weekStart >= mondayOf(s) && w.weekStart <= e && w.weeklySales);
    return weeks.reduce((sum,w)=>sum+(parseFloat(w.weeklySales||'0')||0),0);
  };
  const spendInPeriod = (s:string, e:string) => {
    const weeks = weeklyEntries.filter(w => w.weekStart >= mondayOf(s) && w.weekStart <= e && w.foodSpend);
    return weeks.reduce((sum,w)=>sum+(parseFloat(w.foodSpend||'0')||0),0);
  };
  const fcInPeriod = (s:string, e:string) => {
    const sales = salesInPeriod(s,e), spend = spendInPeriod(s,e);
    return sales ? (spend/sales)*100 : null;
  };

  const wasteA = wasteInPeriod(aStart, aEnd), wasteB = wasteInPeriod(bStart, bEnd);
  const invA = invoicesInPeriod(aStart, aEnd), invB = invoicesInPeriod(bStart, bEnd);
  const salesA = salesInPeriod(aStart, aEnd), salesB = salesInPeriod(bStart, bEnd);
  const spendA = spendInPeriod(aStart, aEnd), spendB = spendInPeriod(bStart, bEnd);
  const fcA = fcInPeriod(aStart, aEnd), fcB = fcInPeriod(bStart, bEnd);
  const fcDelta = fcA !== null && fcB !== null ? fcA - fcB : null;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>{m.label}</div>
            <div style={{ fontSize:26, fontFamily:C.mono, color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={sectionTitle}>📊 Period comparison — select two date ranges to compare</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:C.blue, fontWeight:500, marginBottom:6 }}>Period A</div>
            <DateRangePicker start={aStart} end={aEnd} onChange={(s,e)=>{setAStart(s);setAEnd(e);}} compact />
          </div>
          <div>
            <div style={{ fontSize:11, color:C.purple, fontWeight:500, marginBottom:6 }}>Period B</div>
            <DateRangePicker start={bStart} end={bEnd} onChange={(s,e)=>{setBStart(s);setBEnd(e);}} compact />
          </div>
        </div>

        {fcDelta !== null && (
          <div style={{ marginBottom:14, padding:'10px 12px', borderRadius:8, background: fcDelta > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', border:`1px solid ${fcDelta > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            <span style={{ fontSize:12, color: fcDelta > 0 ? C.red : C.emerald }}>
              Food cost % {fcDelta > 0 ? 'increased' : 'decreased'} by {Math.abs(fcDelta).toFixed(1)} points from Period B to Period A
            </span>
          </div>
        )}

        <ComparisonBar labelA="Sales" labelB="Sales" valueA={salesA} valueB={salesB} format={n=>`$${n.toFixed(0)}`} />
        <ComparisonBar labelA="Spend" labelB="Spend" valueA={spendA} valueB={spendB} format={n=>`$${n.toFixed(0)}`} />
        <ComparisonBar labelA="Waste" labelB="Waste" valueA={wasteA} valueB={wasteB} format={n=>`$${n.toFixed(0)}`} />
        <ComparisonBar labelA="Invoices" labelB="Invoices" valueA={invA} valueB={invB} format={n=>`${n.toFixed(0)}`} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
          <div style={{ ...card, marginBottom:0, background:'rgba(55,138,221,0.05)', borderColor:'rgba(55,138,221,0.2)' }}>
            <StatRow label="Food cost %" value={fcA!==null?`${fcA.toFixed(1)}%`:'—'} valueColor={C.blue} />
            <StatRow label="Sales" value={`$${salesA.toFixed(2)}`} />
            <StatRow label="Spend" value={`$${spendA.toFixed(2)}`} />
            <StatRow label="Waste" value={`$${wasteA.toFixed(2)}`} />
          </div>
          <div style={{ ...card, marginBottom:0, background:'rgba(168,85,247,0.05)', borderColor:'rgba(168,85,247,0.2)' }}>
            <StatRow label="Food cost %" value={fcB!==null?`${fcB.toFixed(1)}%`:'—'} valueColor={C.purple} />
            <StatRow label="Sales" value={`$${salesB.toFixed(2)}`} />
            <StatRow label="Spend" value={`$${spendB.toFixed(2)}`} />
            <StatRow label="Waste" value={`$${wasteB.toFixed(2)}`} />
          </div>
        </div>
        {salesA === 0 && salesB === 0 && (
          <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>No weekly sales/spend data found in either period. Enter numbers on the Dashboard for these weeks to see food cost % comparison.</div>
        )}
      </div>

      <div style={card}>
        <div style={sectionTitle}>Trend signals</div>
        {metrics.map(m => {
          const note = trendNote(m.label);
          if (!note) return null;
          return (
            <div key={m.label} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom:`1px solid ${C.border}`, alignItems:'flex-start' }}>
              <Badge color="amber">Signal</Badge>
              <div style={{ fontSize:12, color:C.text }}>{note}</div>
            </div>
          );
        })}
        {metrics.every(m => !trendNote(m.label)) && (
          <div style={{ fontSize:12, color:C.muted }}>No trend signals yet — keep entering invoices, sell prices, and waste data to build trend history.</div>
        )}
      </div>

      <div style={card}>
        <div style={sectionTitle}>About this analytics engine</div>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
          This dashboard recalculates live from your current Ingredients, Recipes, Invoices, and Waste data — no manual report generation needed.
          As you log more invoices and waste events over time, trend signals will become more precise. Use the period comparison above to check this week against last week, or any two custom date ranges.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: CULINARY KNOWLEDGE & SOP SYSTEM
// ════════════════════════════════════════════════════════════════════════════

const TYPE_COLORS: Record<SopEntry['type'], BadgeColor> = { sop:'blue', plating:'purple', opening:'green', closing:'amber', training:'red' };

function KnowledgeBase() {
  const { sops, setSops } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all'|SopEntry['type']>('all');
  const [selectedId, setSelectedId] = useState<number|null>(sops[0]?.id ?? null);
  const [newEntry, setNewEntry] = useState<Omit<SopEntry,'id'>>({ title:'', station:'Prep', type:'sop', content:'' });

  const add = () => {
    if (!newEntry.title) return;
    const entry = { ...newEntry, id: Date.now() };
    setSops(prev => [...prev, entry]);
    setNewEntry({ title:'', station:'Prep', type:'sop', content:'' });
    setShowAdd(false);
    setSelectedId(entry.id);
  };
  const del = (id:number) => { setSops(prev => prev.filter(s=>s.id!==id)); if (selectedId===id) setSelectedId(null); };

  const update = (id:number, field:keyof SopEntry, val:string) =>
    setSops(prev => prev.map(s => s.id===id ? { ...s, [field]: val } : s));

  const filtered = sops.filter(s => filter==='all' || s.type===filter);
  const current = sops.find(s => s.id === selectedId);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:12, height:'calc(100vh - 100px)' }}>
      <div style={{ ...card, overflowY:'auto', padding:10 }}>
        <Btn small primary onClick={()=>setShowAdd(!showAdd)}>+ New entry</Btn>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', margin:'10px 0' }}>
          {(['all','sop','plating','opening','closing','training'] as const).map(t=>(
            <button key={t} onClick={()=>setFilter(t)} style={{ padding:'4px 8px', fontSize:10, borderRadius:5, cursor:'pointer', border:`1px solid ${filter===t?C.amber:C.border}`, background:filter===t?'rgba(245,158,11,0.1)':'transparent', color:filter===t?C.amber:C.muted }}>{t}</button>
          ))}
        </div>
        {filtered.map(s => (
          <div key={s.id} onClick={()=>setSelectedId(s.id)} style={{ padding:'8px', borderRadius:5, cursor:'pointer', marginBottom:4, background: selectedId===s.id ? 'rgba(245,158,11,0.08)' : 'transparent', borderLeft:`2px solid ${selectedId===s.id?C.amber:'transparent'}` }}>
            <div style={{ fontSize:12, color:C.text, marginBottom:3 }}>{s.title}</div>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <Badge color={TYPE_COLORS[s.type]}>{s.type}</Badge>
              <span style={{ fontSize:10, color:C.dim }}>{s.station}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflowY:'auto' }}>
        {showAdd && (
          <div style={{ ...card, border:`1px solid ${C.amber}` }}>
            <div style={sectionTitle}>New SOP / training entry</div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10 }}>
              <div><span style={label}>Title *</span><input style={inputSt} value={newEntry.title} onChange={e=>setNewEntry(p=>({...p,title:e.target.value}))} /></div>
              <div><span style={label}>Station</span><select style={selectSt} value={newEntry.station} onChange={e=>setNewEntry(p=>({...p,station:e.target.value}))}>{STATIONS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><span style={label}>Type</span><select style={selectSt} value={newEntry.type} onChange={e=>setNewEntry(p=>({...p,type:e.target.value as SopEntry['type']}))}><option value="sop">SOP</option><option value="plating">Plating guide</option><option value="opening">Opening checklist</option><option value="closing">Closing checklist</option><option value="training">Training doc</option></select></div>
            </div>
            <span style={label}>Content</span>
            <textarea style={{ ...inputSt, minHeight:120, marginBottom:10 }} value={newEntry.content} onChange={e=>setNewEntry(p=>({...p,content:e.target.value}))} />
            <div style={{ display:'flex', gap:8 }}><Btn primary onClick={add}>Save</Btn><Btn onClick={()=>setShowAdd(false)}>Cancel</Btn></div>
          </div>
        )}

        {current && !showAdd && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <input style={{ ...inputSt, fontSize:16, fontWeight:500, border:'none', background:'transparent', padding:0 }} value={current.title} onChange={e=>update(current.id,'title',e.target.value)} />
              <Btn small danger onClick={()=>del(current.id)}>Delete</Btn>
            </div>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <Badge color={TYPE_COLORS[current.type]}>{current.type}</Badge>
              <Badge color="blue">{current.station}</Badge>
            </div>
            <textarea style={{ ...inputSt, minHeight:300, fontFamily:'inherit', lineHeight:1.6 }} value={current.content} onChange={e=>update(current.id,'content',e.target.value)} />
          </div>
        )}

        {!current && !showAdd && (
          <div style={{ ...card, textAlign:'center', color:C.muted, padding:40 }}>Select an entry from the left, or create a new one.</div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: FOOD COST REPORTING
// ════════════════════════════════════════════════════════════════════════════

function Reports() {
  const { ingredients, recipes, waste, inventory, weeklyEntries } = useStore();

  const [rangeStart, setRangeStart] = useState(mondayOf());
  const [rangeEnd, setRangeEnd] = useState(() => {
    const d = new Date(mondayOf()); d.setDate(d.getDate()+6); return d.toISOString().split('T')[0];
  });

  const onRangeChange = (s: string, e: string) => { setRangeStart(s); setRangeEnd(e); };

  const entriesInRange = weeklyEntries.filter(w => w.weekStart >= mondayOf(rangeStart) && w.weekStart <= rangeEnd);
  const totalSales   = entriesInRange.reduce((s,w) => s + (parseFloat(w.weeklySales||'0')||0), 0);
  const totalSpend   = entriesInRange.reduce((s,w) => s + (parseFloat(w.foodSpend||'0')||0), 0);

  const [beginningInv, setBeginningInv] = useState('');
  const [purchases,    setPurchases]    = useState('');
  const [endingInv,    setEndingInv]    = useState('');

  const cogs = beginningInv && purchases && endingInv
    ? parseFloat(beginningInv) + parseFloat(purchases) - parseFloat(endingInv)
    : null;
  const fc = cogs !== null && totalSales ? (cogs / totalSales) * 100
           : totalSales && totalSpend    ? (totalSpend / totalSales) * 100
           : null;

  const wasteInRange  = waste.filter(w => w.date >= rangeStart && w.date <= rangeEnd);
  const totalWaste    = wasteInRange.reduce((s,w) => s + (parseFloat(w.cost||'0')||0), 0);

  const plates = recipes.filter(r => r.type === 'plate' && r.sellPrice);
  const margins = plates.map(p => {
    const cost = recipeCost(p, ingredients, recipes);
    const sell = parseFloat(p.sellPrice);
    return { name:p.name, fc: foodCostPct(cost.costPerUnit, sell), gp: sell - cost.costPerUnit };
  });
  const worstMargins = [...margins].filter(m=>m.fc!==null).sort((a,b)=>(b.fc||0)-(a.fc||0)).slice(0,10);
  const bestGp       = [...margins].sort((a,b)=>b.gp-a.gp).slice(0,10);

  const priceSpikes = ingredients
    .map(i => ({ name:i.name, pct: priceVariancePct(i.currentCost, i.baselineCost) }))
    .filter(x=>x.pct!==null && x.pct>0)
    .sort((a,b)=>(b.pct||0)-(a.pct||0))
    .slice(0,10);

  const inventoryVariance = inventory.filter(r=>r.theoreticalUsage).map(r=>{
    const actual = parseFloat(r.beginningQty||'0') + parseFloat(r.purchasesQty||'0') - parseFloat(r.endingQty||'0');
    const theo   = parseFloat(r.theoreticalUsage||'0');
    return { name:r.name, variance: actual - theo };
  }).filter(x=>Math.abs(x.variance)>0).sort((a,b)=>Math.abs(b.variance)-Math.abs(a.variance)).slice(0,10);

  const wasteByStation = Array.from(
    wasteInRange.reduce((m,w) => { m.set(w.station, (m.get(w.station)||0)+(parseFloat(w.cost||'0')||0)); return m; }, new Map<string,number>())
  ).sort((a,b)=>b[1]-a[1]);

  // CSV export — builds a comma-separated string and triggers a download
  const exportCSV = () => {
    const rows: string[][] = [
      ['KitchenIQ Report', `${rangeStart} to ${rangeEnd}`],
      [],
      ['WEEKLY SUMMARY'],
      ['Total Sales', `$${totalSales.toFixed(2)}`],
      ['Total Food Spend', `$${totalSpend.toFixed(2)}`],
      ['Food Cost %', fc !== null ? `${fc.toFixed(1)}%` : 'N/A'],
      ['Waste in Period', `$${totalWaste.toFixed(2)}`],
      [],
      ['WASTE DETAIL', 'Date', 'Item', 'Reason', 'Station', 'Cost'],
      ...wasteInRange.map(w => ['', w.date, w.item, w.reason, w.station, w.cost ? `$${parseFloat(w.cost).toFixed(2)}` : '']),
      [],
      ['TOP MARGIN PROBLEMS', 'Food Cost %'],
      ...worstMargins.map(m => [m.name, `${m.fc!.toFixed(1)}%`]),
      [],
      ['BEST GROSS PROFIT', 'Gross Profit'],
      ...bestGp.map(m => [m.name, `$${m.gp.toFixed(2)}`]),
      [],
      ['PRICE SPIKES', 'Change %'],
      ...priceSpikes.map(p => [p.name, `+${p.pct!.toFixed(1)}%`]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `KitchenIQ_Report_${rangeStart}_to_${rangeEnd}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div>
      {/* Export / Print actions */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <Btn onClick={exportCSV}>↓ Export CSV</Btn>
        <Btn onClick={printReport}>🖨 Print report</Btn>
      </div>

      {/* Date range picker */}
      <div style={{ ...card, border:`1px solid ${C.amber}`, marginBottom:14 }}>
        <div style={sectionTitle}>Report period</div>
        <DateRangePicker start={rangeStart} end={rangeEnd} onChange={onRangeChange} />
        {entriesInRange.length > 0 && (
          <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>
            {entriesInRange.length} week{entriesInRange.length!==1?'s':''} of data found in this range
          </div>
        )}
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Total sales</div>
          <div style={{ fontSize:22, fontFamily:C.mono, color:totalSales?C.emerald:C.muted }}>{totalSales?`$${totalSales.toFixed(2)}`:'Enter on dashboard'}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Total food spend</div>
          <div style={{ fontSize:22, fontFamily:C.mono, color:totalSpend?C.amber:C.muted }}>{totalSpend?`$${totalSpend.toFixed(2)}`:'—'}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Food cost %</div>
          <div style={{ fontSize:22, fontFamily:C.mono, color:fc===null?C.muted:fc>31?C.red:fc>29?C.amber:C.emerald }}>{fc!==null?`${fc.toFixed(1)}%`:'—'}</div>
        </div>
        <div style={{ ...card, marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:0.8, marginBottom:5 }}>Waste in period</div>
          <div style={{ fontSize:22, fontFamily:C.mono, color:totalWaste>0?C.red:C.muted }}>${totalWaste.toFixed(2)}</div>
        </div>
      </div>

      {/* COGS override — for when you have actual inventory numbers */}
      <div style={{ ...card, marginBottom:14 }}>
        <div style={sectionTitle}>COGS calculation — override with actual inventory counts</div>
        <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>If you have beginning/ending inventory dollar values, enter them here for a more accurate food cost %. Otherwise food cost % is calculated from your dashboard sales/spend entries above.</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          <div><span style={label}>Beginning inventory ($)</span><input type="number" style={inputSt} value={beginningInv} onChange={e=>setBeginningInv(e.target.value)} placeholder="0.00" /></div>
          <div><span style={label}>Purchases ($)</span><input type="number" style={inputSt} value={purchases} onChange={e=>setPurchases(e.target.value)} placeholder="0.00" /></div>
          <div><span style={label}>Ending inventory ($)</span><input type="number" style={inputSt} value={endingInv} onChange={e=>setEndingInv(e.target.value)} placeholder="0.00" /></div>
        </div>
        {cogs !== null && (
          <div style={{ marginTop:10, fontSize:12, color:C.text }}>
            COGS: <span style={{ fontFamily:C.mono, color:C.amber }}>${cogs.toFixed(2)}</span>
            {totalSales ? <> &nbsp;·&nbsp; Food cost %: <span style={{ fontFamily:C.mono, color:fc!==null&&fc>31?C.red:C.emerald }}>{(cogs/totalSales*100).toFixed(1)}%</span></> : null}
          </div>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        <div style={card}>
          <div style={sectionTitle}>Top 10 margin problems</div>
          {worstMargins.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No data yet — enter ingredient and sell prices.</div>}
          {worstMargins.map(m=>(<StatRow key={m.name} label={m.name} value={`FC ${m.fc!.toFixed(1)}%`} valueColor={C.red} />))}
        </div>
        <div style={card}>
          <div style={sectionTitle}>Top 10 best gross profit</div>
          {bestGp.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No data yet.</div>}
          {bestGp.map(m=>(<StatRow key={m.name} label={m.name} value={`$${m.gp.toFixed(2)} GP`} valueColor={C.emerald} />))}
        </div>
        <div style={card}>
          <div style={sectionTitle}>Top 10 price spikes</div>
          {priceSpikes.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No price increases recorded yet.</div>}
          {priceSpikes.map(p=>(<StatRow key={p.name} label={p.name} value={`+${p.pct!.toFixed(1)}%`} valueColor={C.red} />))}
        </div>
        <div style={card}>
          <div style={sectionTitle}>Waste by station — {rangeStart} to {rangeEnd}</div>
          {wasteByStation.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No waste logged in this period.</div>}
          {wasteByStation.map(([station,cost])=>(<StatRow key={station} label={station} value={`$${cost.toFixed(2)}`} valueColor={C.red} />))}
        </div>
        <div style={card}>
          <div style={sectionTitle}>Top inventory variances</div>
          {inventoryVariance.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No variance data yet — fill in theoretical usage in Inventory tab.</div>}
          {inventoryVariance.map(v=>(<StatRow key={v.name} label={v.name} value={`${v.variance>0?'+':''}${v.variance.toFixed(1)}`} valueColor={Math.abs(v.variance)>2?C.red:C.amber} />))}
        </div>
        <div style={card}>
          <div style={sectionTitle}>Waste detail — {wasteInRange.length} entries</div>
          {wasteInRange.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No waste entries in this period.</div>}
          {wasteInRange.slice(0,10).map(w=>(
            <StatRow key={w.id} label={`${w.item} (${w.reason})`} value={w.cost?`$${parseFloat(w.cost).toFixed(2)}`:'—'} valueColor={C.red} />
          ))}
          {wasteInRange.length > 10 && <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>+{wasteInRange.length-10} more entries — narrow date range to see all</div>}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE: ROLES & PERMISSIONS
// ════════════════════════════════════════════════════════════════════════════

const MODULES = [
  'Dashboard','Ingredients','Recipe Builder','Plate Costing','Inventory',
  'Waste Tracker','Yield & Butchery','Stations','Vendors','Invoices','Price Optimization',
  'Analytics','Knowledge Base','Reports',
];

const PERMISSIONS: Record<string, string[]> = {
  Owner:             MODULES,
  'Executive Chef':  MODULES,
  'Sous Chef':       ['Dashboard','Recipe Builder','Inventory','Waste Tracker','Yield & Butchery','Stations','Vendors','Knowledge Base'],
  'Kitchen Manager': ['Dashboard','Inventory','Waste Tracker','Stations','Knowledge Base','Reports'],
  'Prep Cook':       ['Recipe Builder','Stations','Knowledge Base'],
  'Line Cook':       ['Stations','Knowledge Base'],
};

function Permissions() {
  const { role, setRole } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const resetAllData = () => {
    Object.keys(localStorage).filter(k => k.startsWith('kiq_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div>
      <div style={{ ...card, border:`1px solid ${C.amber}` }}>
        <div style={sectionTitle}>Current session role (for preview)</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {ROLES.map(r => (
            <button key={r} onClick={()=>setRole(r)} style={{ padding:'7px 14px', borderRadius:6, fontSize:12, cursor:'pointer', border:`1px solid ${role===r?C.amber:C.border}`, background:role===r?C.amber:'transparent', color:role===r?'#0F1623':C.muted, fontWeight:role===r?600:400 }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>Switch roles to preview how the sidebar changes for each position. In a production build this would be tied to real user logins.</div>
      </div>

      <div style={{ ...card, border:`1px solid ${C.border}` }}>
        <div style={sectionTitle}>Data persistence</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12, lineHeight:1.6 }}>
          All your data is automatically saved to this browser's localStorage as you work — ingredients, recipes, invoices, waste logs, vendors, and weekly entries all persist through page refreshes. Data is stored locally in this browser only.
        </div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>
          To back up your data: open the browser console and run <code style={{ background:C.navy, padding:'1px 5px', borderRadius:3, fontSize:11, fontFamily:C.mono }}>JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])={'>'} k.startsWith('kiq_'))))</code> and copy the output.
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {!confirmReset ? (
            <Btn danger onClick={()=>setConfirmReset(true)}>Reset all data to seed defaults</Btn>
          ) : (
            <>
              <span style={{ fontSize:12, color:C.red }}>This will erase all your data permanently. Are you sure?</span>
              <Btn danger onClick={resetAllData}>Yes, reset everything</Btn>
              <Btn onClick={()=>setConfirmReset(false)}>Cancel</Btn>
            </>
          )}
        </div>
      </div>      <div style={card}>
        <div style={sectionTitle}>Permission matrix</div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Module</th>
                {ROLES.map(r => <th key={r} style={{ ...th, textAlign:'center' }}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <tr key={mod}>
                  <td style={{ ...td, fontWeight:500, color:C.text }}>{mod}</td>
                  {ROLES.map(r => (
                    <td key={r} style={{ ...td, textAlign:'center' }}>
                      {PERMISSIONS[r].includes(mod) ? <Badge color="green">✓</Badge> : <span style={{ color:C.dim }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT APP — navigation shell, role filtering, page routing
// ════════════════════════════════════════════════════════════════════════════

type PageId = 'dashboard'|'ingredients'|'recipes'|'platecost'|'inventory'|'waste'|'yield'|'stations'|'vendors'|'invoices'|'priceopt'|'analytics'|'knowledge'|'reports'|'permissions';

const NAV: { section:string; items:{ id:PageId; label:string; module:string }[] }[] = [
  { section:'Overview', items:[
    { id:'dashboard', label:'Dashboard', module:'Dashboard' },
    { id:'analytics', label:'KPI Analytics', module:'Analytics' },
  ]},
  { section:'Food Cost', items:[
    { id:'ingredients', label:'Ingredients', module:'Ingredients' },
    { id:'recipes', label:'Recipe Builder', module:'Recipe Builder' },
    { id:'platecost', label:'Plate Costing', module:'Plate Costing' },
    { id:'yield', label:'Yield & Butchery', module:'Yield & Butchery' },
    { id:'priceopt', label:'Price Optimization', module:'Price Optimization' },
  ]},
  { section:'Operations', items:[
    { id:'inventory', label:'Inventory', module:'Inventory' },
    { id:'waste', label:'Waste Tracker', module:'Waste Tracker' },
    { id:'stations', label:'Stations', module:'Stations' },
  ]},
  { section:'Intelligence', items:[
    { id:'vendors', label:'Vendors', module:'Vendors' },
    { id:'invoices', label:'Invoices', module:'Invoices' },
    { id:'reports', label:'Reports', module:'Reports' },
    { id:'knowledge', label:'Knowledge Base', module:'Knowledge Base' },
  ]},
  { section:'Admin', items:[
    { id:'permissions', label:'Roles & Permissions', module:'Permissions' },
  ]},
];

const TITLES: Record<PageId,string> = {
  dashboard:'Executive Kitchen Dashboard', ingredients:'Ingredient Intelligence Database',
  recipes:'Recipe Builder', platecost:'Plate Costing System', inventory:'Inventory Control',
  waste:'Waste & Profit Leak Tracker', yield:'Yield & Butchery System', stations:'Station Dashboards',
  vendors:'Vendor Master List', invoices:'Invoice Processing & Cost Intelligence', priceopt:'Menu Price Optimization Engine',
  analytics:'Kitchen KPI & Analytics Engine', knowledge:'Culinary Knowledge & SOP System',
  reports:'Food Cost Reporting', permissions:'Roles & Permissions',
};

const PAGES: Record<PageId, () => ReactNode> = {
  dashboard:Dashboard, ingredients:IngredientsPage, recipes:RecipeBuilder, platecost:PlateCosting,
  inventory:InventoryPage, waste:WasteTracker, yield:YieldButchery, stations:Stations,
  vendors:VendorsPage, invoices:Invoices, priceopt:PriceOptimization, analytics:Analytics,
  knowledge:KnowledgeBase, reports:Reports, permissions:Permissions,
};

function Shell() {
  const [page, setPage] = useState<PageId>('dashboard');
  const { role } = useStore();
  const allowedModules = PERMISSIONS[role] || [];
  const PageComponent = PAGES[page];
  const currentModule = NAV.flatMap(g=>g.items).find(i=>i.id===page)?.module || '';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:C.navy, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <aside style={{ width:220, background:C.panel, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>
        <div style={{ padding:'14px 14px 12px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:16, fontWeight:700 }}>🍽 Kitchen<span style={{ color:C.amber }}>IQ</span></div>
          <div style={{ fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:1.5, marginTop:2 }}>Kitchen Operating System</div>
        </div>
        <nav style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {NAV.map(group => {
            const visibleItems = group.items.filter(item => allowedModules.includes(item.module));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.section}>
                <div style={{ padding:'12px 12px 4px', fontSize:9, color:C.dim, textTransform:'uppercase', letterSpacing:1.5 }}>{group.section}</div>
                {visibleItems.map(item => (
                  <div key={item.id} onClick={()=>setPage(item.id)} style={{ padding:'8px 12px', cursor:'pointer', borderLeft:`2px solid ${page===item.id?C.amber:'transparent'}`, background:page===item.id?'rgba(245,158,11,0.08)':'transparent' }}>
                    <div style={{ fontSize:13, color:page===item.id?C.text:C.muted }}>{item.label}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${C.border}`, fontSize:10, color:C.dim }}>
          Logged in as<br /><span style={{ color:C.amber }}>{role}</span>
        </div>
      </aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, padding:'0 20px', height:50, display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <span style={{ fontSize:14, fontWeight:500, flex:1 }}>{TITLES[page]}</span>
          <Badge color="blue">{role}</Badge>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', background:C.navy }}>
          {allowedModules.includes(currentModule)
            ? <PageComponent />
            : <div style={{ color:C.muted, padding:40, textAlign:'center' }}>You don't have access to this module in the {role} role.</div>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
