import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import { LanguageProvider } from '@/contexts/language-context';
import { FormulaProvider } from '@/contexts/formula-context';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'FormulaSage',
  description: 'Excel formula explanations and tips',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <FormulaProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Toaster />
            </FormulaProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
