import React from 'react';
import { CheckCircle2, HelpCircle, X, Search, Save } from 'lucide-react';

const ProductModal = ({
    showGuide, setShowGuide, setShowModal, ean, form, setForm,
    filteredProducts, brandList, isNoMeasure, generateFullName, handleSave, isLoading
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0a0a]/90 backdrop-blur-sm">
            <div className={`bg-[#1a1a1a] border border-[#4a4948] rounded-2xl w-full ${showGuide ? 'max-w-5xl' : 'max-w-3xl'} overflow-hidden shadow-2xl flex flex-col max-h-[95vh] lg:max-h-[90vh] relative transition-all duration-300`}>
                <div className="bg-gradient-to-r from-[#42a636] to-[#02ad02] p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg lg:text-xl font-black text-white flex items-center gap-2"><CheckCircle2 size={20} /> Hallazgo Detectado</h2>
                        <p className="text-white/90 text-[10px] lg:text-xs font-medium mt-0.5">EAN: <span className="font-mono bg-black/20 px-1.5 rounded">{ean}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowGuide(!showGuide)} className="bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-lg transition-colors text-[10px] lg:text-xs font-bold flex items-center gap-1.5">
                            <HelpCircle size={16} /> {showGuide ? 'Ocultar Guía' : 'Ver Guía'}
                        </button>
                        <button onClick={() => { setShowModal(false); setShowGuide(false); }} className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-lg transition-colors"><X size={16} /></button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Columna Izquierda: Formulario */}
                    <div className="p-4 lg:p-6 overflow-y-auto custom-scrollbar flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] lg:text-[10px] font-bold text-[#5a5e62] uppercase mb-1.5">Producto Base *</label>
                                <div className="relative">
                                    <input
                                        autoFocus 
                                        type="text" 
                                        value={form.product} 
                                        onChange={(e) => setForm({ ...form, product: e.target.value })}
                                        placeholder="Ej. ARROZ"
                                        list={form.product.length >= 2 ? "products-base-list" : undefined}
                                        className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-lg p-2.5 lg:p-3 text-white uppercase placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-xs lg:text-sm transition-colors pr-10"
                                    />
                                    {form.product.length >= 2 && (
                                        <datalist id="products-base-list">
                                            {filteredProducts.map((prod, index) => (
                                                <option key={index} value={prod} />
                                            ))}
                                        </datalist>
                                    )}
                                    <Search className="absolute right-3 top-[10px] lg:top-[12px] text-[#5a5e62]" size={16} />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[9px] lg:text-[10px] font-bold text-[#5a5e62] uppercase mb-1.5">Marca *</label>
                                <input
                                    type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                    placeholder="Ej. DIANA"
                                    list={form.brand.length >= 2 ? "brands-list" : undefined}
                                    className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-lg p-2.5 lg:p-3 text-white uppercase placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-xs lg:text-sm pr-10 transition-colors"
                                />
                                {/* Renderizado condicional: Solo existe en el DOM si hay 2+ letras */}
                                {form.brand.length >= 2 && (
                                    <datalist id="brands-list">
                                        {brandList.map((brand, index) => (
                                            <option key={index} value={brand} />
                                        ))}
                                    </datalist>
                                )}
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
                                    <label className="block text-[9px] font-bold text-[#5a5e62] uppercase mb-1">Contenido {isNoMeasure ? '(No Aplica)' : '*'}</label>
                                    <input
                                        type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                                        placeholder={isNoMeasure ? "N/A" : "Ej. 500"}
                                        disabled={isNoMeasure}
                                        className={`w-full bg-[#1a1a1a] border border-[#4a4948] rounded-md p-2 text-white placeholder-[#5a5e62]/60 focus:outline-none focus:border-[#42a636] text-center text-xs transition-colors ${isNoMeasure ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-[9px] font-bold text-[#5a5e62] uppercase mb-1">Unidad Medida {isNoMeasure ? '' : '*'}</label>
                                    <select
                                        value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        disabled={isNoMeasure}
                                        className={`w-full bg-[#1a1a1a] border border-[#4a4948] rounded-md p-2 text-white focus:outline-none focus:border-[#42a636] text-xs font-bold transition-colors cursor-pointer ${isNoMeasure ? 'opacity-30 cursor-not-allowed' : ''}`}
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

                    {/* Columna Derecha: Guía Detallada */}
                    {showGuide && (
                        <div className="w-full md:w-[340px] lg:w-[400px] bg-[#050505] md:border-l border-t md:border-t-0 border-[#4a4948]/50 p-5 lg:p-6 overflow-y-auto custom-scrollbar shrink-0 animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="flex items-center gap-2 mb-4 border-b border-[#4a4948]/50 pb-3">
                                <div className="p-1.5 bg-[#42a636]/20 rounded-lg"><HelpCircle size={18} className="text-[#42a636]" /></div>
                                <h3 className="font-black text-white uppercase tracking-wider text-xs lg:text-sm">Manual de Estandarización</h3>
                            </div>
                            
                            <div className="space-y-4 text-[10px] lg:text-xs text-slate-300">
                                <div>
                                    <strong className="text-white block mb-0.5">1. Producto Base</strong>
                                    <p>Nombre genérico del artículo. Úsalo en singular y sin adjetivos. <br/>✅ Ej: <span className="text-[#42a636] font-mono bg-[#42a636]/10 px-1 rounded">ARROZ</span>, <span className="text-[#42a636] font-mono bg-[#42a636]/10 px-1 rounded">LECHE</span>. Evita incluir marcas aquí.</p>
                                </div>
                                <div>
                                    <strong className="text-white block mb-0.5">2. Marca</strong>
                                    <p>El fabricante principal. Usa el autocompletado si está disponible. <br/>✅ Ej: <span className="text-[#42a636] font-mono bg-[#42a636]/10 px-1 rounded">DIANA</span>.</p>
                                </div>
                                <div>
                                    <strong className="text-white block mb-0.5">3. Característica (Opcional)</strong>
                                    <p>Sabor, color o variedad especial. <br/>✅ Ej: <span className="text-[#42a636] font-mono bg-[#42a636]/10 px-1 rounded">INTEGRAL</span>, <span className="text-[#42a636] font-mono bg-[#42a636]/10 px-1 rounded">ZERO LIMON</span>. Déjalo vacío si es el producto estándar.</p>
                                </div>
                                <div className="bg-[#42a636]/10 border border-[#42a636]/30 p-2.5 rounded-lg">
                                    <strong className="text-[#42a636] block mb-0.5">4. Contenido y Unidad</strong>
                                    <p className="text-white/90">Extrae el número exacto del empaque (Ej. 500) y su escala (GR, ML). <strong className="text-[#02ad02]">Obligatorio</strong> si el Producto Base es genérico.</p>
                                </div>
                                <div>
                                    <strong className="text-white block mb-0.5">5. Unidad de Venta</strong>
                                    <p>Cómo se factura en caja: <span className="text-white font-mono">UND</span> (Individual), <span className="text-white font-mono">CAJA</span> o <span className="text-white font-mono">PACK</span>.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-[#0a0a0a] border-t border-[#4a4948]/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={() => { setShowModal(false); setShowGuide(false); }}
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
    );
};

export default ProductModal;
