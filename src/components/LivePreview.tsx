import React, { useEffect, useState } from 'react';
import { FileNode } from '../types';

interface LivePreviewProps {
  files: FileNode[];
}

export const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'))?.content || '<html><body style="font-family: sans-serif; padding: 20px;"><h1>Hello World</h1><p>Start coding to see changes here.</p></body></html>';
    const cssFiles = files.filter(f => f.name.endsWith('.css')).map(f => `<style>${f.content}</style>`).join('\n');
    const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts')).map(f => `<script>${f.content}</script>`).join('\n');

    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${cssFiles}
        </head>
        <body>
          ${htmlFile}
          ${jsFiles}
        </body>
      </html>
    `;
    
    const timeout = setTimeout(() => {
      setSrcDoc(combined);
    }, 500);

    return () => clearTimeout(timeout);
  }, [files]);

  return (
    <div className="h-full w-full bg-[#f8f9fa] flex flex-col overflow-hidden">
      <div className="h-10 bg-zinc-100 border-b border-zinc-200 flex items-center px-4 gap-4 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-white border border-zinc-200 rounded-md px-3 py-1 shadow-sm">
          <div className="w-3 h-3 text-zinc-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div className="text-[11px] text-zinc-500 font-medium truncate select-all">
            yutoolss.preview/app
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-4 h-4 text-zinc-400 hover:text-zinc-600 cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
          </div>
        </div>
      </div>
      <div className="flex-1 relative bg-white">
        <iframe
          srcDoc={srcDoc}
          title="preview"
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          frameBorder="0"
          width="100%"
          height="100%"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
};
