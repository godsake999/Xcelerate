
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, SigmaSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { useContext } from 'react';
import { LanguageContext, content } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';

export default function Header() {
  const pathname = usePathname();
  const { language } = useContext(LanguageContext);
  const { user, isAdmin, signOut } = useAuth();
  const pageContent = content[language];
  
  const navLinks = [
    { href: '/', label: pageContent.nav.formulas },
    ...(isAdmin ? [{ href: '/admin', label: pageContent.nav.admin }] : []),
  ];

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <SigmaSquare className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">
            FormulaSage
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          ))}
           <LanguageSwitcher />
           {user ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                {pageContent.nav.logout}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/login">{pageContent.nav.login}</Link>
              </Button>
            )}
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-6 p-6">
                <Link href="/" className="flex items-center gap-2">
                  <SigmaSquare className="h-7 w-7 text-primary" />
                  <span className="text-xl font-bold font-headline text-foreground">
                    FormulaSage
                  </span>
                </Link>
                <nav className="grid gap-4">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary',
                        pathname === href ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                   {user ? (
                      <Button variant="outline" onClick={signOut}>
                        {pageContent.nav.logout}
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/login">{pageContent.nav.login}</Link>
                      </Button>
                    )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
