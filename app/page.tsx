'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Cat {
  id: string;
  name: string;
  age?: string;
  color?: string;
  weight?: number;
  last_bath_date?: string;
  needs_medication?: boolean;
  medication_note?: string;
}

interface LitterInfo {
  id?: string;
  bags_left: number;
  box_count: number;
  last_changed: string;
}

// ตัวเลือกสีแมวและชุดสีสำหรับแสดงผล UI
const COLOR_OPTIONS = [
  { label: 'ส้ม 🍊', value: 'ส้ม', bg: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  { label: 'ดำ 🖤', value: 'ดำ', bg: 'bg-slate-800 text-white', badge: 'bg-slate-800 text-white' },
  { label: 'ขาว 🤍', value: 'ขาว', bg: 'bg-slate-100 border border-slate-300', badge: 'bg-slate-200 text-slate-700' },
  { label: 'เทา 🩶', value: 'เทา', bg: 'bg-slate-400', badge: 'bg-slate-300 text-slate-800' },
  { label: 'สามสี/เปรอะ 🎨', value: 'สามสี', bg: 'bg-amber-600 text-white', badge: 'bg-amber-100 text-amber-800' },
  { label: 'น้ำตาล 🐻', value: 'น้ำตาล', bg: 'bg-amber-800 text-white', badge: 'bg-amber-200 text-amber-900' },
];

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [litter, setLitter] = useState<LitterInfo>({ bags_left: 0, box_count: 0, last_changed: '' });
  
  // State สำหรับ Modal แก้ไข
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State เพิ่มแมว
  const [catName, setCatName] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('ส้ม');
  const [weight, setWeight] = useState('');
  const [lastBathDate, setLastBathDate] = useState('');
  const [needsMedication, setNeedsMedication] = useState(false);
  const [medicationNote, setMedicationNote] = useState('');

  const quotes = [
    'มนุษย์! ข้าวหมดยัง! หิวจนจะกินบ้านแล้วนะ!',
    'ทรายแมวตักหรือยัง! โวยวายนะ!',
    'อย่านั่งเฉยๆ ป้อนขนมเลียด่วนเลย!',
    'อย่าลืมเช็กแมวป่วยและตักกระบะทรายด้วย!',
  ];
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    const { data: catData } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
    setCats(catData || []);

    const { data: litterData } = await supabase.from('cat_litter').select('*').limit(1).single();
    if (litterData) setLitter(litterData);
  }

  // เพิ่มแมวใหม่
  async function handleAddCat(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return alert('กรอกชื่อน้องแมวด้วยครับ');

    const { error } = await supabase.from('cats').insert([{
      name: catName.trim(),
      age: age.trim() || 'ไม่ระบุอายุ',
      color: color || 'ส้ม',
      weight: weight ? parseFloat(weight) : 0,
      last_bath_date: lastBathDate || null,
      needs_medication: needsMedication,
      medication_note: needsMedication ? medicationNote : '',
    }]);

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
      setCatName('');
      setAge('');
      setColor('ส้ม');
      setWeight('');
      setLastBathDate('');
      setNeedsMedication(false);
      setMedicationNote('');
      loadAllData();
    }
  }

  // อัปเดตข้อมูลแมว
  async function handleUpdateCat() {
    if (!selectedCat) return;

    const { error } = await supabase.from('cats').update({
      name: selectedCat.name,
      age: selectedCat.age,
      color: selectedCat.color,
      weight: selectedCat.weight,
      last_bath_date: selectedCat.last_bath_date,
      needs_medication: selectedCat.needs_medication,
      medication_note: selectedCat.needs_medication ? selectedCat.medication_note : '',
    }).eq('id', selectedCat.id);

    if (error) {
      alert('อัปเดตไม่สำเร็จ: ' + error.message);
    } else {
      setSelectedCat(null);
      setIsEditing(false);
      loadAllData();
    }
  }

  // อัปเดตทรายแมว
  async function updateLitter(newBags: number, newBoxes: number, newDate?: string) {
    const updatedData = {
      bags_left: Math.max(0, newBags),
      box_count: Math.max(0, newBoxes),
      last_changed: newDate || litter.last_changed || new Date().toISOString().split('T')[0],
    };
    setLitter(updatedData);

    if (litter.id) {
      await supabase.from('cat_litter').update(updatedData).eq('id', litter.id);
    } else {
      const { data } = await supabase.from('cat_litter').insert([updatedData]).select().single();
      if (data) setLitter(data);
    }
  }

  const getColorStyle = (catColor?: string) => {
    return COLOR_OPTIONS.find(c => c.value === catColor) || COLOR_OPTIONS[0];
  };

  return (
    <main className="min-h-screen bg-amber-50/60 p-4 sm:p-8 font-sans">
      {/* CSS Animation สำหรับฉากและแมวเดิน */}
      <style jsx global>{`
        /* ท่าทางแมวเดิน (ซ้าย-ขวา + จังหวะก้าวโยกขึ้นลง) */
        @keyframes catWalk {
          0% { transform: translateX(0px) scaleX(1) translateY(0px); }
          15% { transform: translateX(50px) scaleX(1) translateY(-4px); }
          30% { transform: translateX(110px) scaleX(1) translateY(0px); }
          45% { transform: translateX(180px) scaleX(1) translateY(-4px); }
          50% { transform: translateX(200px) scaleX(-1) translateY(0px); } /* Turn Left */
          65% { transform: translateX(150px) scaleX(-1) translateY(-4px); }
          80% { transform: translateX(80px) scaleX(-1) translateY(0px); }
          95% { transform: translateX(10px) scaleX(-1) translateY(-4px); }
          100% { transform: translateX(0px) scaleX(1) translateY(0px); }
        }

        /* เด้งเบาๆ ตอนอยู่นิ่ง */
        @keyframes catBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .animate-cat-walk {
          animation: catWalk 12s infinite ease-in-out;
        }

        .animate-cat-bob {
          animation: catBob 1.5s infinite ease-in-out;
        }

        /* ลายพื้นหลังห้องแมว (Wallpaper พาสเทล + ลายไม้) */
        .cat-room-wallpaper {
          background-color: #fef3c7;
          background-image: repeating-linear-gradient(45deg, #fde68a 0, #fde68a 10px, #fef3c7 0, #fef3c7 20px);
        }

        .wood-floor {
          background: #d97706;
          background-image: linear-gradient(90deg, rgba(255,255,255,.07) 50%, transparent 50%);
          background-size: 30px 100%;
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header & มาสคอตแมวส้ม */}
        <header className="bg-amber-500 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div 
              onClick={() => setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])}
              className="w-20 h-20 bg-orange-100 border-4 border-orange-300 rounded-full flex justify-center items-center text-4xl shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
            >
              🐱
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-wide">MAWE BAAN</h1>
              <div className="bg-white/20 backdrop-blur-xs p-2 rounded-xl text-xs font-medium border border-white/30 text-amber-950">
                💬 <b>พี่ส้ม:</b> "{currentQuote}"
              </div>
            </div>
          </div>
        </header>

        {/* 🏠 บ้านแมวจำลอง (Cat Village Playground) พร้อมพื้นหลัง & Animation แมวเดิน */}
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-orange-200 space-y-2">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-extrabold text-amber-900 flex items-center gap-1.5">
              🏡 บ้านแมวอบอุ่น (สมาชิก {cats.length} ตัว)
            </h2>
            <span className="text-[10px] bg-amber-100 px-2.5 py-0.5 rounded-full font-bold text-amber-800 border border-amber-300">
              🐾 Live Playroom
            </span>
          </div>

          {/* กรอบห้องแมวจำลอง */}
          <div className="relative h-44 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-inner flex flex-col justify-between cat-room-wallpaper">
            
            {/* ตกแต่งวอลเปเปอร์ห้อง (หน้าต่าง + รูปภาพแขวน) */}
            <div className="flex justify-between items-start p-3 opacity-90">
              {/* หน้าต่างมองเห็นท้องฟ้า */}
              <div className="w-16 h-12 bg-sky-200 border-2 border-amber-800 rounded-t-full shadow-xs flex justify-center items-center relative overflow-hidden">
                <span className="text-[10px] absolute top-1 left-1">☁️</span>
                <span className="text-[10px] absolute top-2 right-1">☁️</span>
                <div className="w-full h-0.5 bg-amber-800 absolute"></div>
                <div className="h-full w-0.5 bg-amber-800 absolute"></div>
              </div>

              {/* กรอบรูปน้องแมว */}
              <div className="w-10 h-10 bg-amber-100 border-2 border-amber-800 rounded-lg shadow-xs flex justify-center items-center text-sm">
                🖼️
              </div>

              {/* ต้นไม้ตกแต่งห้อง */}
              <div className="text-2xl">🪴</div>
            </div>

            {/* เฟอร์นิเจอร์แมวบนพื้น (คอนโดแมว จานข้าว ไหมพรม) */}
            <div className="absolute bottom-6 left-3 right-3 flex justify-between items-end pointer-events-none opacity-80">
              <span className="text-3xl">🏰</span> {/* คอนโดแมว */}
              <div className="flex gap-2">
                <span className="text-xl">🥣</span> {/* ชามอาหาร */}
                <span className="text-xl">🧶</span> {/* ไหมพรม */}
              </div>
            </div>

            {/* แมวเดินไปเดินมาบนพื้นไม้ */}
            <div className="relative h-10 wood-floor border-t-4 border-amber-800 flex items-center">
              {cats.length === 0 ? (
                <p className="text-xs text-white/90 w-full text-center font-bold drop-shadow-xs">
                  ยังไม่มีน้องแมววิ่งเล่นในบ้าน ลองกรอกเพิ่มประวัติแมวด้านล่างได้เลย! 🐾
                </p>
              ) : (
                cats.map((cat, index) => {
                  const colorStyle = getColorStyle(cat.color);
                  return (
                    <div
                      key={cat.id}
                      className="absolute bottom-2 left-2 animate-cat-walk transition-all z-10"
                      style={{
                        animationDuration: `${8 + (index % 3) * 3}s`,
                        animationDelay: `${index * 1.5}s`,
                      }}
                    >
                      <div 
                        className="flex flex-col items-center group cursor-pointer"
                        onClick={() => { setSelectedCat(cat); setIsEditing(false); }}
                      >
                        {/* ป้ายชื่อแมว */}
                        <span className="text-[9px] bg-white/95 text-slate-800 font-bold px-1.5 py-0.5 rounded-full shadow-md mb-0.5 border border-amber-300 truncate max-w-[70px]">
                          {cat.name}
                        </span>

                        {/* ตัวแมวพร้อมเงา */}
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-full ${colorStyle.bg} flex justify-center items-center text-base shadow-md border-2 border-white animate-cat-bob`}>
                            🐱
                          </div>
                          {/* เงาใต้แมว */}
                          <div className="w-6 h-1.5 bg-black/20 rounded-full mx-auto -mt-0.5 blur-[1px]"></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </section>

        {/* 📦 สต็อกทรายแมว & กระบะทราย */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 space-y-3">
          <h2 className="text-base font-extrabold text-slate-800">📦 สต็อกทรายแมว & กระบะทราย</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-amber-800">ทรายคงเหลือ</p>
                <p className="text-xl font-black text-amber-900">{litter.bags_left} ถุง</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateLitter(litter.bags_left - 1, litter.box_count)} className="w-7 h-7 bg-white rounded-lg border font-bold text-slate-600 cursor-pointer hover:bg-slate-50">-</button>
                <button onClick={() => updateLitter(litter.bags_left + 1, litter.box_count)} className="w-7 h-7 bg-amber-500 rounded-lg text-white font-bold cursor-pointer hover:bg-amber-600">+</button>
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-orange-800">กระบะทราย</p>
                <p className="text-xl font-black text-orange-900">{litter.box_count} ใบ</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => updateLitter(litter.bags_left, litter.box_count - 1)} className="w-7 h-7 bg-white rounded-lg border font-bold text-slate-600 cursor-pointer hover:bg-slate-50">-</button>
                <button onClick={() => updateLitter(litter.bags_left, litter.box_count + 1)} className="w-7 h-7 bg-orange-500 rounded-lg text-white font-bold cursor-pointer hover:bg-orange-600">+</button>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex flex-col justify-between">
              <p className="text-xs font-bold text-stone-600">เปลี่ยนทรายล่าสุด: <span className="text-amber-800">{litter.last_changed || '-'}</span></p>
              <button 
                onClick={() => updateLitter(litter.bags_left, litter.box_count, new Date().toISOString().split('T')[0])}
                className="mt-2 text-xs bg-stone-800 text-white font-bold py-1.5 px-3 rounded-xl hover:bg-black cursor-pointer transition"
              >
                🧹 เปลี่ยนทรายวันนี้
              </button>
            </div>
          </div>
        </section>

        {/* 🐾 รายชื่อแมวในระบบ */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
          <h2 className="text-base font-extrabold text-slate-800 mb-3">🐾 รายชื่อสมาชิกแมว ({cats.length} ตัว)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cats.map((c) => {
              const colorStyle = getColorStyle(c.color);
              return (
                <div 
                  key={c.id} 
                  onClick={() => { setSelectedCat(c); setIsEditing(false); }}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-amber-50/30 hover:border-amber-300 cursor-pointer transition space-y-2 relative"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorStyle.badge}`}>
                          สี{c.color || 'ส้ม'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">🎂 อายุ: {c.age || 'ไม่ระบุ'}</p>
                      <p className="text-[11px] text-slate-500">⚖️ น้ำหนัก: {c.weight || '-'} kg</p>
                      <p className="text-[11px] text-slate-500">🛁 อาบน้ำล่าสุด: {c.last_bath_date || '-'}</p>
                    </div>
                    <span className="text-xs text-amber-500 font-bold">คลิกดู ➔</span>
                  </div>

                  {c.needs_medication && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-2 rounded-xl text-[11px] font-bold flex items-center gap-1">
                      <span>💊 ต้องกินยา:</span>
                      <span className="font-normal truncate">{c.medication_note || 'ระบุยาทาน'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ➕ ฟอร์มเพิ่มประวัติน้องแมว (อยู่ด้านล่างสุด) */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
          <h2 className="text-base font-extrabold text-slate-800 mb-3">➕ เพิ่มประวัติน้องแมว</h2>
          <form onSubmit={handleAddCat} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text" placeholder="ชื่อน้องแมว *" value={catName} onChange={(e) => setCatName(e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400" required
              />
              <input
                type="text" placeholder="อายุ (เช่น 1 ปี 4 เดือน)" value={age} onChange={(e) => setAge(e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">สีของแมว</label>
                <select 
                  value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {COLOR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">น้ำหนัก (kg)</label>
                <input
                  type="number" step="0.1" placeholder="เช่น 3.5" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">วันที่อาบน้ำล่าสุด</label>
                <input
                  type="date" value={lastBathDate} onChange={(e) => setLastBathDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={needsMedication} onChange={(e) => setNeedsMedication(e.target.checked)} className="w-4 h-4 text-amber-500 rounded" />
                <span className="text-xs font-bold text-slate-700">แมวป่วย / ต้องกินยาช่วงนี้</span>
              </label>
              {needsMedication && (
                <input
                  type="text" placeholder="ระบุชื่อยา / รายละเอียดเวลาทานยา" value={medicationNote} onChange={(e) => setMedicationNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              )}
            </div>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-xs shadow-sm cursor-pointer transition">
              บันทึกข้อมูลน้องแมว
            </button>
          </form>
        </section>

        {/* Modal ดู & แก้ไขข้อมูลแมว */}
        {selectedCat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-800 text-sm">
                  {isEditing ? '✏️ แก้ไขข้อมูลน้องแมว' : '🐱 รายละเอียดโปรไฟล์'}
                </h3>
                <button onClick={() => setSelectedCat(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
              </div>

              {!isEditing ? (
                <div className="space-y-3 text-xs">
                  <p className="text-base font-extrabold text-amber-900">{selectedCat.name}</p>
                  <p className="text-slate-600"><b>🎨 สี:</b> สี{selectedCat.color || 'ส้ม'}</p>
                  <p className="text-slate-600"><b>🎂 อายุ:</b> {selectedCat.age || 'ไม่ระบุ'}</p>
                  <p className="text-slate-600"><b>⚖️ น้ำหนัก:</b> {selectedCat.weight || '-'} kg</p>
                  <p className="text-slate-600"><b>🛁 อาบน้ำล่าสุด:</b> {selectedCat.last_bath_date || '-'}</p>
                  <p className="text-slate-600">
                    <b>💊 สถานะกินยา:</b> {selectedCat.needs_medication ? (
                      <span className="text-red-600 font-bold">ต้องกินยา ({selectedCat.medication_note})</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">ปกติดี</span>
                    )}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setIsEditing(true)} className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600">
                      แก้ไขข้อมูล
                    </button>
                    <button onClick={() => setSelectedCat(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl hover:bg-slate-200">
                      ปิด
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <label className="block font-bold">ชื่อแมว</label>
                  <input type="text" value={selectedCat.name} onChange={(e) => setSelectedCat({...selectedCat, name: e.target.value})} className="w-full p-2 border rounded-xl" />

                  <label className="block font-bold">สีแมว</label>
                  <select 
                    value={selectedCat.color || 'ส้ม'} onChange={(e) => setSelectedCat({...selectedCat, color: e.target.value})}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <label className="block font-bold">อายุ (เช่น 1 ปี 4 เดือน)</label>
                  <input type="text" value={selectedCat.age || ''} onChange={(e) => setSelectedCat({...selectedCat, age: e.target.value})} className="w-full p-2 border rounded-xl" />

                  <label className="block font-bold">น้ำหนัก (kg)</label>
                  <input type="number" step="0.1" value={selectedCat.weight || ''} onChange={(e) => setSelectedCat({...selectedCat, weight: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-xl" />

                  <label className="block font-bold">วันที่อาบน้ำล่าสุด</label>
                  <input type="date" value={selectedCat.last_bath_date || ''} onChange={(e) => setSelectedCat({...selectedCat, last_bath_date: e.target.value})} className="w-full p-2 border rounded-xl" />

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input type="checkbox" checked={selectedCat.needs_medication || false} onChange={(e) => setSelectedCat({...selectedCat, needs_medication: e.target.checked})} />
                    <span className="font-bold text-red-600">ป่วย / ต้องกินยา</span>
                  </label>

                  {selectedCat.needs_medication && (
                    <input type="text" placeholder="รายละเอียดยา" value={selectedCat.medication_note || ''} onChange={(e) => setSelectedCat({...selectedCat, medication_note: e.target.value})} className="w-full p-2 border rounded-xl" />
                  )}

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleUpdateCat} className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600">
                      บันทึก
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}