import React, { useState } from 'react';
import { api } from '../services/api';

const LoginPage = ({ cedula, setCedula, onLoginSuccess, showToast }) => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (cedula.length < 5) {
            showToast('Ingrese una cédula válida', 'error');
            return;
        }

        setIsLoggingIn(true);
        try {
            const data = await api.login(cedula);
            showToast(`Bienvenido, ${data.user.name}`, 'success');
            onLoginSuccess(cedula);
        } catch (error) {
            if (error.status === 404) {
                showToast('Cédula no autorizada', 'error');
            } else {
                showToast('Error de conexión con el servidor', 'error');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#42a636] rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#5a5e62] rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
            </div>

            <div className="bg-[#1a1a1a]/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-[#4a4948]/30 shadow-2xl w-full max-w-[380px] relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-1">
                        ON<span className="text-[#42a636]">OFF</span>
                    </div>
                    <p className="text-[10px] tracking-[0.2em] text-[#5a5e62] uppercase font-semibold">Tu amigo digital</p>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#42a636] to-transparent mt-3"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold text-[#5a5e62] uppercase tracking-wider mb-2 ml-1">Cédula del Operador</label>
                        <input
                            type="tel" value={cedula} onChange={(e) => setCedula(e.target.value)}
                            placeholder="Digite su documento" autoComplete="off"
                            disabled={isLoggingIn}
                            className="w-full bg-[#0a0a0a] border border-[#4a4948] rounded-xl px-4 py-3 text-white font-semibold placeholder-[#5a5e62]/50 focus:outline-none focus:border-[#42a636] focus:ring-1 focus:ring-[#42a636] transition-all text-center text-sm disabled:opacity-50"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-[#42a636] hover:bg-[#02ad02] text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(66,166,54,0.3)] hover:shadow-[0_0_25px_rgba(2,173,2,0.5)] uppercase tracking-wide text-xs sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
                    >
                        {isLoggingIn ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Validando...
                            </span>
                        ) : (
                            "Ingresar"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
