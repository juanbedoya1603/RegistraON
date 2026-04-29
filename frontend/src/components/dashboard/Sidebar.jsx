import React from 'react';
import { Trophy, LogOut } from 'lucide-react';

const Sidebar = ({ ranking, userTime, handleLogout }) => {
    return (
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
    );
};

export default Sidebar;
