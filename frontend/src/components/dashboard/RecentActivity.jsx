import React from 'react';
import { Clock } from 'lucide-react';

const RecentActivity = ({ history }) => {
    return (
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
    );
};

export default RecentActivity;
