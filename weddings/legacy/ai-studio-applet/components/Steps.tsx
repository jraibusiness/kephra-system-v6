import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { StepProps } from '../types';
import { Input, Select, TextArea } from './ui/Input';
import { CITIES, CHURCHES, getBudgetRanges, getMusicStyles, getFutureDateRanges, TRANSLATIONS } from '../constants';
import { Check, Star } from 'lucide-react';

const stepAnimation = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

// --- Step 1 ---
export const Step1Contact: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow standard phone characters
    if (/^[0-9+\-\s()]*$/.test(value)) {
      updateData({ whatsapp: value });
    }
  };

  return (
    <motion.div {...stepAnimation} className="space-y-4">
      <h2 className="text-2xl font-light text-center mb-6">{t.s1Title}</h2>
      <Input
        label={t.s1Name}
        placeholder={t.s1NamePlace}
        value={formData.fullName}
        onChange={(e) => updateData({ fullName: e.target.value })}
      />
      <Input
        label={t.s1Phone}
        placeholder={t.s1PhonePlace}
        value={formData.whatsapp}
        onChange={handlePhoneChange}
        type="tel"
      />
      <p className="text-[10px] text-blue-300/60 -mt-3 mb-2 ml-1">
        {t.s1PhoneHelp}
      </p>
      <Input
        label={t.s1Email}
        type="email"
        placeholder={t.s1EmailPlace}
        value={formData.email}
        onChange={(e) => updateData({ email: e.target.value })}
      />
    </motion.div>
  );
};

