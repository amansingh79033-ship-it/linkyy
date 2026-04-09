import React, { useState, useEffect } from 'react';
import { createWorkroom, authenticateWorkroom, workroomExists, checkWorkroomAvailability, resetPasscodeWithRecovery } from '../services/authService';
import { ShieldCheck, ArrowRight, Lock, UserCircle, FileUp, KeyRound, RefreshCcw } from 'lucide-react';

interface WorkroomProps {
  onAccessGranted: () => void;
  onBack: () => void;
}

const Workroom: React.FC<WorkroomProps> = ({ onAccessGranted, onBack }) => {
  const [codename, setCodename] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isNewUserMode, setIsNewUserMode] = useState(!workroomExists());
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPasscodeAfterRecovery, setNewPasscodeAfterRecovery] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const isCreated = workroomExists();

  // Debounced availability check
  useEffect(() => {
    if (!isNewUserMode || !codename.trim()) {
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
  }, [codename, isNewUserMode]);

  const handleUnlock = async () => {
    if (!codename.trim()) {
      setError('Please enter your codename');
      return;
    }
    if (!passcode || (passcode.length < 4)) {
      setError('Passcode must be at least 4 digits');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      // Actual authentication with proper security
      const result = await authenticateWorkroom(codename, passcode);
      
      if (result.success) {
        // Success - redirect to workspace
        onAccessGranted();
      } else {
        setError(result.message);
        setPasscode('');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Check if it's a network error (mobile/offline issue)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setError('Connection failed. Please check your internet connection and try again.');
      } else {
        setError('Authentication failed. Please check your credentials and try again.');
      }
      setPasscode('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNew = async () => {
    if (!codename.trim()) {
      setError('Please enter a workroom codename');
      return;
    }
    if (!passcode || (passcode.length < 4)) {
      setError('Passcode must be at least 4 digits');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match');
      return;
    }

    setIsCreating(true);
    setError('');
    
    try {
      // Actual workroom creation with secure hashing
      const result = await createWorkroom(codename, passcode);
      
      if (result.success) {
        // Success - redirect to workspace
        onAccessGranted();
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Workroom creation error:', error);
      // Check if it's a network error (mobile/offline issue)
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        setError('Connection failed. Please check your internet connection and try again.');
      } else {
        setError('Failed to create workroom. Please check if the codename is already taken and try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRecoveryKey(content);
    };
    reader.readAsText(file);
  };

  const handleRecovery = async () => {
    if (!codename.trim() || !recoveryKey || !newPasscodeAfterRecovery) {
      setError('Please provide codename, recovery file and new passcode');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const result = await resetPasscodeWithRecovery(codename, recoveryKey, newPasscodeAfterRecovery);
      if (result.success) {
        setRecoverySuccess(true);
        setTimeout(() => {
          setIsRecoveryMode(false);
          setRecoverySuccess(false);
          setPasscode(newPasscodeAfterRecovery);
          setConfirmPasscode(newPasscodeAfterRecovery);
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Recovery failed');
    } finally {
      setIsCreating(false);
    }
  };

  const isUnlockFormValid = codename.trim() && passcode.length >= 4;
  const isCreateFormValid = codename.trim() && 
                           passcode.length >= 4 && 
                           confirmPasscode.length >= 4 && 
                           passcode === confirmPasscode;
  const isRecoveryFormValid = codename.trim() && recoveryKey && newPasscodeAfterRecovery.length >= 4;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6 font-inter selection:bg-sky-500/30 safe-area-top">
      {/* Premium Glass Card - Mobile Optimized */}
      <div className="w-full max-w-[440px] bg-[#0a0a0a] border border-sky-500/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 shadow-[0_0_50px_-12px_rgba(56,189,248,0.15)] relative overflow-hidden group">
        
        {/* Animated Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

        {/* Header Icon */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sky-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
          </div>
        </div>

        {/* Title & Brand Tagline */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
             <span className="h-px w-4 sm:w-8 bg-sky-500/30" />
             <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-sky-400/80">Linkyy Security</span>
             <span className="h-px w-4 sm:w-8 bg-sky-500/30" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
             {isCreated && !isNewUserMode ? 'Welcome Back' : (isNewUserMode ? 'Create Your Workroom' : 'Secure Access')}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm font-medium">
             {isCreated && !isNewUserMode 
               ? 'Enter your credentials to access your workroom' 
               : (isNewUserMode 
                 ? 'Set up your secure creative space' 
                 : 'Access your existing workroom or create a new one')}
          </p>
        </div>

        {/* Interactive Form */}
        <form onSubmit={(e) => { e.preventDefault(); isCreated && !isNewUserMode ? handleUnlock() : handleCreateNew(); }} className="space-y-6 sm:space-y-8">
          
          {/* Codename Field */}
          <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                      {isCreated && !isNewUserMode ? 'YOUR CODENAME' : 'WORKROOM CODENAME'}
                    </label>
                    <div className="flex items-center gap-2">
                        {isChecking && <div className="w-3 h-3 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />}
                        {isAvailable === true && <span className="text-[8px] text-green-400 font-bold">AVAILABLE</span>}
                        {isAvailable === false && <span className="text-[8px] text-red-500 font-bold">NAME TAKEN</span>}
                        <UserCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400/30" />
                    </div>
                </div>
                <input 
                  type="text"
                  value={codename}
                  onChange={(e) => { setCodename(e.target.value.replace(/[^a-zA-Z0-9]/g, '')); setError(''); }}
                  placeholder={isCreated && !isNewUserMode ? "Enter your codename" : "Choose a unique codename"}
                  className={`w-full bg-neutral-900/50 border rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-base sm:text-lg placeholder:text-neutral-700 focus:outline-none focus:ring-4 transition-all touch-target ${
                    isAvailable === false 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-neutral-800 focus:border-sky-400 focus:ring-sky-400/10'
                  }`}
                />
          </div>

          {/* Passcode Field */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <label className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                  {isCreated && !isNewUserMode ? 'PASSCODE' : 'SET PASSCODE'}
                </label>
                <button 
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="text-[8px] sm:text-[10px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-[0.1em] transition-colors"
                >
                  {showPasscode ? 'Hide' : 'Show'}
                </button>
            </div>
            <input 
              type={showPasscode ? "text" : "password"}
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="••••"
              maxLength={8}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] text-center placeholder:text-neutral-800 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all font-mono touch-target"
            />
          </div>

          {/* Confirm Passcode (New Users Only) */}
          {(isNewUserMode || !isCreated) && (
            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                    CONFIRM PASSCODE
                    </label>
                </div>
                <input 
                type={showPasscode ? "text" : "password"}
                value={confirmPasscode}
                onChange={(e) => { setConfirmPasscode(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="••••"
                maxLength={8}
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-white text-xl sm:text-2xl tracking-[0.3em] sm:tracking-[0.5em] text-center placeholder:text-neutral-800 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-mono touch-target"
                />
            </div>
          )}

          {/* Error Message */}
          {error && (
             <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>
          )}

          {/* Action Buttons */}
          {isRecoveryMode ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-3">
                <label className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-widest">Upload Recovery Key (.txt)</label>
                <div className="relative group">
                   <input 
                     type="file" 
                     accept=".txt"
                     onChange={handleFileUpload}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 flex flex-col items-center justify-center gap-2 group-hover:border-sky-400/50 transition-all border-dashed">
                      <FileUp className={`w-6 h-6 ${recoveryKey ? 'text-green-400' : 'text-neutral-500'}`} />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">
                        {recoveryKey ? 'RECOVERY KEY LOADED' : 'CHOOSE RECOVERY FILE'}
                      </span>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-widest">New Passcode</label>
                <input 
                  type="password"
                  value={newPasscodeAfterRecovery}
                  onChange={(e) => setNewPasscodeAfterRecovery(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  maxLength={8}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 text-center text-white text-2xl tracking-[0.5em] font-mono focus:border-sky-400 outline-none"
                />
              </div>

              {recoverySuccess ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 py-4 rounded-2xl flex items-center justify-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  <span className="font-black">PASSCODE RESET!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRecovery}
                  disabled={isCreating || !isRecoveryFormValid}
                  className="w-full py-5 bg-sky-400 hover:bg-sky-300 disabled:opacity-20 text-black font-black text-lg rounded-[24px] transition-all shadow-lg shadow-sky-400/20"
                >
                  {isCreating ? 'RESETTING...' : 'RESET PASSCODE'}
                </button>
              )}

              <button 
                type="button" 
                onClick={() => setIsRecoveryMode(false)}
                className="w-full text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest"
              >
                Back to Login
              </button>
            </div>
          ) : !isNewUserMode ? (
            // Unlock Mode
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleUnlock}
                disabled={isCreating || !isUnlockFormValid}
                className="w-full py-4 sm:py-5 bg-sky-400 hover:bg-sky-300 disabled:opacity-20 disabled:grayscale text-black font-black text-base sm:text-lg rounded-[20px] sm:rounded-[24px] transition-all transform active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(56,189,248,0.7)] touch-target duration-200"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2 sm:gap-3 py-1">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Verifying...</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">ACCESS WORKROOM</span>
                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-between px-1">
                 <button 
                   type="button"
                   onClick={() => setIsRecoveryMode(true)}
                   className="text-[10px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest transition-colors"
                 >
                   Forgot Passcode?
                 </button>
                 <button 
                   type="button"
                   onClick={() => setIsNewUserMode(true)}
                   className="text-[10px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest transition-colors"
                 >
                   Need a Workroom?
                 </button>
              </div>
            </div>
          ) : (
            // Create Mode
            <div className="space-y-4">
               <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={isCreating || !isCreateFormValid}
                  className="w-full py-4 sm:py-5 bg-sky-400 hover:bg-sky-300 disabled:opacity-20 disabled:grayscale text-black font-black text-base sm:text-lg rounded-[20px] sm:rounded-[24px] transition-all transform active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_-10px_rgba(56,189,248,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(56,189,248,0.7)] touch-target duration-200"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2 sm:gap-3 py-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Initializing...</span>
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">CREATE WORKROOM</span>
                      <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </>
                  )}
                </button>
                <div className="text-center">
                   <button 
                     type="button"
                     onClick={() => setIsNewUserMode(false)}
                     className="text-[10px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-widest transition-colors"
                   >
                     Already have a workroom? Login
                   </button>
                </div>
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-neutral-900 text-center space-y-3 sm:space-y-4">
            <p className="text-[8px] sm:text-[10px] text-neutral-600 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                Edge Encryption Enabled • Made in Bihar 🙏
            </p>
            <button 
                onClick={onBack}
                className="text-[8px] sm:text-[10px] font-black text-neutral-500 hover:text-sky-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all touch-target"
            >
                ← Return to Launch
            </button>
        </div>
      </div>
    </div>
  );
};

export default Workroom;
