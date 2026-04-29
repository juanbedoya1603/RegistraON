import React from 'react';
import { X } from 'lucide-react';

const VideoModal = ({ setShowVideo }) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0a]/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] border border-[#4a4948] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
                {/* Cabecera del Modal */}
                <div className="bg-gradient-to-r from-[#42a636] to-[#02ad02] p-3 flex justify-between items-center">
                    <h2 className="text-white font-black uppercase tracking-wider text-sm">Tutorial de Uso: RegistraON</h2>
                    <button 
                        onClick={() => setShowVideo(false)} 
                        className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Reproductor de Video */}
                <div className="aspect-video w-full bg-black">
                    <video 
                        className="w-full h-full object-contain"
                        controls 
                        autoPlay
                        src="/tutorial.mp4" 
                    >
                        Tu navegador no soporta la reproducción de videos.
                    </video>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
