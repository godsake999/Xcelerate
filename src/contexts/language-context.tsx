
'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'my';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // You can add logic here to persist language preference, e.g., in localStorage
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const content = {
    en: {
      nav: {
        formulas: 'Formulas & Tips',
        admin: 'Admin',
        login: 'Login',
        logout: 'Logout',
      },
      home: {
        title: 'Welcome to FormulaSage',
        subtitle: 'Master Excel with our curated collection of formulas, tips, and an AI-powered validator. Stop guessing, start calculating.',
        searchPlaceholder: "Search for formulas or tips (e.g., 'XLOOKUP', 'SUMIFS')",
        noResults: (term: string) => `No formulas found for "${term}".`,
      },
      formulaCard: {
        syntax: 'Syntax',
        viewDetails: 'View Details & Example',
        example: 'Example',
        visualExplanation: 'Visual Explanation',
      },
      admin: {
          title: "Admin Panel",
          subtitle: "Manage the Excel formulas and tips displayed on the site.",
          loginRequired: "Login Required",
          loginPrompt: "You must be logged in as an administrator to access this page.",
          notAdmin: "Access Denied",
          notAdminPrompt: "You do not have permission to view this page.",
          formulasTitle: "Existing Formulas",
          edit: "Edit",
          delete: "Delete",
          addFormTitle: "Add Formula",
          editFormTitle: "Edit Formula",
          clearForm: "Clear form to add new",
          idLabel: "ID",
          titleEnLabel: "Title (English)",
          titleMyLabel: "Title (Myanmar)",
          categoryEnLabel: "Category (English)",
          categoryMyLabel: "Category (Myanmar)",
          shortDescEnLabel: "Short Description (English)",
          shortDescMyLabel: "Short Description (Myanmar)",
          longDescEnLabel: "Long Description (English - one paragraph per line)",
          longDescMyLabel: "Long Description (Myanmar - one paragraph per line)",
          syntaxLabel: "Syntax",
          syntaxPlaceholder: "=XLOOKUP(lookup_value, lookup_array, return_array, ...)",
          exampleLabel: "Example",
          examplePlaceholder: "=XLOOKUP(E2, A2:A10, C2:C10)",
          exampleExpEnLabel: "Example Explanation (English)",
          exampleExpMyLabel: "Example Explanation (Myanmar)",
          visualExpTitle: "Visual Explanation (Optional)",
          imageUrlLabel: "Image Upload",
          addButton: "Add Formula",
          updateButton: "Update Formula",
      },
      login: {
        title: "Admin Login",
        emailLabel: "Email",
        passwordLabel: "Password",
        button: "Login",
        errorTitle: "Login Failed",
      }
    },
    my: {
      nav: {
        formulas: 'ဖော်မြူလာများ',
        admin: 'အက်မင်',
        login: 'ဝင်ရန်',
        logout: 'ထွက်ရန်',
      },
      home: {
        title: 'FormulaSage မှကြိုဆိုပါတယ်',
        subtitle: 'ကျွန်ုပ်တို့၏ ဖော်မြူလာများ၊ အကြံပြုချက်များနှင့် AI စွမ်းအင်သုံး စစ်ဆေးမှုများဖြင့် Excel ကိုကျွမ်းကျင်ပိုင်နိုင်စွာအသုံးပြုပါ။ ခန့်မှန်းခြင်းကိုရပ်ပြီး တွက်ချက်လိုက်ပါ။',
        searchPlaceholder: "ဖော်မြူလာများ သို့မဟုတ် အကြံပြုချက်များရှာရန် (ဥပမာ 'XLOOKUP')",
        noResults: (term: string) => `"${term}" အတွက် ဖော်မြူလာများမတွေ့ပါ။`,
      },
      formulaCard: {
        syntax: 'ရေးထုံး',
        viewDetails: 'အသေးစိတ်နှင့် ဥပမာကြည့်ရန်',
        example: 'ဥပမာ',
        visualExplanation: 'မြင်သာသော ရှင်းလင်းချက်',
      },
      admin: {
          title: "အက်မင် စီမံခန့်ခွဲမှု",
          subtitle: "ဆိုက်ပေါ်ရှိ Excel ဖော်မြူလာများနှင့် အကြံပြုချက်များကို စီမံပါ။",
          loginRequired: "လော့ဂ်အင်လုပ်ရန်လိုအပ်သည်",
          loginPrompt: "ဤစာမျက်နှာကိုဝင်ရောက်ရန် အက်မင်အဖြစ် လော့ဂ်အင်ဝင်ရပါမည်။",
          notAdmin: "ဝင်ရောက်ခွင့်မရှိပါ",
          notAdminPrompt: "သင့်တွင် ဤစာမျက်နှာကိုကြည့်ရှုခွင့်မရှိပါ။",
          formulasTitle: "ရှိပြီးသား ဖော်မြူလာများ",
          edit: "ပြင်ရန်",
          delete: "ဖျက်ရန်",
          addFormTitle: "ဖော်မြူလာ ထည့်ရန်",
          editFormTitle: "ဖော်မြူလာ ပြင်ရန်",
          clearForm: "အသစ်ထည့်ရန် ဖောင်ကိုရှင်းလင်းပါ",
          idLabel: "အိုင်ဒီ",
          titleEnLabel: "ခေါင်းစဉ် (အင်္ဂလိပ်)",
          titleMyLabel: "ခေါင်းစဉ် (မြန်မာ)",
          categoryEnLabel: "အမျိုးအစား (အင်္ဂလိပ်)",
          categoryMyLabel: "အမျိုးအစား (မြန်မာ)",
          shortDescEnLabel: "အကျဉ်းချုပ် ဖော်ပြချက် (အင်္ဂလိပ်)",
          shortDescMyLabel: "အကျဉ်းချုပ် ဖော်ပြချက် (မြန်မာ)",
          longDescEnLabel: "အသေးစိတ် ဖော်ပြချက် (အင်္ဂလိပ် - တစ်ကြောင်းလျှင် စာပိုဒ်တစ်ပိုဒ်)",
          longDescMyLabel: "အသေးစိတ် ဖော်ပြချက် (မြန်မာ - တစ်ကြောင်းလျှင် စာပိုဒ်တစ်ပိုဒ်)",
          syntaxLabel: "ရေးထုံး",
          syntaxPlaceholder: "=XLOOKUP(lookup_value, lookup_array, return_array, ...)",
          exampleLabel: "ဥပမာ",
          examplePlaceholder: "=XLOOKUP(E2, A2:A10, C2:C10)",
          exampleExpEnLabel: "ဥပမာ ရှင်းလင်းချက် (အင်္ဂလိပ်)",
          exampleExpMyLabel: "ဥပမာ ရှင်းလင်းချက် (မြန်မာ)",
          visualExpTitle: "မြင်သာသော ရှင်းလင်းချက် (ရွေးချယ်နိုင်သည်)",
          imageUrlLabel: "ပုံ တင်ရန်",
          addButton: "ဖော်မြူလာထည့်ပါ",
          updateButton: "ဖော်မြူလာပြင်ဆင်ပါ",
      },
      login: {
        title: "အက်မင် လော့ဂ်အင်",
        emailLabel: "အီးမေးလ်",
        passwordLabel: "စကားဝှက်",
        button: "ဝင်ရန်",
        errorTitle: "လော့ဂ်အင် မအောင်မြင်ပါ",
      }
    },
  };
