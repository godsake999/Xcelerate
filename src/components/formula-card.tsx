
'use client';

import Image from 'next/image';
import type { Formula } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useContext } from 'react';
import { LanguageContext, content } from '@/contexts/language-context';

interface FormulaCardProps {
  formula: Formula;
}

export default function FormulaCard({ formula }: FormulaCardProps) {
  const { language } = useContext(LanguageContext);
  const pageContent = content[language];

  return (
    <Card className="flex flex-col">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <CardTitle className="font-headline text-2xl flex items-center flex-wrap gap-x-4 gap-y-2">
                        <span>{formula.title[language]}</span>
                        <Badge variant="secondary">{formula.category[language]}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">{formula.shortDescription[language]}</CardDescription>
                </div>
                <AccordionTrigger className="px-3 py-2 text-sm h-auto hover:no-underline rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 [&[data-state=open]>svg]:rotate-180 flex-shrink-0">
                    {pageContent.formulaCard.viewDetails}
                </AccordionTrigger>
            </div>
           </CardHeader>
          <AccordionContent>
            <CardContent>
              <div className="space-y-6">
                 {/* Syntax Block - Full Width */}
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.formulaCard.syntax}</h4>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    <code className="font-code text-sm text-foreground">
                        {formula.syntax}
                    </code>
                    </pre>
                </div>

                {/* Details Section - Two Columns */}
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    {/* Left Column: Text Explanations */}
                    <div className="space-y-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {(Array.isArray(formula.longDescription?.[language]) ? formula.longDescription[language] : []).map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.formulaCard.example}</h4>
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                                <code className="font-code text-sm text-foreground">
                                {formula.example}
                                </code>
                            </pre>
                            <p className="text-sm text-muted-foreground mt-2">
                                {formula.exampleExplanation[language]}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Visual Explanation */}
                    <div className="space-y-6">
                       {formula.visualExplanation && formula.visualExplanation.imageUrl && (
                            <div>
                                <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-muted-foreground">{pageContent.formulaCard.visualExplanation}</h4>
                                <div className="mt-2 border rounded-lg overflow-hidden bg-card aspect-video relative">
                                    <Image
                                    src={formula.visualExplanation.imageUrl}
                                    alt={`Visual explanation for ${formula.title['en']}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
