'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // ใช้ Supabase Server Client

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

const COLOR_OPTIONS = [
  { label: 'สลิด 🐯', value: 'สลิด', main: '#a1a1aa', secondary: '#3f3f46', ears: '#e4e4e7', badge: 'bg-zinc-200 text-zinc-800' },
  { label: 'ส้ม 🍊', value: 'ส้ม', main: '#f97316', secondary: '#ea580c', ears: '#fdba74', badge: 'bg-orange-100 text-orange-700' },
  { label: 'วิเชียรมาศ 💎', value: 'วิเชียรมาศ', main: '#fef3c7', secondary: '#451a03', ears: '#78350f', badge: 'bg-amber-100 text-amber-900 border border-amber-300' },
  { label: 'ทักซิโด้ 🐧', value: 'ทักซิโด้', main: '#1e293b', secondary: '#ffffff', ears: '#475569', badge: 'bg-slate-900 text-white' },
  { label: 'เปรอะ 🍂', value: 'เปรอะ', main: '#451a03', secondary: '#ea580c', ears: '#b45309', badge: 'bg-stone-800 text-amber-200' },
  { label: 'ลายวัว 🐮', value: 'ลายวัว', main: '#f8fafc', secondary: '#0f172a', ears: '#cbd5e1', badge: 'bg-slate-100 text-slate-800 border border-slate-300' },
  { label: 'ดำ 🖤', value: 'ดำ', main: '#1e293b', secondary: '#0f172a', ears: '#475569', badge: 'bg-slate-800 text-white' },
  { label: 'ขาว 🤍', value: 'ขาว', main: '#f8fafc', secondary: '#e2e8f0', ears: '#fbcfe8', badge: 'bg-slate-200 text-slate-700' },
  { label: 'เทา 🩶', value: 'เทา', main: '#64748b', secondary: '#475569', ears: '#cbd5e1', badge: 'bg-slate-300 text-slate-800' },
  { label: 'สามสี 🎨', value: 'สามสี', main: '#f97316', secondary: '#1e293b', ears: '#fbcfe8', badge: 'bg-amber-100 text-amber-800' },
  { label: 'น้ำตาล 🐻', value: 'น้ำตาล', main: '#78350f', secondary: '#451a03', ears: '#fde68a', badge: 'bg-amber-200 text-amber-900' },
];

const CAT_THOUGHTS = [
  'หิวขนมเลียจัง... 🥩',
  'มองไรมนุษย์! 😼',
  'ง่วงนอนแล้ว zZZ.. 😴',
  'ขอดมตูดหน่อย 🐱',
  'ตักทรายหรือยัง! 🧹',
  'วิ่งแข่งกันไหม! 💨',
  'ขอตากแดดแป๊บ ☀️',
];

