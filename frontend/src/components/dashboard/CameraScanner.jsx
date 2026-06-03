import React, { useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const CameraScanner = ({ onDetected, onClose }) => {
    // Referencia para no re-ejecutar el useEffect si cambia onDetected
    const onDetectedRef = useRef(onDetected);

    useEffect(() => {
        onDetectedRef.current = onDetected;
    }, [onDetected]);

    useEffect(() => {
        let isMounted = true;
        const readerId = 'camera-scanner-reader';
        const scanner = new Html5Qrcode(readerId);
        let initTimer;

        const startCamera = async () => {
            try {
                await scanner.start(
                    { facingMode: 'environment' },
                    { 
                        fps: 10, 
                        qrbox: { width: 250, height: 150 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        if (isMounted) onDetectedRef.current(decodedText);
                    },
                    () => { /* Ignorar frames vacíos */ }
                );
            } catch (err) {
                // Solo logueamos si el componente sigue vivo. 
                // Esto silencia los errores del desmontaje fantasma.
                if (isMounted) {
                    console.warn('Advertencia de inicialización de cámara:', err);
                }
            }
        };

        // EL TRUCO: Retrasamos el encendido 50ms. 
        // Esto le da tiempo a React de hacer su ciclo falso de StrictMode sin tocar el hardware.
        initTimer = setTimeout(() => {
            if (isMounted) startCamera();
        }, 50);

        // CLEANUP SILENCIOSO
        return () => {
            isMounted = false;
            clearTimeout(initTimer); // Cancelamos el encendido si React desmontó muy rápido
            try {
                if (scanner.getState() === 2) {
                    scanner.stop().then(() => {
                        try { scanner.clear(); } catch(e) {} // Forzamos limpieza silenciosa
                    }).catch(() => {});
                } else {
                    try { scanner.clear(); } catch(e) {}
                }
            } catch (error) {
                // Silencio total
            }
        };
    }, []);

    return (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
            {/* Marco estético del escáner */}
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-[#42a636]/60 shadow-[0_0_30px_rgba(66,166,54,0.15)] bg-black">
                {/* Esquinas decorativas estilo mira */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#42a636] rounded-tl-2xl z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#42a636] rounded-tr-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#42a636] rounded-bl-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#42a636] rounded-br-2xl z-20 pointer-events-none"></div>

                {/* Etiqueta superior */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="bg-[#42a636]/20 text-[#42a636] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#42a636]/30 backdrop-blur-sm">
                        Cámara activa
                    </span>
                </div>

                {/* Contenedor del lector de cámara */}
                <div id="camera-scanner-reader" className="w-full aspect-square object-cover"></div>
            </div>

            {/* Botón para cerrar / cancelar */}
            <button
                onClick={onClose}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 uppercase tracking-widest"
            >
                <XCircle size={18} />
                Cancelar Cámara
            </button>
        </div>
    );
};

export default CameraScanner;