import React, { useState, useEffect } from 'react';
import { createWorkroom, authenticateWorkroom, checkWorkroomAvailability, resetPasscodeWithRecovery } from '../services/authService';
import { ShieldCheck, ArrowRight, Lock, UserCircle, FileUp, KeyRound, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (codename: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [codename, setCodename] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'recovery'>('login');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPasscodeAfterRecovery, setNewPasscodeAfterRecovery] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Debounced availability check
  useEffect(() => {
    if (mode !== 'signup' || !codename.trim()) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const available = !(await checkWorkroomAvailability(codename));
      setIsAvailable(available);
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [codename, mode]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!codename.trim() || passcode.length < 4) {
      setError('Invalid credentials');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await authenticateWorkroom(codename, passcode);
      if (result.success) {
        onAuthSuccess(codename);
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!codename.trim() || passcode.length < 4 || passcode !== confirmPasscode) {
      setError('Please check your inputs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createWorkroom(codename, passcode);
      if (result.success) {
        onAuthSuccess(codename);
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setRecoveryKey(event.target?.result as string);
    reader.readAsText(file);
  };

  const handleRecovery = async () => {
    if (!codename.trim() || !recoveryKey || newPasscodeAfterRecovery.length < 4) {
      setError('Provide codename, file and new passcode');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await resetPasscodeWithRecovery(codename, recoveryKey, newPasscodeAfterRecovery);
      if (result.success) {
        setRecoverySuccess(true);
        setTimeout(() => {
          setRecoverySuccess(false);
          setMode('login');
          setPasscode(newPasscodeAfterRecovery);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-sky-500/20 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/20 rotate-3">
            <Lock className="w-7 h-7 text-black" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Linkyy' : 'Account Recovery'}
          </h2>
          <p className="text-neutral-500 text-xs">
            {mode === 'login' ? 'Access your private creative lab' : mode === 'signup' ? 'Start your high-retention journey' : 'Restore access using your recovery file'}
          </p>
        </div>

        <div className="space-y-5">
          {mode !== 'recovery' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Codename</label>
                  {mode === 'signup' && isChecking && <div className="w-3 h-3 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />}
                  {mode === 'signup' && isAvailable === true && <span className="text-[8px] text-green-400 font-bold">AVAILABLE</span>}
                  {mode === 'signup' && isAvailable === false && <span className="text-[8px] text-red-500 font-bold">TAKEN</span>}
                </div>
                <input 
                  type="text"
                  value={codename}
                  onChange={(e) => setCodename(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white placeholder:text-neutral-700 focus:border-sky-400 outline-none transition-all"
                  placeholder="e.g. ghostrunner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Passcode</label>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white text-center text-xl tracking-[0.5em] font-mono focus:border-sky-400 outline-none"
                  placeholder="••••"
                  maxLength={8}
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Confirm Passcode</label>
                  <input 
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3.5 text-white text-center text-xl tracking-[0.5em] font-mono focus:border-sky-400 outline-none"
                    placeholder="••••"
                    maxLength={8}
                  />
                </div>
              )}
            </>
          )}

          {mode === 'recovery' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Codename</label>
                <input 
                  type="text"
                  value={codename}
                  onChange={(e) => setCodename(e.target.value.toLowerCase())}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-sky-400 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Upload Recovery Key (.txt)</label>
                <div className="relative border-2 border-dashed border-neutral-800 hover:border-sky-400/50 rounded-xl p-6 transition-all">
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="flex flex-col items-center gap-2">
                    <FileUp className={`w-6 h-6 ${recoveryKey ? 'text-green-400' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-bold text-neutral-500">{recoveryKey ? 'FILE LOADED' : 'CHOOSE .TXT FILE'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-sky-400 uppercase tracking-widest">New Passcode</label>
                <input 
                  type="password"
                  value={newPasscodeAfterRecovery}
                  onChange={(e) => setNewPasscodeAfterRecovery(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center text-xl tracking-widest font-mono"
                  placeholder="••••"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-[10px] font-bold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

          <button
            onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleRecovery}
            disabled={loading || (mode === 'signup' && passcode !== confirmPasscode)}
            className="w-full py-4 bg-sky-400 hover:bg-sky-300 disabled:opacity-20 text-black font-black rounded-2xl transition-all shadow-lg shadow-sky-400/20 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : mode === 'login' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>CREATE ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <span>RESTORE ACCOUNT</span>
            )}
          </button>

          <div className="flex items-center justify-between mt-4">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('signup')} className="text-[9px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest">Join Lab</button>
                <button onClick={() => setMode('recovery')} className="text-[9px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest">Lost Access?</button>
              </>
            ) : (
              <button onClick={() => setMode('login')} className="w-full text-[9px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest text-center">Back to Sign In</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
