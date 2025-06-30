import React from 'react';
import { Music, ScrollText, Combine, ExternalLink, Vibrate } from 'lucide-react';

const DesignShowcase = () => {
  return (
    <div className="card">
      {/* Add top margin before title */}
      <div className="mt-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
        <Music className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          <span className="inline-block rotate-12">M</span>otion{' '}
          <span className="inline-block -rotate-6">M</span>usic{' '}
          <span className="inline-block rotate-3">P</span>layer
        </h1>
      </div>
      
      {/* Reduce margin between title and "Powered by RaC" */}
      <div className="mb-4 text-center -mt-2">
        <p className="text-sm sm:text-base text-secondary mb-3">
          Powered by{' '}
          <a 
            href="https://github.com/dimitar-trifonov/rac-white-papers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-primary-dark underline transition-colors inline-flex items-center gap-1 break-words"
          >
            RaC
            <ExternalLink className="w-3 h-3" />
          </a>{' '}
          (Requirements-as-Code)
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-secondary mb-3">
          <span className="flex items-center justify-center gap-2">
            <ScrollText className="w-4 h-4" />
            Built with declarative specifications
          </span>
          <span className="flex items-center justify-center gap-2">
            <Combine className="w-4 h-4" />
            AI-ready architecture
          </span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <span className="flex items-center justify-center gap-2 text-sm sm:text-base text-secondary text-center px-2">
          <Vibrate className="w-4 h-4" />
          Switch to motion mode and move to control your music
        </span>
      </div>
      </div>
    </div>
  );
};

export default DesignShowcase;