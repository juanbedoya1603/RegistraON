import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const App = () => {
    const [view, setView] = useState('login');
    const [cedula, setCedula] = useState('');
    const [userName, setUserName] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    const showToast = (message, type, duration = 3000) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), duration);
    };

    const onLoginSuccess = (userCedula, name) => {
        setCedula(userCedula);
        setUserName(name);
        setView('dashboard');
    };

    return (
        <div className="font-sans">
            {view === 'login' ? (
                <LoginPage 
                    cedula={cedula} 
                    setCedula={setCedula} 
                    onLoginSuccess={onLoginSuccess}
                    showToast={showToast}
                />
            ) : (
                <DashboardPage 
                    cedula={cedula} 
                    userName={userName}
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
