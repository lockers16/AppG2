import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Task, ManagerData, SettingsData } from './types';
import { LogIn, School, Badge, Lock, Calendar, LayoutDashboard, ClipboardList, BarChart3, Mail, Settings, Search, Bell, Download, TrendingUp, Save, X, Filter, FileDown, ChevronRight, ChevronLeft, Info, CheckCircle, UserPlus, Palette, Image as ImageIcon, Phone, Edit3, Trash2, UserCog, Check, AlertTriangle, Camera } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';

// --- Components ---

const SupportModal = ({ contact, onClose }: { contact: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Phone className="text-primary" />
          צור קשר עם התמיכה
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center whitespace-pre-wrap">
        <p className="text-slate-600 mb-2">פרטי התקשרות:</p>
        <p className="text-xl font-bold text-slate-900">{contact}</p>
      </div>
      <button 
        onClick={onClose}
        className="w-full mt-6 bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-colors"
      >
        סגור
      </button>
    </motion.div>
  </div>
);

const LoginPage = ({ onLogin, settings }: { onLogin: (user: User) => void; settings: SettingsData }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsBlocked(false);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, birthDate }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        if (res.status === 403) {
          setIsBlocked(true);
        }
        setError(data.error || 'פרטי התחברות שגויים');
      }
    } catch (err) {
      setError('שגיאת שרת');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-assistant">
      <style>{`
        :root { --primary-color: ${settings.primary_color}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .ring-primary { --tw-ring-color: var(--primary-color); }
      `}</style>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${settings.login_bg_url}')` }}></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[480px] bg-white shadow-2xl rounded-3xl overflow-hidden border border-white/20"
      >
        <div className="h-48 w-full relative">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${settings.header_bg_url}')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl shadow-2xl ring-4 ring-white">
                <School className="text-white w-8 h-8" />
              </div>
              <div>
                <h2 className="text-slate-900 text-sm font-bold tracking-wider uppercase opacity-80">ציונים בהיסטוריה י"א5</h2>
                <h1 className="text-slate-900 text-3xl font-black">דף התחברות</h1>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl text-sm font-bold border flex flex-col items-center gap-3 text-center bg-red-50 border-red-200 text-red-600"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span>{isBlocked ? "המשתמש חסום על ידי מנהל מערכת" : error}</span>
              </div>
              {isBlocked && (
                <button 
                  type="button"
                  onClick={() => setShowSupport(true)}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition-colors shadow-sm"
                >
                  פנה לתמיכה
                </button>
              )}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="block text-slate-700 text-sm font-bold pr-1">מספר זהות</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Badge className="w-5 h-5" />
              </div>
              <input 
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium" 
                placeholder="הכנס מספר זהות" 
                type="text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-700 text-sm font-bold pr-1">סיסמה</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium" 
                placeholder="הכנס סיסמה" 
                type="password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-slate-700 text-sm font-bold pr-1">תאריך לידה</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                <Calendar className="w-5 h-5" />
              </div>
              <input 
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="block w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium" 
                placeholder="DD/MM/YYYY" 
                type="date"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-primary hover:opacity-90 text-white font-black py-5 px-6 rounded-2xl shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <span className="text-xl">כניסה למערכת</span>
              <ChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex flex-col items-center space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>זקוק לעזרה?</span>
              <button 
                type="button"
                onClick={() => setShowSupport(true)}
                className="text-primary hover:underline font-bold transition-colors"
              >
                צור קשר עם התמיכה
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {showSupport && <SupportModal contact={settings.support_contact} onClose={() => setShowSupport(false)} />}
      </AnimatePresence>
    </div>
  );
};

