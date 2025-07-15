
'use client';

import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { type Formula } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import { addFormula as addFormulaService, updateFormula as updateFormulaService, deleteFormula as deleteFormulaService } from '@/lib/formulaService';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Formula => {
  if (!row) return {} as Formula;
  const formula: Formula = {
    id: row.id,
    created_at: row.created_at,
    title: { en: row.title_en, my: row.title_my },
    category: { en: row.category_en, my: row.category_my },
    shortDescription: { en: row.short_description_en, my: row.short_description_my },
    longDescription: { en: row.long_description_en || [], my: row.long_description_my || [] },
    syntax: row.syntax,
    example: row.example,
    exampleExplanation: { en: row.example_explanation_en, my: row.example_explanation_my },
    visualExplanation: { imageUrl: '' }, // Initialize with empty object
  };

  if (row.image_url) {
    formula.visualExplanation = {
      imageUrl: row.image_url,
    };
  }

  return formula;
};


interface FormulaContextType {
  formulas: Formula[];
  loading: boolean;
  addFormula: (formula: Omit<Formula, 'created_at'>, file: File | null) => Promise<void>;
  updateFormula: (id: number, formula: Partial<Omit<Formula, 'created_at'>>, file: File | null) => Promise<void>;
  deleteFormula: (id: number) => Promise<void>;
}

export const FormulaContext = createContext<FormulaContextType | undefined>(undefined);

export const FormulaProvider = ({ children }: { children: ReactNode }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const { data, error } = await supabase
          .from('formulas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching formulas:', error);
          throw new Error(error.message);
        }

        setFormulas(data.map(fromSupabase));
      } catch (error) {
        console.error("Failed to fetch formulas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFormulas();
  }, []);

  const addFormula = async (formula: Omit<Formula, 'created_at'>, file: File | null) => {
    const newFormula = await addFormulaService(formula, file);
    setFormulas(prev => [newFormula, ...prev]);
  };

  const updateFormula = async (id: number, formula: Partial<Omit<Formula, 'created_at'>>, file: File | null) => {
    const updatedFormula = await updateFormulaService(id, formula, file);
    setFormulas(prev => prev.map(f => f.id === id ? updatedFormula : f));
  };

  const deleteFormula = async (id: number) => {
    await deleteFormulaService(id);
    setFormulas(prev => prev.filter(f => f.id !== id));
  };


  return (
    <FormulaContext.Provider value={{ formulas, loading, addFormula, updateFormula, deleteFormula }}>
      {children}
    </FormulaContext.Provider>
  );
};

export const useFormulas = () => {
    const context = useContext(FormulaContext);
    if (!context) {
        throw new Error('useFormulas must be used within a FormulaProvider');
    }
    return context;
}
