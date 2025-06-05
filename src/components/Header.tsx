import React from 'react';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  showLogo?: boolean;
  children?: React.ReactNode;
}

export default function Header({ 
  title, 
  subtitle, 
  showLogo = true, 
  children 
}: HeaderProps) {
  return (
    <header className="graduation-gradient text-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-6 mb-6">
              {showLogo && (
                <img 
                  src="/d79-logo.png" 
                  alt="District 79 - Alternative Schools & Programs" 
                  className="h-16 w-auto"
                  title="District 79 - Alternative Schools & Programs"
                />
              )}
              <div className="flex items-center gap-3">
                <GraduationCap className="h-12 w-12" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {title}
                </h1>
              </div>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              {subtitle}
            </p>
          </div>
          {children && (
            <div className="absolute top-4 right-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
