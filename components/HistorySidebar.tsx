import React, { useState } from 'react';
import { X, Clock, FileText, Layers, Trash2 } from 'lucide-react';
import { GeneratedContent, ContentType } from '../types';
import { clearHistory } from '../services/storageService';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedContent[];
  onSelect: (item: GeneratedContent) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  return (
    <>
      {/* Backdrop - Mobile Optimized */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity touch-target"
          onClick={onClose}
        />
      )}

      {/* Drawer - Mobile Optimized */}
      <div className={`fixed right-0 top-0 h-full w-64 sm:w-80 bg-neutral-900 border-l border-neutral-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2 text-white">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <h2 className="font-semibold text-sm sm:text-base">History</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-sky-400/10 rounded-full text-neutral-400 hover:text-sky-400 transition touch-target">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] p-3 sm:p-4 space-y-2 sm:space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-neutral-500 mt-8 sm:mt-10 text-xs sm:text-sm">
              <p>No activity yet.</p>
              <p className="mt-1 sm:mt-2">Start creating viral content!</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => { onSelect(item); onClose(); }}
                className="bg-neutral-800/50 hover:bg-sky-400/10 border border-neutral-700/50 hover:border-sky-400/50 rounded-lg p-2.5 sm:p-3 cursor-pointer transition-all group touch-target"
              >
                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                  <div className={`p-1 rounded-md ${item.type === ContentType.POST ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-700 text-neutral-300'}`}>
                    {item.type === ContentType.POST ? <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-neutral-200 line-clamp-2 mb-1">
                  {item.type === ContentType.POST 
                    ? item.textRaw?.slice(0, 40) 
                    : item.slides?.[0]?.title}
                </h3>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs text-neutral-500">
                  <span className="text-white">Score: {item.dwellScore}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 border-t border-neutral-800 bg-neutral-900">
            <button 
              onClick={() => { clearHistory(); onClear(); }}
              className="flex items-center justify-center space-x-1.5 sm:space-x-2 w-full py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/40 rounded-lg transition-all border border-transparent hover:border-red-500/50 touch-target"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HistorySidebar;