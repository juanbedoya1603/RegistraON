import React, { useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const CameraScanner = ({ onDetected, onClose }) => {
    const onDetectedRef = useRef(onDetected);
    
    // 1. LA URNA DE VOTACIÓN (Memoria a corto plazo para ignorar reflejos)
    const scanHistoryRef = useRef([]);
    const REQUIRED_VOTES = 3;
    const MAX_HISTORY = 5;

    // 2. EL ESCUDO MATEMÁTICO (Destruye alucinaciones al instante)
    const isValidEAN = (code) => {
        if (!/^\d{13}$/.test(code) && !/^\d{8}$/.test(code)) return false;
        let sum = 0;
        const multiplier = code.length === 13 ? [1, 3] : [3, 1];
        for (let i = 0; i < code.length - 1; i++) {
            sum += parseInt(code[i], 10) * multiplier[i % 2];
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(code[code.length - 1], 10);
    };

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
                        fps: 15, // Lo subimos de 10 a 15 para un poco más de agilidad
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
                            const boxWidth = viewfinderWidth * 0.75; 
                            return { 
                                width: boxWidth, 
                                height: boxWidth * 0.6 
                            };
                        },
                        // 3. SOLO EAN (Eliminamos UPC_A y UPC_E para no leer 12 dígitos falsos)
                        formatsToSupport: [ 
                          Html5QrcodeSupportedFormats.EAN_13,
                          Html5QrcodeSupportedFormats.EAN_8
                        ]
                    },
                    (decodedText) => {
                        if (isMounted) {
                            // Filtro estricto
                            if (!isValidEAN(decodedText)) return;

                            // Votación
                            scanHistoryRef.current.push(decodedText);
                            if (scanHistoryRef.current.length > MAX_HISTORY) {
                                scanHistoryRef.current.shift();
                            }

                            const votes = scanHistoryRef.current.filter(code => code === decodedText).length;
                            
                            if (votes >= REQUIRED_VOTES) {
                                onDetectedRef.current(decodedText);
                                scanHistoryRef.current = []; 
                            }
                        }
                    },
                    () => { /* Ignorar frames vacíos */ }
                );
            } catch (err) {
                if (isMounted) {
                    console.warn('Advertencia de inicialización de cámara:', err);
                }
            }
        };

        // Retrasamos el encendido 50ms (Truco de React StrictMode)
        initTimer = setTimeout(() => {
            if (isMounted) startCamera();
        }, 50);

        // CLEANUP SILENCIOSO
        return () => {
            isMounted = false;
            clearTimeout(initTimer); 
            try {
                if (scanner.getState() === 2) {
                    scanner.stop().then(() => {
                        try { scanner.clear(); } catch(e) {} 
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
        
        <div className="w-full flex flex-col items-center animate-fade-in my-2 notranslate">
            
            {/* 4. ANDAMIO CSS: Inyectamos aspect-[4/3] para evitar que colapse a 0px en PC */}
            <div className="relative w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] aspect-[4/3] max-h-[280px] md:max-h-[320px] mx-auto rounded-2xl overflow-hidden border-2 border-[#42a636]/80 shadow-[0_0_20px_rgba(66,166,54,0.2)] bg-black">
                
                {/* Esquinas decorativas */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-[#42a636] rounded-tl-2xl z-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-[#42a636] rounded-tr-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-[#42a636] rounded-bl-2xl z-20 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-[#42a636] rounded-br-2xl z-20 pointer-events-none"></div>

                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <span className="bg-black/80 text-[#42a636] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#42a636]/50 backdrop-blur-md shadow-lg">
                        Cámara Activa
                    </span>
                </div>

                <div 
                    id="camera-scanner-reader" 
                    className="w-full h-full flex items-center justify-center bg-black [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_video]:!block"
                ></div>
            </div>
        </div>
    );
};

export default CameraScanner;