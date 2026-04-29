import React from 'react';
import { PlayCircle } from 'lucide-react';

const Header = ({ userName, setShowVideo }) => {
    return (
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

            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#42a636]"></div>
                <span className="text-[10px] lg:text-xs font-black text-slate-300 uppercase tracking-[0.3em]">
                    {userName}
                </span>
                <div className="h-1.5 w-1.5 rounded-full bg-[#42a636]"></div>
            </div>

            <button 
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-1.5 bg-[#42a636]/10 hover:bg-[#42a636]/20 px-3 py-1.5 rounded-full border border-[#42a636]/30 transition-colors cursor-pointer group"
            >
                <PlayCircle size={14} className="text-[#42a636] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] sm:text-[10px] font-bold text-[#42a636] uppercase tracking-widest">Tutorial</span>
            </button>
        </header>
    );
};

export default Header;
