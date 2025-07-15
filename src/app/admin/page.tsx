
'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import type { Formula } from '@/lib/data';
import { useFormulas } from '@/contexts/formula-context';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageContext, content } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import { Loader, Lock, ShieldOff, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialState: Omit<Formula, 'created_at'> = {
  id: 0,
  title: { en: '', my: '' },
  category: { en: '', my: '' },
  shortDescription: { en: '', my: '' },
  longDescription: { en: [], my: [] },
  syntax: '',
  example: '',
  exampleExplanation: { en: '', my: '' },
  visualExplanation: {
    imageUrl: '',
  },
};

export default function AdminPage() {
  const [formData, setFormData] = useState<Omit<Formula, 'created_at'>>(JSON.parse(JSON.stringify(initialState)));
  const [isEditing, setIsEditing] = useState(false);
  const { formulas, addFormula, updateFormula, deleteFormula: removeFormula, loading: formulasLoading } = useFormulas();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const pageContent = content[language];
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nameParts = name.split('.');

    setFormData(prev => {
        const newState = JSON.parse(JSON.stringify(prev)); // Deep copy

        if (nameParts.length === 1) {
            (newState as any)[name] = value;
        } else if (nameParts.length === 2) {
            const [field, subfield] = nameParts;
            if (field === 'longDescription') {
                 (newState as any)[field][subfield] = value.split('\n');
            } else {
                (newState as any)[field][subfield] = value;
            }
        }
        return newState;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };
  
  const handleRemoveImage = () => {
    setFormData(prev => ({
        ...prev,
        visualExplanation: {
            ...prev.visualExplanation,
            imageUrl: '',
        }
    }));
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateFormula(formData.id, formData, selectedFile);
        toast({ title: 'Success', description: 'Formula updated successfully.' });
      } else {
        await addFormula(formData, selectedFile);
        toast({ title: 'Success', description: 'Formula added successfully.' });
      }
      clearForm();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
  };

  const handleEdit = (formula: Formula) => {
    const formulaData = JSON.parse(JSON.stringify(formula)); // Deep copy
    // Ensure visualExplanation and its properties exist to avoid errors
    formulaData.visualExplanation = formulaData.visualExplanation ?? { ...initialState.visualExplanation };

    setFormData(formulaData);
    setIsEditing(true);
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this formula? This will also delete its image from storage.')) {
      try {
        await removeFormula(id);
        toast({ title: 'Success', description: 'Formula deleted successfully.' });
      } catch (error) {
         console.error(error);
         const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
         toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      }
    }
  };

  const clearForm = () => {
    setFormData(JSON.parse(JSON.stringify(initialState)));
    setIsEditing(false);
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  if (authLoading || formulasLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="container mx-auto px-4 md:px-6 py-8 text-center">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><Lock /> {pageContent.admin.loginRequired}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{pageContent.admin.loginPrompt}</p>
                    <Button asChild className="mt-4">
                        <Link href="/login">Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!isAdmin) {
      return (
        <div className="container mx-auto px-4 md:px-6 py-8 text-center">
            <Card className="max-w-md mx-auto bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldOff /> {pageContent.admin.notAdmin}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{pageContent.admin.notAdminPrompt}</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tighter">
          {pageContent.admin.title}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          {pageContent.admin.subtitle}
        </p>
      </section>

      <Card className="mb-12">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEditing ? pageContent.admin.editFormTitle : pageContent.admin.addFormTitle}</CardTitle>
            {isEditing && <Button variant="outline" size="sm" onClick={clearForm}>{pageContent.admin.clearForm}</Button>}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {isEditing && (
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="id">{pageContent.admin.idLabel}</Label>
                    <Input id="id" name="id" value={formData.id} readOnly disabled />
                </div>
            )}

            {/* English Fields */}
            <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">English</h3>
                <div className="space-y-2">
                    <Label htmlFor="title.en">{pageContent.admin.titleEnLabel}</Label>
                    <Input id="title.en" name="title.en" value={formData.title.en} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category.en">{pageContent.admin.categoryEnLabel}</Label>
                    <Input id="category.en" name="category.en" value={formData.category.en} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shortDescription.en">{pageContent.admin.shortDescEnLabel}</Label>
                    <Input id="shortDescription.en" name="shortDescription.en" value={formData.shortDescription.en} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longDescription.en">{pageContent.admin.longDescEnLabel}</Label>
                    <Textarea id="longDescription.en" name="longDescription.en" value={Array.isArray(formData.longDescription.en) ? formData.longDescription.en.join('\n') : ''} onChange={handleChange} rows={5} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="exampleExplanation.en">{pageContent.admin.exampleExpEnLabel}</Label>
                    <Textarea id="exampleExplanation.en" name="exampleExplanation.en" value={formData.exampleExplanation.en} onChange={handleChange} required />
                </div>
            </div>

            {/* Myanmar Fields */}
            <div className="space-y-4 p-4 border rounded-md">
                 <h3 className="font-semibold text-lg">Myanmar</h3>
                <div className="space-y-2">
                    <Label htmlFor="title.my">{pageContent.admin.titleMyLabel}</Label>
                    <Input id="title.my" name="title.my" value={formData.title.my} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category.my">{pageContent.admin.categoryMyLabel}</Label>
                    <Input id="category.my" name="category.my" value={formData.category.my} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shortDescription.my">{pageContent.admin.shortDescMyLabel}</Label>
                    <Input id="shortDescription.my" name="shortDescription.my" value={formData.shortDescription.my} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longDescription.my">{pageContent.admin.longDescMyLabel}</Label>
                    <Textarea id="longDescription.my" name="longDescription.my" value={Array.isArray(formData.longDescription.my) ? formData.longDescription.my.join('\n') : ''} onChange={handleChange} rows={5} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exampleExplanation.my">{pageContent.admin.exampleExpMyLabel}</Label>
                    <Textarea id="exampleExplanation.my" name="exampleExplanation.my" value={formData.exampleExplanation.my} onChange={handleChange} required />
                </div>
            </div>

             {/* Common Fields */}
            <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="syntax">{pageContent.admin.syntaxLabel}</Label>
                    <Input id="syntax" name="syntax" placeholder={pageContent.admin.syntaxPlaceholder} value={formData.syntax} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="example">{pageContent.admin.exampleLabel}</Label>
                    <Input id="example" name="example" placeholder={pageContent.admin.examplePlaceholder} value={formData.example} onChange={handleChange} required />
                </div>
            </div>

            {/* Visual Explanation */}
            <div className="md:col-span-2 space-y-4 p-4 border rounded-md">
                <h3 className="font-semibold text-lg">{pageContent.admin.visualExpTitle}</h3>
                <div className="space-y-2">
                    <Label htmlFor="visual-image-upload">{pageContent.admin.imageUrlLabel}</Label>
                     <Input id="visual-image-upload" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef}/>
                    
                    {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                           <span>{selectedFile.name}</span>
                           <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => {
                               setSelectedFile(null)
                               if(fileInputRef.current) fileInputRef.current.value = "";
                           }}><X className="h-4 w-4"/></Button>
                        </div>
                    )}
                    
                    {formData.visualExplanation?.imageUrl && !selectedFile && (
                        <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Current Image:</p>
                            <div className='flex items-center gap-4'>
                                <a href={formData.visualExplanation.imageUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate block">{formData.visualExplanation.imageUrl}</a>
                                <Button variant="link" size="sm" className="p-0 h-auto text-destructive" onClick={handleRemoveImage}>
                                    Remove Image
                                </Button>
                            </div>
                        </div>
                    )}
                    {(isEditing && !selectedFile && formData.visualExplanation?.imageUrl) && (
                        <p className="text-sm text-muted-foreground mt-2">Upload a new file to replace the current image. The old image will be deleted.</p>
                     )}
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">
                {isEditing ? pageContent.admin.updateButton : pageContent.admin.addButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      

      <div className="space-y-6">
        <h2 className="text-3xl font-bold font-headline">{pageContent.admin.formulasTitle}</h2>
        {formulas.map((formula) => (
          <Card key={formula.id} className="flex flex-col md:flex-row items-start justify-between p-4 gap-4">
              <div>
                  <h3 className="font-bold text-lg">{formula.title.en} / {formula.title.my}</h3>
                  <p className="text-sm text-muted-foreground">ID: {formula.id}</p>
              </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" onClick={() => handleEdit(formula)}>{pageContent.admin.edit}</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(formula.id)}>{pageContent.admin.delete}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
