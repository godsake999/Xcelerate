'use client';

import { useState, useMemo, useContext } from 'react';
import { Input } from '@/components/ui/input';
import FormulaCard from '@/components/formula-card';
import { Search } from 'lucide-react';
import { LanguageContext, content } from '@/contexts/language-context';
import { useFormulas } from '@/contexts/formula-context';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const { language } = useContext(LanguageContext);
  const { formulas } = useFormulas();
  const pageContent = content[language];

  const filteredFormulas = useMemo(() => {
    if (!searchTerm) {
      return formulas;
    }
    return formulas.filter(
      (formula) =>
        formula.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.shortDescription[language]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        formula.category[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
        formula.title['en'].toLowerCase().includes(searchTerm.toLowerCase()) // Also search English title
    );
  }, [searchTerm, language, formulas]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
          {pageContent.home.title}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {pageContent.home.subtitle}
        </p>
      </section>

      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={pageContent.home.searchPlaceholder}
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 max-w-6xl mx-auto">
        {filteredFormulas.map((formula) => (
          <FormulaCard key={formula.id} formula={formula} />
        ))}
      </div>
      {filteredFormulas.length === 0 && (
         <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">{pageContent.home.noResults(searchTerm)}</p>
         </div>
      )}
    </div>
  );
}
