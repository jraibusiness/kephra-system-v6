import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FormData, Language } from './types';
import { Step1Contact, Step2Date, Step3Location, Step4Vision, Step5Music, Step6Special } from './components/Steps';
import { ArrowRight, ArrowLeft, Check, Music, Globe } from 'lucide-react';
import { TRANSLATIONS } from './constants';

// ------------------------------------------------------------------
// CONFIGURAÇÃO / CONFIGURATION
// ------------------------------------------------------------------
// COLE A URL DO SEU GOOGLE APPS SCRIPT DENTRO DAS ASPAS ABAIXO:
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL INSIDE THE QUOTES BELOW:
const GOOGLE_SCRIPT_URL = "INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE"; 
// ------------------------------------------------------------------

const TOTAL_STEPS = 6;

const INITIAL_DATA: FormData = {
  fullName: '',
  whatsapp: '',
  email: '',
  dateRange: '',
  city: '',
  church: '',
  customLocation: '',
  budget: '',
  vision: '',
  musicStyles: [], // Array of strings
  specialSong: ''
};

const BackgroundEffect = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Deep blue base */}
    <div className="absolute inset-0 bg-[#000030]"></div>
    
    {/* Radial gradient center light */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-radial-gradient from-[#001060] to-transparent opacity-60 blur-3xl rounded-full"></div>
    
    {/* Rays effect using gradients and rotation */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#1e3a8a_20deg,transparent_40deg,#1e3a8a_60deg,transparent_80deg,#1e3a8a_100deg,transparent_120deg)] animate-[spin_60s_linear_infinite]"></div>
    </div>
    
    {/* Noise overlay for texture */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
  </div>
);

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');

  const t = TRANSLATIONS[language];

  const updateData = (fields: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_DATA);
    setCurrentStep(1);
    setIsSuccess(false);
    setIsSubmitting(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pt' ? 'en' : 'pt');
    // Optional: Reset form or options if language switches to prevent validation errors with translated values?
    // For now, we keep data, but logic in components handles translation mismatches where possible.
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.fullName && formData.whatsapp.length >= 8 && !!formData.email; // Reduced validation for intl phones
      case 2: return !!formData.dateRange;
      case 3: 
        if (!formData.city) return false;
        // Check dynamic "Outra"/"Other" value
        const otherVal = TRANSLATIONS[language].other; 
        
        if (formData.city === otherVal || !['Santos', 'São Vicente', 'Praia Grande', 'Guarujá'].includes(formData.city)) {
             return !!formData.customLocation;
        }
        
        return formData.church === otherVal ? !!formData.customLocation : !!formData.church;
      case 4: return !!formData.budget; 
      case 5: return (formData.musicStyles || []).length > 0; // Require at least one style
      default: return true;
    }
  };

  const handleSubmit = async () => {
    if (GOOGLE_SCRIPT_URL === "INSERT_YOUR_GOOGLE_SCRIPT_URL_HERE") {
      alert(language === 'pt' 
        ? "Configuração Necessária: Crie a planilha do Google, gere o link do Script e cole no código (App.tsx) linha 12." 
        : "Setup Required: Create the Google Sheet, generate the Script link and paste it in code (App.tsx) line 12.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Using 'no-cors' mode and text/plain to avoid CORS preflight issues typical with GAS
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(formData),
      });

      // Since 'no-cors' returns an opaque response, we assume success if no network error occurred.
      // We add a small delay for UI smoothness.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro no envio:", error);
      alert(language === 'pt' 
        ? "Ocorreu um erro ao enviar seus dados. Verifique sua conexão e tente novamente."
        : "An error occurred while sending your data. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <BackgroundEffect />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl"
        >
          <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-400/30">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-script text-5xl mb-4 text-white">{t.successTitle}</h1>
          <p className="text-blue-100 mb-8 font-light leading-relaxed">
            {t.successMessage}
          </p>
          <button 
            onClick={handleReset}
            className="bg-white text-[#000040] px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors w-full uppercase tracking-widest text-sm"
          >
            {t.backHome}
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 md:p-6">
      <BackgroundEffect />

      {/* Language Toggle - Absolute Position Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 transition-all text-sm font-medium"
        >
          <Globe className="w-4 h-4 text-blue-200" />
          <span className={language === 'pt' ? 'text-white' : 'text-blue-200'}>PT</span>
          <span className="text-white/20">|</span>
          <span className={language === 'en' ? 'text-white' : 'text-blue-200'}>EN</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col min-h-[600px]">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="font-script text-6xl md:text-7xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {t.title}
          </h1>
          <p className="text-blue-200 tracking-[0.3em] text-xs md:text-sm mt-2 font-medium uppercase">
            {t.subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#000020]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative flex-grow">
          
          {/* Progress Bar */}
          <div className="h-1 bg-white/5 w-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-6 md:p-8 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-6 text-xs text-blue-300 font-medium tracking-widest uppercase">
              <span>{t.stepCounter} {currentStep} {t.of} {TOTAL_STEPS}</span>
              <Music className="w-4 h-4 opacity-50" />
            </div>

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {currentStep === 1 && <Step1Contact key="step1" formData={formData} updateData={updateData} language={language} />}
                {currentStep === 2 && <Step2Date key="step2" formData={formData} updateData={updateData} language={language} />}
                {currentStep === 3 && <Step3Location key="step3" formData={formData} updateData={updateData} language={language} />}
                {currentStep === 4 && <Step4Vision key="step4" formData={formData} updateData={updateData} language={language} />}
                {currentStep === 5 && <Step5Music key="step5" formData={formData} updateData={updateData} language={language} />}
                {currentStep === 6 && <Step6Special key="step6" formData={formData} updateData={updateData} language={language} />}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center text-sm font-medium transition-colors ${
                  currentStep === 1 
                    ? 'text-white/20 cursor-not-allowed' 
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
              </button>

              <button
                onClick={handleNext}
                disabled={!validateStep(currentStep) || isSubmitting}
                className={`
                  flex items-center px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300
                  ${!validateStep(currentStep) || isSubmitting
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-[#000040] hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  }
                `}
              >
                {isSubmitting ? (
                  t.sending
                ) : currentStep === TOTAL_STEPS ? (
                  t.submit
                ) : (
                  <>{t.next} <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-blue-400/40 text-[10px] mt-6 tracking-wider">
          &copy; {new Date().getFullYear()} {t.copyright}
        </p>
      </div>
    </div>
  );
};

export default App;