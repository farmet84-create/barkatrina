import React from 'react';

export const Footer: React.FC = () => (
  <footer id="app-footer" className="px-6 py-4 text-center text-[11px] text-neutral-500 border-t border-[#262626]">
    Developed by{' '}
    <a
      href="https://waapp.live/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#D4AF37] hover:underline font-semibold"
    >
      Waapp
    </a>{' '}
    &copy; 2026
  </footer>
);
