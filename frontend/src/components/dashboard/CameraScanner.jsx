import React, { useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const CameraScanner = ({ onDetected, onClose }) => {
    // Referencia para no re-ejecutar el useEffect si cambia onDetected
    const onDetectedRef = useRef(onDetected);
    const lastScannedRef = useRef(null);
    const matchCountRef = useRef(0);
    const REQUIRED_MATCHES = 3;

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
                        aspectRatio: 1.0,
                        formatsToSupport: [ 
                          Html5QrcodeSupportedFormats.EAN_13,
                          Html5QrcodeSupportedFormats.EAN_8,
                          Html5QrcodeSupportedFormats.UPC_A,
                          Html5QrcodeSupportedFormats.UPC_E 
                        ]
                    },
                    (decodedText) => {
                        if (isMounted) {
                            if (decodedText === lastScannedRef.current) {
                                matchCountRef.current += 1;
                                
                                if (matchCountRef.current >= REQUIRED_MATCHES) {
                                    onDetectedRef.current(decodedText);
                                    // Resetear para evitar ráfagas del mismo código
                                    lastScannedRef.current = null; 
                                    matchCountRef.current = 0;
                                }
                            } else {
                                // Reiniciar conteo porque el código cambió
                                lastScannedRef.current = decodedText;
                                matchCountRef.current = 1;
                            }
                        }
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
        // Agregamos shrink-0 para que Flexbox no lo aplaste y my-2 para los márgenes
        <div className="w-full flex flex-col items-center animate-fade-in my-2 shrink-0">
            
            {/* Redujimos el ancho máximo en portátiles (md) a 340px para evitar el desbordamiento vertical */}
            <div className="relative w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] mx-auto rounded-2xl overflow-hidden border-2 border-[#42a636]/80 shadow-[0_0_20px_rgba(66,166,54,0.2)] bg-black shrink-0">
                
                {/* Esquinas decorativas estilo mira (Ajustadas a 24px para marcos más pequeños) */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#42a636] rounded-tl-2xl z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#42a636] rounded-tr-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#42a636] rounded-bl-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#42a636] rounded-br-2xl z-20 pointer-events-none"></div>

                {/* Etiqueta superior */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="bg-black/80 text-[#42a636] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#42a636]/50 backdrop-blur-md shadow-lg">
                        Cámara Activa
                    </span>
                </div>

                {/* Contenedor del lector de cámara (forzando al video a no deformarse) */}
                <div id="camera-scanner-reader" className="w-full bg-black [&_video]:w-full [&_video]:h-auto [&_video]:block"></div>
            </div>
        </div>
    );
};

export default CameraScanner;