const StudentDashboard = ({ user, onLogout, settings }: { user: User; onLogout: () => void; settings: SettingsData }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const summaryRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/student/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      });
  }, [user.id]);

  const reportedTasks = tasks.filter(t => t.reported);
  const totalWeight = tasks.reduce((acc, t) => acc + t.weight, 0);
  const currentWeightedSum = tasks.reduce((acc, t) => acc + (t.reported ? (t.grade || 0) * t.weight : 0), 0);
  
  // Final grade is calculated as (sum of (grade * weight) / 100)
  const finalGradeValue = currentWeightedSum / 100;
  const finalGrade = finalGradeValue.toFixed(1);
  
  // Progress based on weighted completion
  const weightedProgress = Math.round(reportedTasks.reduce((acc, t) => acc + t.weight, 0));
  const progress = weightedProgress;

  // Status indicator: green if (current grade / total possible weight reported so far) > 75%
  const reportedWeight = reportedTasks.reduce((acc, t) => acc + t.weight, 0);
  const isGoodStatus = reportedWeight > 0 && (currentWeightedSum / reportedWeight) > 75;

  const exportToExcel = () => {
    const data = tasks.map(t => ({
      'שם המשימה': t.name,
      'אחוז מהציון': `${t.weight}%`,
      'ציון': t.reported ? t.grade : 'טרם דווח',
      'תאריך': t.reported_date || '-'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!dir'] = { rtl: true };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ציונים");
    
    // Add student name at top
    XLSX.utils.sheet_add_aoa(ws, [[`שם הסטודנט: ${user.name}`]], { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, data, { origin: "A3" });

    XLSX.writeFile(wb, `ציונים_${user.name}.xlsx`);
  };

  const exportAsImage = async () => {
    if (summaryRef.current === null) return;
    try {
      const dataUrl = await toPng(summaryRef.current, { cacheBust: true, backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.download = `תמצית_ציונים_${user.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image export failed', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen font-assistant">טוען...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-assistant" dir="rtl">
      <style>{`
        :root { --primary-color: ${settings.primary_color}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}</style>
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white border-l border-slate-200 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-primary text-white p-2 rounded-lg">
            <School className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">ציונים בהיסטוריה י"א5</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium" href="#">
            <LayoutDashboard className="w-5 h-5" />
            <span>לוח בקרה</span>
          </a>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2">
              <LogIn className="w-5 h-5 rotate-180" />
              <span>התנתקות</span>
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
              {user.name.substring(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{user.name}</span>
              <span className="text-xs text-slate-500 truncate">כיתה י"א5</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <h2 className="text-lg lg:text-xl font-bold">לוח בקרה לתלמיד</h2>
          <button onClick={onLogout} className="lg:hidden p-2 text-red-600">
            <LogIn className="w-6 h-6 rotate-180" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Final Grade Card */}
            <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
              <div className="z-10 text-center md:text-right">
                <h3 className="text-lg font-medium text-slate-500 mb-2">ציון סופי שנצבר</h3>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-5xl lg:text-7xl font-black text-primary">{finalGrade}</span>
                  <span className="text-xl font-bold text-slate-400">/ 100</span>
                </div>
                {isGoodStatus && (
                  <p className="mt-4 text-sm text-green-600 bg-green-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    מצב טוב
                  </p>
                )}
              </div>
              <div className="mt-6 md:mt-0 flex items-center gap-8 z-10">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-black">{reportedTasks.length} / {tasks.length}</div>
                  <div className="text-xs text-slate-500 font-bold">משימות שדווחו</div>
                </div>
              </div>
              <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            {/* Progress Card */}
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
              <h3 className="text-sm font-bold text-slate-500 mb-4">התקדמות העבודות</h3>
              <div className="relative w-28 h-28 lg:w-32 lg:h-32 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="stroke-slate-100 fill-none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" strokeWidth="3"></path>
                  <motion.path 
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${progress}, 100` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="stroke-primary fill-none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    strokeLinecap="round" 
                    strokeWidth="3"
                  ></motion.path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-800">{progress}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">הושלם</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportToExcel}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <FileDown className="w-5 h-5 text-primary" />
              <span>הורדת דו"ח ציונים</span>
            </button>
            <button 
              onClick={exportAsImage}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Camera className="w-5 h-5" />
              <span>הורדת תמצית כתמונה</span>
            </button>
          </div>

          {/* Task Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 lg:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold">פירוט משימות וציונים</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 lg:px-8 py-4">שם המשימה</th>
                    <th className="px-4 py-4 text-center">אחוז</th>
                    <th className="px-4 py-4 text-center">ציון</th>
                    <th className="px-6 py-4">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 lg:px-8 py-5 font-bold text-slate-800">{task.name}</td>
                      <td className="px-4 py-5 text-center text-slate-500 font-medium">{task.weight}%</td>
                      <td className="px-4 py-5 text-center">
                        <span className={`text-lg font-black ${task.reported ? 'text-primary' : 'text-slate-300'}`}>
                          {task.reported ? task.grade : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          task.reported 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {task.reported ? 'דווח' : 'ממתין'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Summary for Image Export */}
      <div className="fixed -left-[9999px] top-0">
        <div ref={summaryRef} className="w-[600px] p-12 bg-slate-50 rounded-3xl border-4 border-primary/20 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl">
                <School className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                <p className="text-slate-500 font-bold">תמצית ציונים - כיתה י"א5</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary">{finalGrade}</div>
              <div className="text-xs font-bold text-slate-400 uppercase">ציון סופי</div>
            </div>
          </div>
          <div className="space-y-4">
            {tasks.filter(t => t.reported).map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <span className="font-bold text-slate-700">{t.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400">{t.weight}%</span>
                  <span className="text-xl font-black text-primary">{t.grade}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-bold">הופק באמצעות מערכת ניהול אקדמית - {new Date().toLocaleDateString('he-IL')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard = ({ user, onLogout, settings, onRefreshSettings }: { user: User; onLogout: () => void; settings: SettingsData; onRefreshSettings: () => void }) => {
  const [data, setData] = useState<ManagerData | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'grades' | 'task-grades' | 'students' | 'tasks' | 'settings'>('grades');
  
  // Modals
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [originalId, setOriginalId] = useState<string | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Forms
  const [newStudent, setNewStudent] = useState({ id: '', name: '', password: '', birthDate: '' });
  const [editSettings, setEditSettings] = useState<SettingsData>(settings);
  const [selectedTaskForGrades, setSelectedTaskForGrades] = useState<number | null>(null);
  
  // Export Selection
  const [exportCols, setExportCols] = useState({
    name: true, id: true, birthDate: true, password: true, finalGrade: true, taskGrades: true
  });
  const [search, setSearch] = useState('');
  const [showGradeDetails, setShowGradeDetails] = useState<any | null>(null);
  const [taskEdits, setTaskEdits] = useState<Record<number, { name: string, weight: number }>>({});

  const currentTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.map(task => ({
      ...task,
      ...(taskEdits[task.id] || {})
    }));
  }, [data, taskEdits]);

  const totalTaskWeight = useMemo(() => {
    return currentTasks.reduce((acc, t) => acc + t.weight, 0);
  }, [currentTasks]);

  const isWeightInvalid = totalTaskWeight > 100;

  useEffect(() => {
    if (isWeightInvalid && activeTab === 'tasks') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isWeightInvalid, activeTab]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.students.filter(s => 
      s.name.includes(search) || 
      s.id.includes(search)
    );
  }, [data, search]);

  const calculateFinalGrade = (student: any) => {
    if (!data) return '0.0';
    let sum = 0;
    data.tasks.forEach(task => {
      const grade = student.grades[task.id] ?? 0;
      sum += (grade * task.weight) / 100;
    });
    return sum.toFixed(1);
  };

  const classSummaryRef = React.useRef<HTMLDivElement>(null);

  const exportClassSummary = async () => {
    if (classSummaryRef.current === null) return;
    try {
      const dataUrl = await toPng(classSummaryRef.current, { cacheBust: true, backgroundColor: '#f8fafc' });
      const link = document.createElement('a');
      link.download = `סיכום_ציונים_כיתה_י"א5.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Class summary export failed', err);
    }
  };
  const refreshData = async () => {
    const res = await fetch('/api/manager/students');
    const data = await res.json();
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleGradeChange = (studentId: string, taskId: number, value: string) => {
    const grade = value === '' ? 0 : parseInt(value);
    if (isNaN(grade)) return;
    
    setPendingUpdates(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [taskId]: grade
      }
    }));
  };

  const handleSaveGrades = async () => {
    const updates: any[] = [];
    Object.entries(pendingUpdates).forEach(([studentId, tasks]) => {
      Object.entries(tasks).forEach(([taskId, grade]) => {
        updates.push({ studentId, taskId: parseInt(taskId), grade });
      });
    });

    if (updates.length === 0) return;

    try {
      const res = await fetch('/api/manager/update-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setPendingUpdates({});
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/manager/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setNewStudent({ id: '', name: '', password: '', birthDate: '' });
        refreshData();
        alert('תלמיד נוסף בהצלחה');
      } else {
        const err = await res.json();
        alert(err.error || 'שגיאה בהוספת תלמיד');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map birth_date to birthDate for server
      const payload = {
        ...editingStudent,
        birthDate: editingStudent.birth_date || editingStudent.birthDate,
        originalId: originalId
      };
      const res = await fetch('/api/manager/update-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingStudent(null);
        setOriginalId(null);
        refreshData();
        alert('פרטי תלמיד עודכנו');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    try {
      const res = await fetch(`/api/manager/student/${deletingStudent.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingStudent(null);
        setEditingStudent(null);
        refreshData();
        alert('תלמיד נמחק');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSettings),
      });
      if (res.ok) {
        onRefreshSettings();
        alert('הגדרות עודכנו בהצלחה');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (task: any) => {
    try {
      const res = await fetch('/api/manager/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        refreshData();
        alert('משימה עודכנה');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportToExcel = () => {
    if (!data) return;
    const exportData = data.students.map(student => {
      const row: any = {};
      if (exportCols.name) row['שם'] = student.name;
      if (exportCols.id) row['תעודת זהות'] = student.id;
      if (exportCols.password) row['סיסמה'] = student.password;
      if (exportCols.birthDate) row['תאריך לידה'] = student.birth_date;
      
      let finalGrade = 0;
      data.tasks.forEach(task => {
        const grade = student.grades[task.id] ?? 0;
        finalGrade += (grade * task.weight) / 100;
        if (exportCols.taskGrades) row[task.name] = grade;
      });
      
      if (exportCols.finalGrade) row['ציון סופי'] = finalGrade.toFixed(1);
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!dir'] = { rtl: true };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "נתוני תלמידים");
    XLSX.writeFile(wb, "דוח_תלמידים.xlsx");
    setShowExportModal(false);
  };

  if (loading || !data) return <div className="flex items-center justify-center h-screen">טוען...</div>;

  const hasPending = Object.keys(pendingUpdates).length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50" dir="rtl">
      <style>{`
        :root { --primary-color: ${settings.primary_color}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}</style>
      
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <LayoutDashboard className="text-amber-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">לוח בקרה למנהל</h1>
              <p className="text-xs text-slate-500">ציונים בהיסטוריה י"א5</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r pr-4 border-slate-200">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs text-slate-500 mt-1">מנהל מערכת</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                {user.name.substring(0, 2)}
              </div>
              <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                <LogIn className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-6">
        {/* Tabs */}
        <div className="border-b border-slate-200">
          {/* Mobile Select */}
          <div className="lg:hidden mb-4">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="grades">ציונים</option>
              <option value="task-grades">עדכון ציונים למשימה</option>
              <option value="students">הוספת תלמיד</option>
              <option value="tasks">ניהול משימות</option>
              <option value="settings">הגדרות מערכת</option>
            </select>
          </div>
          {/* Desktop Tabs */}
          <div className="hidden lg:flex gap-8 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setActiveTab('grades')} className={`pb-4 px-2 font-bold transition-all ${activeTab === 'grades' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>ציונים</button>
            <button onClick={() => setActiveTab('task-grades')} className={`pb-4 px-2 font-bold transition-all ${activeTab === 'task-grades' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>עדכון ציונים למשימה</button>
            <button onClick={() => setActiveTab('students')} className={`pb-4 px-2 font-bold transition-all ${activeTab === 'students' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>הוספת תלמיד</button>
            <button onClick={() => setActiveTab('tasks')} className={`pb-4 px-2 font-bold transition-all ${activeTab === 'tasks' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>ניהול משימות</button>
            <button onClick={() => setActiveTab('settings')} className={`pb-4 px-2 font-bold transition-all ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>הגדרות מערכת</button>
          </div>
        </div>

        {activeTab === 'grades' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  className="block w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none shadow-sm" 
                  placeholder="חפש תלמיד לפי שם או תעודת זהות..." 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-5 h-5" />
                  <span>הורדת דו"ח ציונים</span>
                </button>
                <button 
                  onClick={exportClassSummary}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>ייצוא תמונת סיכום</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-sm font-bold text-slate-700">שם התלמיד</th>
                      {data.tasks.map(task => (
                        <th key={task.id} className="hidden lg:table-cell px-2 py-4 text-center text-xs font-bold text-slate-500 border-x border-slate-100">
                          <div className="flex flex-col items-center">
                            <span className="truncate max-w-[80px]">{task.name}</span>
                            <span className="text-[9px] opacity-60">({task.weight}%)</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-4 text-center text-sm font-bold text-primary bg-primary/5">ציון סופי</th>
                      <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${
                                student.blocked 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                  : 'bg-primary/10 text-primary border-primary/20'
                              }`}>
                                {student.name.substring(0, 2)}
                              </div>
                              <button 
                                onClick={() => setDeletingStudent(student)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex flex-col">
                              <span className={`flex items-center gap-2 ${student.blocked ? 'text-slate-400' : 'text-slate-900'}`}>
                                {student.name}
                              </span>
                              <span className="text-[10px] text-slate-400">{student.id}</span>
                            </div>
                          </div>
                        </td>
                        {data.tasks.map(task => (
                          <td key={task.id} className="hidden lg:table-cell px-2 py-4 text-center border-x border-slate-50">
                            <span className={`text-sm font-bold ${student.grades[task.id] === null ? 'text-slate-300' : 'text-slate-600'}`}>
                              {student.grades[task.id] ?? '-'}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => setShowGradeDetails(student)}
                            className={`text-xl font-black transition-colors hover:underline ${student.blocked ? 'text-slate-300' : 'text-primary'}`}
                          >
                            {calculateFinalGrade(student)}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => {
                              setEditingStudent(student);
                              setOriginalId(student.id);
                            }}
                            className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-100"
                          >
                            <UserCog className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'task-grades' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <label className="block text-sm font-bold mb-2">בחר משימה לעדכון:</label>
              <select 
                value={selectedTaskForGrades || ''} 
                onChange={e => setSelectedTaskForGrades(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary"
              >
                <option value="">בחר משימה...</option>
                {data.tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {selectedTaskForGrades && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-bold">{data.tasks.find(t => t.id === selectedTaskForGrades)?.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                    משקל המשימה: {data.tasks.find(t => t.id === selectedTaskForGrades)?.weight}%
                  </div>
                </div>
                <div className="p-6">
                  <div className="max-w-2xl mx-auto space-y-3">
                    {data.students.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border ${
                            student.blocked 
                              ? 'bg-slate-100 text-slate-400 border-slate-200' 
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {student.name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold ${student.blocked ? 'text-slate-400' : 'text-slate-800'}`}>{student.name}</span>
                            <span className="text-[10px] text-slate-400">{student.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={pendingUpdates[student.id]?.[selectedTaskForGrades] ?? student.grades[selectedTaskForGrades] ?? ''}
                            onChange={e => {
                              const val = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              handleGradeChange(student.id, selectedTaskForGrades, val.toString());
                            }}
                            className="w-20 p-2 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold"
                          />
                          <span className="text-xs font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="text-primary" />
              הוספת תלמיד חדש
            </h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">שם מלא</label>
                  <input required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">תעודת זהות</label>
                  <input required value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">סיסמה</label>
                  <input required value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" type="password" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">תאריך לידה</label>
                  <input required value={newStudent.birthDate} onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" type="date" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all">הוסף תלמיד</button>
            </form>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white p-4 md:p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="text-primary" />
                ניהול משימות
              </h3>
              <button 
                disabled={isWeightInvalid || Object.keys(taskEdits).length === 0}
                onClick={async () => {
                  for (const [id, edit] of Object.entries(taskEdits)) {
                    const taskEdit = edit as { name: string; weight: number };
                    await handleUpdateTask({ id: parseInt(id), ...taskEdit });
                  }
                  setTaskEdits({});
                }}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                  isWeightInvalid 
                    ? 'bg-red-500 text-white cursor-not-allowed' 
                    : Object.keys(taskEdits).length > 0
                      ? 'bg-primary text-white hover:opacity-90'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" />
                שמור שינויים
              </button>
            </div>

            {isWeightInvalid && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">שים לב: סך אחוזי המשימות עומד על {totalTaskWeight}%. לא ניתן לשמור מעל 100%.</span>
              </motion.div>
            )}

            <div className="space-y-4">
              {currentTasks.map(task => (
                <div key={task.id} className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group transition-all hover:border-primary/20">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="font-bold text-slate-400 w-8 hidden md:block">{task.id}</span>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">שם המשימה</label>
                      <input 
                        value={task.name}
                        onChange={(e) => setTaskEdits(prev => ({
                          ...prev,
                          [task.id]: { ...(prev[task.id] || { name: task.name, weight: task.weight }), name: e.target.value }
                        }))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary font-bold"
                      />
                    </div>
                    <div className="w-full md:w-32 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">אחוזים (%)</label>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        value={task.weight}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          setTaskEdits(prev => ({
                            ...prev,
                            [task.id]: { ...(prev[task.id] || { name: task.name, weight: task.weight }), weight: val }
                          }));
                        }}
                        className={`w-full p-3 bg-white border rounded-lg outline-none focus:border-primary text-center font-black text-lg ${
                          task.weight > 100 ? 'border-red-500 text-red-600' : 'border-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center px-4">
              <span className="text-slate-500 font-bold">סך הכל אחוזים:</span>
              <span className={`text-2xl font-black ${isWeightInvalid ? 'text-red-600' : 'text-primary'}`}>
                {totalTaskWeight}%
              </span>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-primary" />
              הגדרות מערכת
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Palette className="w-4 h-4" /> צבע ראשי</label>
                <input type="color" value={editSettings.primary_color} onChange={e => setEditSettings({...editSettings, primary_color: e.target.value})} className="w-full h-12 p-1 rounded-lg cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> כתובת תמונת רקע (דף כניסה)</label>
                <input value={editSettings.login_bg_url} onChange={e => setEditSettings({...editSettings, login_bg_url: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4" /> כתובת תמונת כותרת (דף כניסה)</label>
                <input value={editSettings.header_bg_url} onChange={e => setEditSettings({...editSettings, header_bg_url: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Phone className="w-4 h-4" /> פרטי קשר לתמיכה</label>
                <textarea 
                  rows={3}
                  value={editSettings.support_contact} 
                  onChange={e => setEditSettings({...editSettings, support_contact: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary resize-none" 
                />
              </div>
              <button onClick={handleUpdateSettings} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                שמור הגדרות
              </button>
            </div>
          </div>
        )}

        {hasPending && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Info className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">שינויים ממתינים לעדכון</h3>
                <p className="text-slate-600 text-sm max-w-lg">
                  בוצעו שינויים במספר ציונים. כדי להחיל את השינויים על כלל המערכת ולעדכן את התלמידים, יש ללחוץ על הכפתור "עדכן מסד נתונים".
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setPendingUpdates({})}
                className="flex-1 md:flex-none bg-white border border-slate-200 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-all text-slate-700"
              >
                ביטול שינויים
              </button>
              <button 
                onClick={handleSaveGrades}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <Save className="w-5 h-5" />
                <span>עדכן מסד נתונים</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showGradeDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black border-2 border-primary/20">
                    {showGradeDetails.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{showGradeDetails.name}</h3>
                    <p className="text-slate-500 font-bold text-sm">פירוט ציונים מלא</p>
                  </div>
                </div>
                <button onClick={() => setShowGradeDetails(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {data.tasks.map(task => {
                  const grade = showGradeDetails.grades[task.id];
                  const isReported = grade !== undefined && grade !== null;
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{task.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">משקל: {task.weight}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-black ${isReported ? 'text-primary' : 'text-slate-300'}`}>
                          {isReported ? grade : '-'}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${isReported ? 'bg-green-500' : 'bg-amber-400'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-bold">ציון סופי משוקלל:</span>
                <span className="text-4xl font-black text-primary">{calculateFinalGrade(showGradeDetails)}</span>
              </div>
            </motion.div>
          </div>
        )}

        {editingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <UserCog className="text-primary" />
                  עריכת פרטי תלמיד
                </h3>
                <button onClick={() => setEditingStudent(null)}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold">שם מלא</label>
                    <input value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">תעודת זהות</label>
                    <input value={editingStudent.id} onChange={e => setEditingStudent({...editingStudent, id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold">סיסמה</label>
                    <input value={editingStudent.password} onChange={e => setEditingStudent({...editingStudent, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold">תאריך לידה</label>
                    <input type="date" value={editingStudent.birth_date} onChange={e => setEditingStudent({...editingStudent, birth_date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    checked={editingStudent.blocked} 
                    onChange={e => setEditingStudent({...editingStudent, blocked: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label className="font-bold text-slate-700">חסום גישה למערכת</label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all">שמור שינויים</button>
                  <button type="button" onClick={() => setDeletingStudent(editingStudent)} className="px-6 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-all flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    מחיקה
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deletingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-red-100">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <AlertTriangle className="text-red-600 w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">אזהרת מחיקה</h3>
                <p className="text-slate-600">
                  האם אתה בטוח שברצונך למחוק את <strong>{deletingStudent.name}</strong>?
                  <br />
                  פעולה זו היא סופית ולא ניתן לבטלה. כל הציונים והנתונים של התלמיד יימחקו לצמיתות.
                </p>
                <div className="flex gap-4 w-full pt-4">
                  <button onClick={handleDeleteStudent} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all">מחק לצמיתות</button>
                  <button onClick={() => setDeletingStudent(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-all">ביטול</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-6">בחר עמודות לייצוא</h3>
              <div className="space-y-3">
                {Object.entries({
                  name: 'שם', id: 'תעודת זהות', birthDate: 'תאריך לידה', password: 'סיסמה', finalGrade: 'ציון סופי', taskGrades: 'ציונים בכל המשימות'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={(exportCols as any)[key]} 
                      onChange={e => setExportCols({...exportCols, [key]: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={exportToExcel} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all">ייצא עכשיו</button>
                <button onClick={() => setShowExportModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-all">ביטול</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-auto py-8 px-6 text-center text-slate-500 text-sm border-t border-slate-200">
        <p>© 2024 מערכת ניהול אקדמית - לוח בקרה למנהל</p>
      </footer>

      {/* Hidden Class Summary for Image Export */}
      <div className="fixed -left-[9999px] top-0">
        <div ref={classSummaryRef} className="w-[800px] p-12 bg-slate-50 rounded-3xl border-4 border-primary/20 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-3 rounded-2xl">
                <School className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">סיכום ציונים כיתתי</h1>
                <p className="text-slate-500 font-bold">כיתה י"א5 - היסטוריה</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400">ממוצע כיתתי</div>
              <div className="text-4xl font-black text-primary">
                {(data.students.reduce((acc, s) => acc + parseFloat(calculateFinalGrade(s)), 0) / data.students.length).toFixed(1)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">ממוצעים לפי משימה</h3>
              <div className="space-y-3">
                {data.tasks.map(task => {
                  const avg = data.students.reduce((acc, s) => acc + (s.grades[task.id] || 0), 0) / data.students.length;
                  return (
                    <div key={task.id} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-600">{task.name}</span>
                      <span className="font-black text-primary">{avg.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">סטטיסטיקה כללית</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">מספר תלמידים</span>
                  <span className="font-black">{data.students.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">תלמידים חסומים</span>
                  <span className="font-black text-red-500">{data.students.filter(s => s.blocked).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">משימות פעילות</span>
                  <span className="font-black">{data.tasks.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-bold">הופק באמצעות מערכת ניהול אקדמית - {new Date().toLocaleDateString('he-IL')}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[100]"
          >
            <CheckCircle className="text-green-400 w-5 h-5" />
            <span className="text-sm font-medium">הנתונים נשמרו בהצלחה במסד הנתונים</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data));
  };

  useEffect(() => {
    fetchSettings();
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!settings) return <div className="flex items-center justify-center h-screen">טוען הגדרות...</div>;

  if (!user) {
    return <LoginPage onLogin={handleLogin} settings={settings} />;
  }

  if (user.role === 'manager') {
    return <ManagerDashboard user={user} onLogout={handleLogout} settings={settings} onRefreshSettings={fetchSettings} />;
  }

  return <StudentDashboard user={user} onLogout={handleLogout} settings={settings} />;
}
