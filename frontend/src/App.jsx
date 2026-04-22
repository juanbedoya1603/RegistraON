import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const App = () => {
    const [view, setView] = useState('login');
    const [cedula, setCedula] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (cedula.length < 5) {
            showToast('Ingrese una cédula válida', 'error');
            return;
        }

        setIsLoggingIn(true);
        try {
            const response = await fetch(`http://localhost:8000/api/login/${cedula}`);
            if (response.ok) {
                const data = await response.json();
                showToast(`Bienvenido, ${data.user.name}`, 'success');
                setView('dashboard');
            } else if (response.status === 404) {
                showToast('Cédula no autorizada', 'error');
            } else {
                showToast('Acceso denegado', 'error');
            }
        } catch {
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="font-sans">
            {view === 'login' ? (
                <LoginPage 
                    cedula={cedula} 
                    setCedula={setCedula} 
                    handleLogin={handleLogin}
                    isLoggingIn={isLoggingIn}
                />
            ) : (
                <DashboardPage 
                    cedula={cedula} 
                    setCedula={setCedula}
                    setView={setView} 
                    showToast={showToast} 
                />
            )}

            {/* TOAST (GLOBAL) */}
            {toast.show && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl border transition-all duration-300 transform scale-100 ${toast.type === 'error' ? 'bg-[#1a1a1a] border-red-500' : 'bg-[#1a1a1a] border-[#42a636]'} text-white`}>
                    {toast.type === 'error' ? <AlertCircle className="text-red-500" size={16} /> : <CheckCircle2 className="text-[#42a636]" size={16} />}
                    <span className="font-bold text-[10px] lg:text-xs">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default App;