// 1. เพิ่ม import ด้านบนสุดของไฟล์ app/page.ts
// 🎨 SVG Cat Drawing Component
function CatVector({ colorName }: { colorName?: string }) {
  const colorObj = COLOR_OPTIONS.find(c => c.value === colorName) || COLOR_OPTIONS[0];
  const eyeColor = colorName === 'วิเชียรมาศ' ? '#0284c7' : '#000000';

  return (
    <svg width="46" height="46" viewBox="0 0 100 100" className="drop-shadow-md">
      {/* หาง */}
      <path d="M 20 65 Q 5 50 12 35 Q 18 30 18 45 Q 12 55 25 65 Z" fill={colorName === 'วิเชียรมาศ' ? '#451a03' : colorObj.secondary} />
      
      {/* ลำตัว */}
      <ellipse cx="50" cy="65" rx="28" ry="22" fill={colorObj.main} />

      {/* ลายสลิด */}
      {colorName === 'สลิด' && (
        <>
          <path d="M 11 41 L 16 43" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 13 47 L 18 49" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 15 54 L 21 55" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 30 54 Q 32 62 29 68" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 37 50 Q 40 61 36 71" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 44 48 Q 47 62 43 72" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 51 48 Q 54 62 50 72" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 58 50 Q 61 61 57 71" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 65 54 Q 67 62 64 68" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {colorName === 'ทักซิโด้' && <path d="M 42 54 Q 50 50 58 54 Q 55 76 50 78 Q 45 76 42 54 Z" fill="#ffffff" />}
      {colorName === 'ลายวัว' && (
        <>
          <ellipse cx="38" cy="60" rx="8" ry="6" fill="#0f172a" />
          <ellipse cx="62" cy="68" rx="6" ry="8" fill="#0f172a" />
        </>
      )}
      {colorName === 'สามสี' && (
        <>
          <path d="M 35 50 Q 42 45 48 55 Q 40 70 32 60 Z" fill="#1e293b" />
          <path d="M 55 52 Q 65 48 68 62 Q 58 72 52 65 Z" fill="#ffffff" />
        </>
      )}
      {colorName === 'เปรอะ' && (
        <>
          <path d="M 35 52 Q 42 48 46 58 Q 38 70 32 62 Z" fill="#f97316" />
          <path d="M 54 50 Q 64 46 66 60 Q 56 70 50 63 Z" fill="#ea580c" />
        </>
      )}
      {(colorName === 'ส้ม' || colorName === 'เทา' || colorName === 'น้ำตาล') && (
        <>
          <path d="M 40 50 L 43 58 L 38 62" stroke={colorObj.secondary} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 50 48 L 52 56 L 48 60" stroke={colorObj.secondary} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 60 50 L 62 58 L 57 62" stroke={colorObj.secondary} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* 🎀 ปลอกคอสีแดง + กระดิ่งสีทอง */}
      <path d="M 36 51 Q 50 55 64 51" stroke="#ef4444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="50" cy="54" r="3" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />

      {/* หัวแมว */}
      <circle cx="50" cy="40" r="22" fill={colorObj.main} />

      {colorName === 'วิเชียรมาศ' && <ellipse cx="50" cy="43" rx="14" ry="11" fill="#451a03" />}
      {colorName === 'ทักซิโด้' && <ellipse cx="50" cy="46" rx="8" ry="6" fill="#ffffff" />}

      {colorName === 'สลิด' && (
        <>
          <path d="M 39 23 L 44 29 L 50 23 L 56 29 L 61 23" stroke="#27272a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 31 35 L 25 37 M 30 40 L 24 43" stroke="#27272a" strokeWidth="2" strokeLinecap="round" />
          <path d="M 69 35 L 75 37 M 70 40 L 76 43" stroke="#27272a" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* หู */}
      <polygon points="32,25 24,5 42,18" fill={colorName === 'วิเชียรมาศ' ? '#451a03' : colorObj.main} />
      <polygon points="34,23 27,8 40,18" fill={colorObj.ears} />
      <polygon points="68,25 76,5 58,18" fill={colorName === 'วิเชียรมาศ' ? '#451a03' : colorObj.main} />
      <polygon points="66,23 73,8 60,18" fill={colorObj.ears} />

      {/* ตา */}
      <ellipse cx="41" cy="38" rx="3.5" ry="5" fill={eyeColor} />
      <ellipse cx="59" cy="38" rx="3.5" ry="5" fill={eyeColor} />
      <circle cx="42" cy="36" r="1.5" fill="#fff" />
      <circle cx="60" cy="36" r="1.5" fill="#fff" />

      {/* 🌸 แก้มอมชมพู */}
      <circle cx="34" cy="43" rx="3" ry="2" fill="#f472b6" opacity="0.55" />
      <circle cx="66" cy="43" rx="3" ry="2" fill="#f472b6" opacity="0.55" />

      {/* จมูกและปาก */}
      <polygon points="50,44 47,42 53,42" fill={colorName === 'วิเชียรมาศ' ? '#271202' : '#f472b6'} />
      <path d="M 47 46 Q 50 49 50 46 Q 50 49 53 46" stroke={colorName === 'วิเชียรมาศ' || colorName === 'ทักซิโด้' ? '#cbd5e1' : '#334155'} strokeWidth="2" fill="none" />

      {/* หนวด */}
      <line x1="25" y1="40" x2="40" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="23" y1="46" x2="39" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="75" y1="40" x2="60" y2="42" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="77" y1="46" x2="61" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [litter, setLitter] = useState<LitterInfo>({ bags_left: 0, box_count: 0, last_changed: '' });
  const [isSavingLitter, setIsSavingLitter] = useState(false);
  
  const catsRef = useRef<Cat[]>([]);
  useEffect(() => {
    catsRef.current = cats;
  }, [cats]);

  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeThought, setActiveThought] = useState<{ [key: string]: string }>({});
  const [clickedCatId, setClickedCatId] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(false);

  // Form States
  const [catName, setCatName] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('สลิด');
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
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);

    const interval = setInterval(() => {
      randomizeThoughts();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  function randomizeThoughts() {
    const currentCats = catsRef.current;
    if (currentCats.length === 0) return;
    const randomCat = currentCats[Math.floor(Math.random() * currentCats.length)];
    const randomText = CAT_THOUGHTS[Math.floor(Math.random() * CAT_THOUGHTS.length)];
    
    setActiveThought(prev => ({ ...prev, [randomCat.id]: randomText }));

    setTimeout(() => {
      setActiveThought(prev => {
        const copy = { ...prev };
        delete copy[randomCat.id];
        return copy;
      });
    }, 3500);
  }

  function playMeowSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.log('Audio error');
    }
  }

  function handleCatClick(cat: Cat) {
    playMeowSound();
    setClickedCatId(cat.id);
    const randomText = CAT_THOUGHTS[Math.floor(Math.random() * CAT_THOUGHTS.length)];
    setActiveThought(prev => ({ ...prev, [cat.id]: randomText }));
    setTimeout(() => setClickedCatId(null), 600);
  }

  async function loadAllData() {
    const { data: catData } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
    setCats(catData || []);

    const { data: litterData } = await supabase.from('cat_litter').select('*').limit(1).maybeSingle();
    if (litterData) {
      setLitter({
        id: litterData.id,
        bags_left: litterData.bags_left ?? 0,
        box_count: litterData.box_count ?? 0,
        last_changed: litterData.last_changed || '',
      });
    }
  }

  async function saveLitterToDB(updatedLitter: LitterInfo) {
    setIsSavingLitter(true);
    try {
      if (updatedLitter.id) {
        const { error } = await supabase
          .from('cat_litter')
          .update({
            bags_left: updatedLitter.bags_left,
            box_count: updatedLitter.box_count,
            last_changed: updatedLitter.last_changed,
          })
          .eq('id', updatedLitter.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cat_litter')
          .insert([{
            bags_left: updatedLitter.bags_left,
            box_count: updatedLitter.box_count,
            last_changed: updatedLitter.last_changed,
          }])
          .select()
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setLitter(prev => ({ ...prev, id: data.id }));
        }
      }
    } catch (err: any) {
      console.error('Save Litter Error:', err);
      alert('บันทึกข้อมูลทรายแมวไม่สำเร็จ: ' + (err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'));
      loadAllData();
    } finally {
      setIsSavingLitter(false);
    }
  }

  function handleBagsChange(delta: number) {
    setLitter(prev => {
      const nextBags = Math.max(0, (prev.bags_left ?? 0) + delta);
      const nextLitter = { ...prev, bags_left: nextBags };
      saveLitterToDB(nextLitter);
      return nextLitter;
    });
  }

  function handleBoxesChange(delta: number) {
    setLitter(prev => {
      const nextBoxes = Math.max(0, (prev.box_count ?? 0) + delta);
      const nextLitter = { ...prev, box_count: nextBoxes };
      saveLitterToDB(nextLitter);
      return nextLitter;
    });
  }

  function handleTodayChanged() {
    const today = new Date().toISOString().split('T')[0];
    setLitter(prev => {
      const nextLitter = { ...prev, last_changed: today };
      saveLitterToDB(nextLitter);
      return nextLitter;
    });
  }

  async function handleAddCat(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return alert('กรอกชื่อน้องแมวด้วยครับ');

  const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  alert('กรุณาเข้าสู่ระบบก่อนเพิ่มแมว');
  return;
}

const { error } = await supabase.from('cats').insert([{
  user_id: user.id,
  name: catName.trim(),
  age: age.trim() || 'ไม่ระบุอายุ',
  color: color || 'สลิด',
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
      setColor('สลิด');
      setWeight('');
      setLastBathDate('');
      setNeedsMedication(false);
      setMedicationNote('');
      loadAllData();
    }
  }

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

  const getColorStyle = (catColor?: string) => {
    return COLOR_OPTIONS.find(c => c.value === catColor) || COLOR_OPTIONS[0];
  };

  const getCatScale = (w?: number) => {
    if (!w || w <= 0) return 1;
    if (w < 3) return 0.85;
    if (w > 5) return 1.25;
    return 1.05;
  };

  return (
    <main className={`min-h-screen p-4 sm:p-8 font-sans transition-colors duration-500 ${isNight ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/60 text-slate-800'}`}>
      
      <style jsx global>{`
        @keyframes catWalk {
          0% { transform: translateX(0px) scaleX(1); }
          45% { transform: translateX(210px) scaleX(1); }
          50% { transform: translateX(210px) scaleX(-1); }
          95% { transform: translateX(0px) scaleX(-1); }
          100% { transform: translateX(0px) scaleX(1); }
        }

        @keyframes catJump {
          0% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-22px) scale(1.15); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes floatCloud {
          0% { transform: translateX(-8px); }
          50% { transform: translateX(12px); }
          100% { transform: translateX(-8px); }
        }

        .animate-cloud {
          animation: floatCloud 6s ease-in-out infinite;
        }

        .animate-cat-walk {
          animation: catWalk 11s infinite ease-in-out;
        }

        .animate-jump {
          animation: catJump 0.5s ease-out !important;
        }

        .wallpaper-day {
          background-color: #fefce8;
          background-image: radial-gradient(#fde047 0.75px, transparent 0.75px);
          background-size: 16px 16px;
        }

        .wallpaper-night {
          background-color: #0f172a;
          background-image: radial-gradient(#38bdf8 0.75px, transparent 0.75px);
          background-size: 16px 16px;
        }

        .wood-floor-day {
          background: #eab308;
          background-image: linear-gradient(90deg, rgba(255,255,255,.12) 50%, transparent 50%);
          background-size: 24px 100%;
        }

        .wood-floor-night {
          background: #475569;
          background-image: linear-gradient(90deg, rgba(0,0,0,.2) 50%, transparent 50%);
          background-size: 24px 100%;
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-amber-500 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div 
              onClick={() => { playMeowSound(); setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]); }}
              className="w-20 h-20 bg-orange-100 border-4 border-orange-300 rounded-full flex justify-center items-center text-4xl shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
            >
              🐱
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wide">MAWE BAAN</h1>
                <button 
                  onClick={() => setIsNight(!isNight)}
                  className="text-xs bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-full border border-white/20 transition cursor-pointer font-bold"
                >
                  {isNight ? '🌙 กลางคืน' : '☀️ กลางวัน'}
                </button>
              </div>
              <div className="bg-white/20 backdrop-blur-xs p-2 rounded-xl text-xs font-medium border border-white/30 text-amber-950">
                💬 <b>พี่ส้ม:</b> "{currentQuote}"
              </div>
            </div>
          </div>
        </header>

        {/* 🏠 บ้านแมวอบอุ่น (สไตล์น่ารัก มินิมอล สะอาดตา) */}
        <section className={`p-4 rounded-3xl shadow-sm border transition-colors ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-200'}`}>
          <div className="flex justify-between items-center px-1 mb-2">
            <h2 className="text-base font-extrabold flex items-center gap-1.5">
              🏡 บ้านแมวอบอุ่น ({cats.length} ตัว)
            </h2>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${isNight ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
              🐾 Live Cozy Room
            </span>
          </div>

          <div className={`relative h-56 rounded-3xl border-2 overflow-hidden shadow-inner flex flex-col justify-between transition-colors ${isNight ? 'border-indigo-900/60 wallpaper-night' : 'border-amber-200/80 wallpaper-day'}`}>
            
            {/* ✨ ไฟราวปิงปอง / Fairy Lights ตกแต่งเพดาน */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 py-1 z-10 pointer-events-none opacity-85">
              <div className="flex gap-2.5 text-[10px] animate-pulse">
                <span>✨</span>
                <span className="text-amber-300">🟡</span>
                <span className="text-pink-300">🌸</span>
                <span className="text-amber-300">🟡</span>
                <span className="text-indigo-300">✨</span>
              </div>
              <div className="flex gap-2.5 text-[10px] animate-pulse" style={{ animationDelay: '0.6s' }}>
                <span className="text-amber-300">🟡</span>
                <span className="text-pink-300">🌸</span>
                <span className="text-amber-300">🟡</span>
                <span>✨</span>
              </div>
            </div>

            {/* 🖼️ ผนังห้อง: กรอบรูปแมว + หน้าต่างวงกลมมินิมอล + ต้นไม้มุมห้อง */}
            <div className="flex justify-between items-start p-4 relative z-0 mt-2">
              {/* กรอบรูปแมวจิ๋ว */}
              <div className="bg-amber-100/90 border-2 border-amber-300 rounded-xl px-2 py-1 shadow-xs transform -rotate-3 text-[10px] flex items-center gap-1">
                <span>🖼️</span> 
                <span className="font-bold text-amber-900 text-[9px]">Home Sweet Home</span>
              </div>

              {/* หน้าต่างวงกลมมินิมอล */}
              <div className={`w-14 h-14 border-2 rounded-full shadow-xs flex justify-center items-center relative overflow-hidden ${isNight ? 'bg-slate-900 border-indigo-700' : 'bg-sky-100 border-amber-300'}`}>
                {isNight ? (
                  <>
                    <span className="text-xs">🌙</span>
                    <span className="text-[7px] absolute top-2 right-2 animate-pulse">✨</span>
                  </>
                ) : (
                  <div className="animate-cloud flex gap-1 items-center">
                    <span className="text-xs">☁️</span>
                  </div>
                )}
              </div>

              {/* ต้นไม้มินิมอล */}
              <div className="text-xl opacity-90 transform rotate-3">🪴</div>
            </div>

            {/* 🥣 ของตกแต่งบนพื้นแบบมินิมอล (คอนโดแมวจิ๋ว + ชามอาหาร) */}
            <div className="absolute bottom-10 left-4 right-4 flex justify-between items-end pointer-events-none opacity-90 z-0">
              <div className="flex flex-col items-center">
                <span className="text-xl">🐱</span>
                <div className="w-8 h-1 bg-amber-800/20 rounded-full"></div>
              </div>

              <div className="bg-amber-100/80 border border-amber-300/80 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 shadow-xs">
                <span>🥣</span>
                <span className="text-[9px] font-bold text-amber-800">🐟 Yummy</span>
              </div>
            </div>

            {/* 🪵 พื้นไม้ + พรมปูพื้นสีพาสเทลโบว์ชมพู */}
            <div className={`relative h-12 border-t-4 flex items-center transition-colors ${isNight ? 'wood-floor-night border-slate-700' : 'wood-floor-day border-amber-700/80'}`}>
              
              {/* พรมชมพูน่ารักกลางห้อง */}
              <div className="absolute inset-x-16 bottom-1.5 h-6 bg-pink-100/70 border border-pink-300 rounded-full z-0 pointer-events-none flex justify-center items-center shadow-xs">
                <span className="text-[9px] text-pink-500 font-bold tracking-wider">🎀 Sweet Home 🐾</span>
              </div>

              {cats.length === 0 ? (
                <p className="text-xs text-white/90 w-full text-center font-bold drop-shadow-xs z-10">
                  ยังไม่มีน้องแมววิ่งเล่นในบ้าน ลองเพิ่มประวัติแมวด้านล่างได้เลย! 🐾
                </p>
              ) : (
                cats.map((cat, index) => {
                  const scale = getCatScale(cat.weight);
                  const isJump = clickedCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`absolute bottom-1 left-2 transition-all z-10 ${isJump ? 'animate-jump' : 'animate-cat-walk'}`}
                      style={{
                        animationDuration: `${8 + (index % 3) * 3.5}s`,
                        animationDelay: `${index * 1.8}s`,
                      }}
                    >
                      <div 
                        className="flex flex-col items-center group cursor-pointer relative"
                        onClick={() => handleCatClick(cat)}
                      >
                        {activeThought[cat.id] && (
                          <div className="absolute -top-7 bg-white text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md border border-amber-300 animate-bounce whitespace-nowrap z-30">
                            {activeThought[cat.id]}
                          </div>
                        )}

                        <div className="flex items-center gap-1 mb-0.5 z-20">
                          <span className="text-[9px] bg-white/95 text-slate-800 font-bold px-1.5 py-0.2 rounded-full shadow-xs border border-slate-300 truncate max-w-[65px]">
                            {cat.name}
                          </span>
                          {cat.needs_medication && (
                            <span className="text-[10px] animate-pulse" title="ต้องกินยา">💊</span>
                          )}
                        </div>

                        <div 
                          className="transition-transform duration-200 hover:scale-125"
                          style={{ transform: `scale(${scale})` }}
                        >
                          <CatVector colorName={cat.color} />
                        </div>

                        <div className="w-6 h-1 bg-black/25 rounded-full -mt-1 blur-[1px]"></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* 📦 สต็อกทรายแมว & กระบะทราย */}
        <section className={`p-5 rounded-3xl shadow-sm border ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-100'}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold flex items-center gap-1.5">
              <span>📦</span> สต็อกทรายแมว & กระบะทราย
            </h2>
            {isSavingLitter && <span className="text-[10px] text-amber-500 font-bold animate-pulse">💾 กำลังบันทึก...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border flex justify-between items-center ${isNight ? 'bg-slate-800/80 border-slate-700' : 'bg-amber-50/80 border-amber-100'}`}>
              <div>
                <p className="text-xs font-bold text-amber-600">ทรายคงเหลือ</p>
                <p className="text-xl font-black text-amber-500">{litter.bags_left ?? 0} ถุง</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleBagsChange(-1)} 
                  className="w-8 h-8 bg-white text-slate-800 rounded-lg border font-bold hover:bg-slate-100 cursor-pointer text-base active:scale-95 transition shadow-xs"
                >
                  -
                </button>
                <button 
                  onClick={() => handleBagsChange(1)} 
                  className="w-8 h-8 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 cursor-pointer text-base active:scale-95 transition shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex justify-between items-center ${isNight ? 'bg-slate-800/80 border-slate-700' : 'bg-orange-50/80 border-orange-100'}`}>
              <div>
                <p className="text-xs font-bold text-orange-500">กระบะทราย</p>
                <p className="text-xl font-black text-orange-400">{litter.box_count ?? 0} ใบ</p>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleBoxesChange(-1)} 
                  className="w-8 h-8 bg-white text-slate-800 rounded-lg border font-bold hover:bg-slate-100 cursor-pointer text-base active:scale-95 transition shadow-xs"
                >
                  -
                </button>
                <button 
                  onClick={() => handleBoxesChange(1)} 
                  className="w-8 h-8 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 cursor-pointer text-base active:scale-95 transition shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${isNight ? 'bg-slate-800/80 border-slate-700' : 'bg-stone-50 border-stone-100'}`}>
              <p className="text-xs font-bold opacity-80">เปลี่ยนทรายล่าสุด: <span className="text-amber-500 font-extrabold">{litter.last_changed || '-'}</span></p>
              <button 
                onClick={handleTodayChanged}
                className="mt-2 text-xs bg-amber-500 text-white font-bold py-1.5 px-3 rounded-xl hover:bg-amber-600 cursor-pointer transition shadow-xs active:scale-95"
              >
                🧹 เปลี่ยนทรายวันนี้
              </button>
            </div>
          </div>
        </section>

        {/* 🐾 รายชื่อแมวในระบบ */}
        <section className={`p-5 rounded-3xl shadow-sm border ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-100'}`}>
          <h2 className="text-base font-extrabold mb-3 flex items-center gap-1.5">
            <span>🐾</span> รายชื่อสมาชิกแมว ({cats.length} ตัว)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cats.map((c) => {
              const colorStyle = getColorStyle(c.color);
              return (
                <div 
                  key={c.id} 
                  onClick={() => { setSelectedCat(c); setIsEditing(false); }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-2 relative ${isNight ? 'bg-slate-800/50 border-slate-700 hover:border-amber-500' : 'bg-amber-50/30 border-slate-100 hover:border-amber-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-amber-100/20 rounded-full flex justify-center items-center shrink-0 border border-amber-200/40">
                        <CatVector colorName={c.color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm">{c.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorStyle.badge}`}>
                            {c.color || 'สลิด'}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-70 mt-0.5">🎂 อายุ: {c.age || 'ไม่ระบุ'}</p>
                        <p className="text-[11px] opacity-70">⚖️ น้ำหนัก: {c.weight || '-'} kg</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-500 font-bold">ดูโปรไฟล์ ➔</span>
                  </div>

                  {c.needs_medication && (
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 p-2 rounded-xl text-[11px] font-bold flex items-center gap-1">
                      <span>💊 ต้องกินยา:</span>
                      <span className="font-normal truncate">{c.medication_note || 'ระบุยาทาน'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ➕ ฟอร์มเพิ่มประวัติน้องแมว */}
        <section className={`p-5 rounded-3xl shadow-sm border ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-orange-100'}`}>
          <h2 className="text-base font-extrabold mb-3 flex items-center gap-1.5">
            <span>➕</span> เพิ่มประวัติน้องแมว
          </h2>
          <form onSubmit={handleAddCat} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text" placeholder="ชื่อน้องแมว *" value={catName} onChange={(e) => setCatName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-transparent" required
              />
              <input
                type="text" placeholder="อายุ (เช่น 1 ปี 4 เดือน)" value={age} onChange={(e) => setAge(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-transparent"
              />
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">สี/ลายของแมว</label>
                <select 
                  value={color} onChange={(e) => setColor(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 ${isNight ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
                >
                  {COLOR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold opacity-70 mb-1">น้ำหนัก (kg)</label>
                <input
                  type="number" step="0.1" placeholder="เช่น 3.5" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold opacity-70 mb-1">วันที่อาบน้ำล่าสุด</label>
                <input
                  type="date" value={lastBathDate} onChange={(e) => setLastBathDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-transparent"
                />
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-2 ${isNight ? 'bg-slate-800/60 border-slate-700' : 'bg-orange-50/80 border-orange-100'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={needsMedication} onChange={(e) => setNeedsMedication(e.target.checked)} className="w-4 h-4 text-amber-500 rounded" />
                <span className="text-xs font-bold">แมวป่วย / ต้องกินยาช่วงนี้</span>
              </label>
              {needsMedication && (
                <input
                  type="text" placeholder="ระบุชื่อยา / รายละเอียดเวลาทานยา" value={medicationNote} onChange={(e) => setMedicationNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              )}
            </div>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-xs shadow-md cursor-pointer transition active:scale-98">
              บันทึกข้อมูลน้องแมว 🐾
            </button>
          </form>
        </section>

        {/* Modal ดู & แก้ไขข้อมูลแมว */}
        {selectedCat && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className={`w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-xl border ${isNight ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-800'}`}>
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm">
                  {isEditing ? '✏️ แก้ไขข้อมูลน้องแมว' : '🐱 รายละเอียดโปรไฟล์'}
                </h3>
                <button onClick={() => setSelectedCat(null)} className="opacity-50 hover:opacity-100 text-sm font-bold cursor-pointer">✕</button>
              </div>

              {!isEditing ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <CatVector colorName={selectedCat.color} />
                    <div>
                      <p className="text-base font-extrabold text-amber-500">{selectedCat.name}</p>
                      <p className="opacity-70">{selectedCat.color || 'สลิด'}</p>
                    </div>
                  </div>
                  <p><b>🎂 อายุ:</b> {selectedCat.age || 'ไม่ระบุ'}</p>
                  <p><b>⚖️ น้ำหนัก:</b> {selectedCat.weight || '-'} kg</p>
                  <p><b>🛁 อาบน้ำล่าสุด:</b> {selectedCat.last_bath_date || '-'}</p>
                  <p>
                    <b>💊 สถานะกินยา:</b> {selectedCat.needs_medication ? (
                      <span className="text-red-500 font-bold">ต้องกินยา ({selectedCat.medication_note})</span>
                    ) : (
                      <span className="text-emerald-500 font-bold">ปกติดี</span>
                    )}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setIsEditing(true)} className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600 cursor-pointer">
                      แก้ไขข้อมูล
                    </button>
                    <button onClick={() => setSelectedCat(null)} className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 rounded-xl hover:bg-slate-300 cursor-pointer">
                      ปิด
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <label className="block font-bold">ชื่อแมว</label>
                  <input type="text" value={selectedCat.name} onChange={(e) => setSelectedCat({...selectedCat, name: e.target.value})} className="w-full p-2 border rounded-xl bg-transparent" />

                  <label className="block font-bold">สี/ลายแมว</label>
                  <select 
                    value={selectedCat.color || 'สลิด'} onChange={(e) => setSelectedCat({...selectedCat, color: e.target.value})}
                    className={`w-full p-2 border rounded-xl ${isNight ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>

                  <label className="block font-bold">อายุ (เช่น 1 ปี 4 เดือน)</label>
                  <input type="text" value={selectedCat.age || ''} onChange={(e) => setSelectedCat({...selectedCat, age: e.target.value})} className="w-full p-2 border rounded-xl bg-transparent" />

                  <label className="block font-bold">น้ำหนัก (kg)</label>
                  <input type="number" step="0.1" value={selectedCat.weight || ''} onChange={(e) => setSelectedCat({...selectedCat, weight: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-xl bg-transparent" />

                  <label className="block font-bold">วันที่อาบน้ำล่าสุด</label>
                  <input type="date" value={selectedCat.last_bath_date || ''} onChange={(e) => setSelectedCat({...selectedCat, last_bath_date: e.target.value})} className="w-full p-2 border rounded-xl bg-transparent" />

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input type="checkbox" checked={selectedCat.needs_medication || false} onChange={(e) => setSelectedCat({...selectedCat, needs_medication: e.target.checked})} className="w-4 h-4 text-amber-500 rounded" />
                    <span className="font-bold">แมวป่วย / ต้องกินยาช่วงนี้</span>
                  </label>
                  {selectedCat.needs_medication && (
                    <input type="text" placeholder="ระบุชื่อยา / รายละเอียดเวลาทานยา" value={selectedCat.medication_note || ''} onChange={(e) => setSelectedCat({...selectedCat, medication_note: e.target.value})} className="w-full p-2 border rounded-xl bg-transparent" />
                  )}

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleUpdateCat} className="flex-1 bg-amber-500 text-white font-bold py-2 rounded-xl hover:bg-amber-600 cursor-pointer">
                      บันทึกการแก้ไข
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 rounded-xl hover:bg-slate-300 cursor-pointer">
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