// --- Step 2 ---
export const Step2Date: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];
  // Re-generate dates when language changes
  const dynamicDates = useMemo(() => getFutureDateRanges(language), [language]);

  return (
    <motion.div {...stepAnimation} className="space-y-4">
      <h2 className="text-2xl font-light text-center mb-6">{t.s2Title}</h2>
      <p className="text-blue-200 text-sm text-center mb-4">{t.s2Subtitle}</p>
      
      <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
        {dynamicDates.map((range) => (
          <button
            key={range}
            onClick={() => updateData({ dateRange: range })}
            className={`p-3 text-sm rounded border transition-all duration-300 ${
              formData.dateRange === range
                ? 'bg-white text-slate-900 border-white font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-transparent text-blue-100 border-blue-300/20 hover:border-blue-200/50'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// --- Step 3 ---
export const Step3Location: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];
  const otherOption = t.other;

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    updateData({ 
      city: newCity, 
      church: '', 
      customLocation: '' 
    });
  };

  // Add "Outra" / "Other" to the cities list dynamically
  const cityOptions = [...CITIES, otherOption];

  // Logic for church options: specific or empty + add "Other"
  let churchOptions: string[] = [];
  if (formData.city && formData.city !== otherOption) {
    // If the city is a known key in CHURCHES, use it.
    // Note: CITIES constants are stored in PT names (e.g. "São Vicente").
    // If we selected "Other" (translated), we skip this.
    // Since CITIES array is hardcoded in PT, formData.city will match keys in CHURCHES if selected from list.
    churchOptions = [...(CHURCHES[formData.city] || []), otherOption];
  }

  const showCustomChurchInput = 
    formData.church === otherOption || 
    formData.city === otherOption;

  return (
    <motion.div {...stepAnimation} className="space-y-4">
      <h2 className="text-2xl font-light text-center mb-6">{t.s3Title}</h2>
      
      <Select
        label={t.s3City}
        options={cityOptions}
        value={formData.city}
        onChange={handleCityChange}
      />

      {formData.city && formData.city !== otherOption && (
        <Select
          label={t.s3Church}
          options={churchOptions}
          value={formData.church}
          onChange={(e) => updateData({ church: e.target.value })}
        />
      )}

      {showCustomChurchInput && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Input
            label={t.s3CustomLabel}
            placeholder={t.s3CustomPlace}
            value={formData.customLocation || ''}
            onChange={(e) => updateData({ customLocation: e.target.value })}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Step 4 ---
export const Step4Vision: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];
  const budgetOptions = useMemo(() => getBudgetRanges(language), [language]);

  return (
    <motion.div {...stepAnimation} className="space-y-4">
      <h2 className="text-2xl font-light text-center mb-6">{t.s4Title}</h2>
      
      <Select
        label={t.s4Budget}
        options={budgetOptions}
        value={formData.budget}
        onChange={(e) => updateData({ budget: e.target.value })}
      />

      <TextArea
        label={t.s4Vision}
        placeholder={t.s4VisionPlace}
        value={formData.vision}
        onChange={(e) => updateData({ vision: e.target.value })}
      />
    </motion.div>
  );
};

// --- Step 5 ---
export const Step5Music: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];
  const styles = useMemo(() => getMusicStyles(language), [language]);

  const toggleStyle = (styleLabel: string, styleId: string) => {
    const currentStyles = formData.musicStyles || [];
    let newStyles = [];
    
    if (currentStyles.includes(styleLabel)) {
      newStyles = currentStyles.filter(s => s !== styleLabel);
    } else {
      if (currentStyles.length >= 3) return; // Max 3
      newStyles = [...currentStyles, styleLabel];
    }
    
    // Logic uses the IDs from the styles list to determine profile, 
    // but we store the display label in formData for the sheet.
    
    // We need to look up the IDs for the currently selected labels
    // This is a bit inefficient (O(n^2)) but for 3 items and 10 options it's negligible.
    const selectedIds = newStyles.map(label => styles.find(s => s.label === label)?.id || '');

    let profile = t.pEclectic;
    if (selectedIds.some(id => id === 'classic' || id === 'catholic')) profile = t.pClassic;
    if (selectedIds.some(id => id === 'modern' || id === 'movies')) profile = t.pModern;
    if (selectedIds.some(id => id === 'rock' || id === 'celta')) profile = t.pAuthentic;

    updateData({ 
      musicStyles: newStyles,
      calculatedProfile: newStyles.length > 0 ? profile : undefined
    });
  };

  return (
    <motion.div {...stepAnimation} className="space-y-2">
      <h2 className="text-2xl font-light text-center mb-2">{t.s5Title}</h2>
      <p className="text-xs text-blue-200 text-center mb-4 leading-relaxed">
        {t.s5Subtitle} <strong className="text-white">{t.s5Subtitle2}</strong> {t.s5Subtitle3}
      </p>

      <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
        {styles.map((style) => {
          const isSelected = (formData.musicStyles || []).includes(style.label);
          const isMaxReached = (formData.musicStyles || []).length >= 3;
          
          return (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.label, style.id)}
              disabled={!isSelected && isMaxReached}
              className={`
                relative p-4 rounded-lg border text-left transition-all duration-300 group
                ${isSelected 
                  ? 'bg-blue-900/40 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
                ${!isSelected && isMaxReached ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className={`block text-sm font-medium ${isSelected ? 'text-white' : 'text-blue-100'}`}>
                    {style.label}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {style.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider text-blue-300/70 border border-blue-300/20 px-1.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {isSelected && (
                  <div className="bg-blue-400 text-[#000030] rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Feedback on Profile */}
      {formData.calculatedProfile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
             <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
             <span className="text-xs text-amber-100 font-medium">{t.s5Profile} {formData.calculatedProfile}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Step 6 ---
export const Step6Special: React.FC<StepProps> = ({ formData, updateData, language }) => {
  const t = TRANSLATIONS[language];
  return (
    <motion.div {...stepAnimation} className="space-y-6">
      <h2 className="text-2xl font-light text-center mb-6">{t.s6Title}</h2>
      
      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/20 p-6 rounded-lg border border-white/10 backdrop-blur-sm">
        <p className="text-blue-100 text-lg italic font-light text-center mb-6">
          {t.s6Quote}
        </p>
        
        <TextArea
          label={t.s6Label}
          placeholder={t.s6Place}
          value={formData.specialSong}
          onChange={(e) => updateData({ specialSong: e.target.value })}
          className="bg-transparent"
        />
      </div>
    </motion.div>
  );
};