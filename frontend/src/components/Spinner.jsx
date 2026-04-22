import React from 'react';

const Spinner = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-[#42a636] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold text-[#42a636] uppercase tracking-widest">Procesando...</span>
        </div>
    );
};

export default Spinner;
