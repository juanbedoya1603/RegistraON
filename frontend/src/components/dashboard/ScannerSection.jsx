import React from 'react';
import { Scan, Keyboard, Barcode } from 'lucide-react';

const ScannerSection = ({ ean, setEan, handleScan, isValidating, scannerRef }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 z-10 min-h-[40dvh] lg:min-h-0">
            <div className="w-full max-w-xl text-center">
                <div className="mb-6 lg:mb-8 relative flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 mb-6">
                        {/* Fondo suave y marco de cristal */}
                        <div className="absolute inset-0 bg-[#42a636]/5 rounded-xl border border-[#4a4948]/20 backdrop-blur-sm"></div>
                        
                        {/* Esquinas de mira del escáner (Sniper corners) */}
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#42a636] rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#42a636] rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#42a636] rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#42a636] rounded-br-xl"></div>

                        {/* Línea Láser Animada */}
                        <div className="absolute w-[70%] h-[2px] bg-[#02ad02] shadow-[0_0_12px_3px_rgba(2,173,2,0.8)] z-20 animate-scan rounded-full"></div>

                        {/* Icono de Código de Barras base */}
                        <Barcode className="text-[#5a5e62] relative z-10 opacity-70" size={48} strokeWidth={1} />
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
    );
};

export default ScannerSection;
