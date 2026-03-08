import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-[#2E2E2E]/10 backdrop-blur-xl" 
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-2xl rounded-[4rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-400 border border-[#EEF5F4]">
        <header className="p-10 pb-4 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-[#2E2E2E] font-display leading-tight">{title}</h3>
            <div className="h-1.5 w-16 bg-[#4E8B83] rounded-full"></div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#3B3B3B]/15 hover:text-[#4E8B83] hover:bg-[#EEF5F4] transition-all border border-[#EEF5F4] text-xl font-bold shadow-sm"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-10 pt-4 leading-relaxed text-[#3B3B3B] scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;