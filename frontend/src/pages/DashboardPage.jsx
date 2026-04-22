import React, { useState, useEffect, useRef } from 'react';
import {
    Scan, Trophy, LogOut, CheckCircle2, AlertCircle,
    Clock, Save, X, Search, Keyboard, Barcode
} from 'lucide-react';
import { api } from '../services/api';

const DashboardPage = ({ cedula, setCedula, setView, showToast }) => {
    const [ean, setEan] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [history, setHistory] = useState([]);
    const [userTime, setUserTime] = useState(0);
    const [ranking, setRanking] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [form, setForm] = useState({ product: '', brand: '', char: '', value: '', unit: '', sales: 'UND' });
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const scannerRef = useRef(null);

    const returnFocus = () => {
        if (scannerRef.current) scannerRef.current.focus();
    };

    const handleScan = async (e) => {
        e.preventDefault();
        const isValidEan = /^[0-9]{5,14}$/.test(ean);

        if (!isValidEan) {
            showToast('EAN inválido. Use entre 5 y 14 números.', 'error');
            setEan('');
            returnFocus();
            return;
        }

        setIsValidating(true);
        try {
            const data = await api.scanEan(ean);
            if (data.status === "success" || data.message === "EAN libre") {
                setShowModal(true);
            } else {
                showToast(data.message, 'error');
                setEan('');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor (Backend caído).', 'error');
            setEan('');
        } finally {
            setIsValidating(false);
        }
    };

    const generateFullName = () => {
        const parts = [];
        if (form.product) parts.push(form.product.toUpperCase());
        if (form.brand) parts.push(form.brand.toUpperCase());
        if (form.char) parts.push(form.char.toUpperCase());
        if (form.value) {
            parts.push('X');
            parts.push(form.value);
            if (form.unit) parts.push(form.unit.toUpperCase());
        }
        parts.push(form.sales.toUpperCase());
        return parts.join(' ').replace(/\s+/g, ' ');
    };

    const handleSave = async () => {
        if (!form.product || !form.brand) {
            showToast('Producto y Marca son obligatorios', 'error');
            return;
        }

        setIsLoading(true);
        const fullName = generateFullName();
        const payload = {
            ean: ean,
            fullName: fullName,
            numDocument: cedula,
            nmProduct: form.product?.toUpperCase(),
            nmBrand: form.brand?.toUpperCase(),
            nmCharacteristic: form.char?.toUpperCase(),
            nmContentValue: form.value?.toString(),
            nmContentUnit: form.unit?.toUpperCase(),
            nmSalesUnit: form.sales?.toUpperCase()
        };

        try {
            await api.saveProduct(payload);
            const newEntry = { ean, fullName, time: '+1 MIN', id: Date.now() };
            setHistory([newEntry, ...history].slice(0, 5));
            setUserTime(prev => prev + 1);

            setShowModal(false);
            setEan('');
            setForm({ product: '', brand: '', char: '', value: '', unit: '', sales: 'UND' });
            showToast('¡Hallazgo guardado en BD! +1 Minuto ganado.', 'success');

            // Refetch data
            refreshData();
        } catch (error) {
            showToast(error.detail || 'Error al guardar en base de datos', 'error');
        } finally {
            setIsLoading(false);
            returnFocus();
        }
    };

    const refreshData = async () => {
        try {
            const [rankingData, statsData] = await Promise.all([
                api.getRanking(),
                api.getUserStats(cedula)
            ]);
            setRanking(rankingData);
            setUserTime(statsData.saldo);
            setHistory(statsData.history);
        } catch (e) {
            console.error("Error al refrescar datos:", e);
        }
    };

    const handleLogout = () => {
        setCedula('');
        setView('login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rankingData, statsData, brandsData] = await Promise.all([
                    api.getRanking(),
                    api.getUserStats(cedula),
                    api.getBrands()
                ]);

                setRanking(rankingData);
                setUserTime(statsData.saldo);
                setHistory(statsData.history);
                setBrandList(brandsData.brands || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [cedula]);

    useEffect(() => {
        if (!isValidating && !showModal) {
            const timer = setTimeout(() => {
                if (scannerRef.current) scannerRef.current.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isValidating, showModal]);


    return (
        <div className="min-h-[100dvh] lg:h-[100dvh] w-full bg-[#0a0a0a] text-slate-200 flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden">
            {/* AREA CENTRAL: ESCÁNER */}
            <main className="w-full lg:flex-1 flex flex-col relative order-1 lg:order-2 lg:h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoOTAsIDk0LCA5OCwgMC4wNykiLz48L3N2Zz4=')]">

                <header className="p-3 sm:p-4 lg:px-6 flex justify-between items-center z-10 border-b border-[#4a4948]/20 bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/10 px-2 py-1 rounded backdrop-blur-md">
                            <span className="text-white font-bold text-[10px] sm:text-xs">tiendas <span className="text-[#42a636]">ON</span></span>
                        </div>
                        <div className="h-4 w-px bg-[#4a4948]"></div>
                        <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                            Registra<span className="text-[#42a636]">ON</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#42a636]/10 px-3 py-1.5 rounded-full border border-[#42a636]/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#02ad02]"></div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#42a636] uppercase tracking-widest">Activo</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 z-10 min-h-[40dvh] lg:min-h-0">
                    <div className="w-full max-w-xl text-center">
                        <div className="mb-6 lg:mb-8 relative flex flex-col items-center">
                            <div className="relative flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 mb-4 group">
                                <div className="absolute inset-0 border border-[#4a4948]/30 rounded-2xl transform rotate-45 animate-[spin_4s_linear_infinite]"></div>
                                <div className="absolute inset-1.5 border border-dashed border-[#4a4948]/40 rounded-xl"></div>
                                <Barcode className="text-[#42a636] relative z-10 drop-shadow-[0_0_8px_rgba(66,166,54,0.3)]" size={36} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-1 uppercase">Escanea Producto</h2>
                            <p className="text-[10px] sm:text-xs text-[#5a5e62] font-medium uppercase tracking-widest">Láser o Teclado</p>
                        </div>

                        <form onSubmit={handleScan} className="relative group">
                            <div className="relative flex items-center w-full">
                                <div className="absolute left-4 lg:left-6 z-10 flex items-center justify-center">
                                    <Scan className={`${isValidating ? 'text-[#42a636] animate-pulse' : 'text-[#5a5e62] group-focus-within:text-[#42a636]'} transition-colors`} size={20} />
                                </div>
                                <input
                                    ref={scannerRef} type="tel" value={ean} onChange={(e) => setEan(e.target.value)}
                                    placeholder={isValidating ? "Validando..." : "Ej: 770123456789"} autoComplete="off"
                                    disabled={isValidating}
                                    className="relative w-full bg-[#050505] border-2 border-[#4a4948] rounded-xl pl-12 lg:pl-16 pr-16 lg:pr-24 py-3 lg:py-4 text-left text-xl lg:text-2xl font-mono text-white placeholder-[#5a5e62]/40 focus:outline-none focus:border-[#42a636] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] transition-all disabled:opacity-50"
                                />
                                {isValidating ? (
                                    <div className="absolute right-4 lg:right-6">
                                        <svg className="animate-spin h-6 w-6 text-[#42a636]" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="absolute right-3 lg:right-4 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-[#42a636]/10 text-[#42a636] text-[9px] lg:text-[10px] font-bold px-2 py-1 rounded border border-[#42a636]/30 flex items-center gap-1">
                                            <span className="hidden sm:inline">ENTER</span> <Keyboard size={12} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="h-auto lg:h-52 p-4 lg:p-5 border-t border-[#4a4948]/20 bg-[#1a1a1a]/30 z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-[#42a636]" />
                        <h3 className="text-[9px] sm:text-[10px] font-black text-[#5a5e62] uppercase tracking-[0.2em]">Actividad Reciente</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-3 lg:overflow-y-auto lg:max-h-32 pr-1 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="col-span-full py-5 border border-dashed border-[#4a4948]/40 rounded-xl text-center bg-[#0a0a0a]/50">
                                <p className="text-[#5a5e62] text-[10px] sm:text-xs font-semibold">Esperando lecturas de inventario...</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 lg:p-2.5 bg-[#0a0a0a] rounded-lg border border-[#4a4948]/50 hover:border-[#42a636] transition-colors shadow-sm">
                                    <div className="overflow-hidden pr-2 min-w-0">
                                        <div className="font-mono text-[#02ad02] text-[9px] lg:text-[10px] font-bold">{item.ean}</div>
                                        <div className="font-bold text-[10px] lg:text-xs text-slate-200 mt-0.5 truncate">{item.fullName}</div>
                                    </div>
                                    <div className="bg-[#42a636]/10 text-[#02ad02] text-[9px] lg:text-[10px] px-2 py-1 rounded font-black border border-[#42a636]/30 shrink-0">
                                        {item.time}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <aside className="w-full lg:w-[320px] bg-[#1a1a1a] border-t lg:border-t-0 lg:border-l border-[#4a4948]/40 flex flex-col z-20 order-2 lg:order-1 flex-none lg:h-full">
                <div className="p-4 lg:p-5 border-b border-[#4a4948]/40 flex justify-between items-center bg-[#1a1a1a]">
                    <div>
                        <h2 className="text-base lg:text-lg font-black text-white uppercase tracking-tight">Ranking</h2>
                        <p className="text-[9px] lg:text-[10px] text-[#42a636] font-bold tracking-widest">MINUTOS GANADOS</p>
                    </div>
                    <Trophy className="text-[#42a636]" size={22} />
                </div>
                <div className="flex-1 lg:overflow-y-auto p-3 lg:p-4 space-y-2.5 custom-scrollbar">
                    {ranking.length === 0 ? (
                        <p className="text-[#5a5e62] text-[10px] text-center py-4 uppercase font-bold tracking-widest">Cargando ranking...</p>
                    ) : (
                        ranking.map((item, index) => (
                            <div key={index} className={`flex items-center justify-between p-3 lg:p-4 rounded-xl border transition-colors cursor-default ${index === 0 ? 'bg-gradient-to-r from-[#42a636]/10 to-transparent border-[#42a636]/30 shadow-md relative group hover:border-[#42a636]/60' : 'bg-[#0a0a0a] border-[#4a4948]/30 hover:border-[#5a5e62]'}`}>
                                {index === 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#42a636] rounded-l-xl"></div>}
                                <div className="flex items-center gap-3 min-w-0 pl-1">
                                    <span className={`font-black text-base w-4 text-center shrink-0 ${index === 0 ? 'text-[#42a636]' : 'text-[#5a5e62]'}`}>{index + 1}</span>
                                    <div className={`h-8 w-8 lg:h-9 lg:w-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${index === 0 ? 'bg-[#42a636]/20 border border-[#42a636] text-[#02ad02]' : 'bg-[#4a4948] text-white'}`}>
                                        {item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`font-bold text-xs lg:text-sm truncate ${index === 0 ? 'text-white' : 'text-slate-300'}`}>{item.name}</span>
                                </div>
                                <span className={`text-[9px] lg:text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${index === 0 ? 'bg-[#42a636] text-white' : 'text-slate-400'}`}>
                                    {item.minutes} MIN
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-[#0a0a0a] border-t border-[#4a4948]/40">
                    <div className="bg-[#1a1a1a] rounded-xl p-3 border border-[#4a4948]/50 mb-3">
                        <p className="text-[9px] text-[#5a5e62] font-bold uppercase tracking-widest mb-1">Tu Progreso</p>
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-semibold text-slate-400">Saldo actual</span>
                            <span className="text-xl lg:text-2xl font-black text-[#02ad02] leading-none">
                                {userTime} <span className="text-[10px] text-[#42a636]">min</span>
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-[10px] lg:text-xs font-bold text-[#5a5e62] hover:text-red-400 uppercase tracking-widest py-1.5 transition-colors">
                        <LogOut size={14} /> Desconectar
                    </button>
                </div>
            </aside>

            {/* MODAL (GLOBAL) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0a0a]/90 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-[#4a4948] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] lg:max-h-[90vh]">
                        <div className="bg-gradient-to-r from-[#42a636] to-[#02ad02] p-4 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg lg:text-xl font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> Hallazgo Detectado</h2>
                                <p className="text-white/90 text-[10px] lg:text-xs font-medium mt-0.5">EAN: <span className="font-mono bg-black/20 px-1.5 rounded">{ean}</span></p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors"><X size={16} /></button>
                        </div>

                        <div className="p-4 lg:p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] lg:text-[10px] font-bold text-[#5a5e62] uppercase mb-1.5">Producto Base *</label>
                                    <input
                                        autoFocus type="text" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}
                                        placeholder="Ej. ARROZ"
                                        className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-lg p-2.5 lg:p-3 text-white uppercase placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-xs lg:text-sm transition-colors"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-[9px] lg:text-[10px] font-bold text-[#5a5e62] uppercase mb-1.5">Marca *</label>
                                    <input
                                        type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        placeholder="Ej. DIANA"
                                        list="brands-list"
                                        className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-lg p-2.5 lg:p-3 text-white uppercase placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-xs lg:text-sm pr-10 transition-colors"
                                    />
                                    <datalist id="brands-list">
                                        {brandList.map((brand, index) => (
                                            <option key={index} value={brand} />
                                        ))}
                                    </datalist>
                                    <Search className="absolute right-3 top-[32px] lg:top-[36px] text-[#5a5e62]" size={16} />

                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[9px] lg:text-[10px] font-bold text-[#5a5e62] uppercase mb-1.5">Característica / Sabor / Variedad</label>
                                    <input
                                        type="text" value={form.char} onChange={(e) => setForm({ ...form, char: e.target.value })}
                                        placeholder="Ej. INTEGRAL PREMIUM"
                                        className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-lg p-2.5 lg:p-3 text-white uppercase placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-xs lg:text-sm transition-colors"
                                    />
                                </div>
                                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#4a4948]/40 flex gap-3">
                                    <div className="w-1/2">
                                        <label className="block text-[9px] font-bold text-[#5a5e62] uppercase mb-1">Contenido (Numérico)</label>
                                        <input
                                            type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                                            placeholder="Ej. 500"
                                            className="w-full bg-[#1a1a1a] border border-[#4a4948] rounded-md p-2 text-white placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-center text-xs transition-colors"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-[9px] font-bold text-[#5a5e62] uppercase mb-1">Unidad Medida</label>
                                        <select
                                            value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                            className="w-full bg-[#1a1a1a] border border-[#4a4948] rounded-md p-2 text-white focus:outline-none focus:border-[#42a636] text-xs font-bold transition-colors cursor-pointer"
                                        >
                                            <option value="">N/A</option>
                                            <option value="GR">GR</option>
                                            <option value="KG">KG</option>
                                            <option value="ML">ML</option>
                                            <option value="LTS">LTS</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0a] p-3 rounded-xl border border-[#4a4948]/40">
                                    <label className="block text-[9px] font-bold text-[#5a5e62] uppercase mb-1">Unidad de Venta *</label>
                                    <select
                                        value={form.sales} onChange={(e) => setForm({ ...form, sales: e.target.value })}
                                        className="w-full bg-[#1a1a1a] border border-[#4a4948] rounded-md p-2 text-white focus:outline-none focus:border-[#42a636] text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        <option value="UND">UNIDAD (UND)</option>
                                        <option value="CAJA">CAJA (CJ)</option>
                                        <option value="PACK">PACK (PK)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-5 bg-[#0a0a0a] p-3 lg:p-4 rounded-xl border border-[#42a636]/40 shadow-inner relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#42a636]"></div>
                                <span className="text-[9px] font-black text-[#42a636] uppercase tracking-widest block mb-1 pl-2">Previsualización Mnemotecnia</span>
                                <p className="text-sm lg:text-lg font-mono font-bold text-white break-words pl-2 min-h-[28px]">
                                    {generateFullName() || <span className="text-[#5a5e62]/60 italic text-xs lg:text-sm font-sans">El nombre se construirá aquí...</span>}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-[#0a0a0a] border-t border-[#4a4948]/50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg text-[#5a5e62] font-bold hover:text-white hover:bg-[#1a1a1a] transition-colors text-[10px] lg:text-xs uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-5 py-2 bg-[#42a636] hover:bg-[#02ad02] text-white font-black rounded-lg text-[10px] lg:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-[#42a636]/20 disabled:opacity-70 disabled:cursor-not-allowed min-h-[36px]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : (
                                    <><Save size={14} /> Guardar Hallazgo</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
