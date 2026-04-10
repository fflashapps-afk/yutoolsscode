import React, { useState } from 'react';
import { FileNode } from '../types';
import { Folder, File, ChevronRight, ChevronDown, Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onCreateFile: (parentId: string | null, type: 'file' | 'folder') => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onUploadFile: (parentId: string | null, file: File) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedFolders(newExpanded);
  };

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const children = files.filter((f) => f.parentId === parentId).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return children.map((file) => {
      const isExpanded = expandedFolders.has(file.id);
      const isActive = activeFileId === file.id;

      return (
        <div key={file.id} className="select-none">
          <div
            className={cn(
              "group flex items-center py-1.5 px-3 hover:bg-zinc-800/50 cursor-pointer text-[13px] transition-all border-l-2 border-transparent",
              isActive && "bg-indigo-500/10 text-indigo-400 border-indigo-500",
              depth > 0 && `ml-${depth * 2}`
            )}
            onClick={() => {
              if (file.type === 'folder') toggleFolder(file.id);
              else onFileSelect(file);
            }}
          >
            <div className="flex items-center flex-1 min-w-0">
              {file.type === 'folder' ? (
                <>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-50" />}
                  <Folder className={cn("w-4 h-4 mr-2 shrink-0", isExpanded ? "text-indigo-400" : "text-zinc-500")} />
                </>
              ) : (
                <File className={cn("w-4 h-4 mr-2 ml-5 shrink-0", isActive ? "text-indigo-400" : "text-zinc-500")} />
              )}

              {editingId === file.id ? (
                <Input
                  autoFocus
                  className="h-6 py-0 px-1 text-xs bg-zinc-900 border-indigo-500/50 focus-visible:ring-0"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => {
                    if (editName.trim()) onRenameFile(file.id, editName);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editName.trim()) onRenameFile(file.id, editName);
                      setEditingId(null);
                    }
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <span className={cn("truncate font-medium", !isActive && "text-zinc-400 group-hover:text-zinc-200")}>{file.name}</span>
              )}
            </div>

            <div className="hidden group-hover:flex items-center gap-0.5 ml-2">
              {file.type === 'folder' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateFile(file.id, 'file');
                  }}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                >
                  <Plus className="w-3 h-3 text-zinc-400" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(file.id);
                  setEditName(file.name);
                }}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
              >
                <Edit2 className="w-3 h-3 text-zinc-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          </div>
          {file.type === 'folder' && isExpanded && (
            <div className="ml-3 border-l border-zinc-800/50">
              {renderTree(file.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/30">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Fayllar</h2>
        <div className="flex gap-0.5">
          <Tooltip>
            <TooltipTrigger 
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-800 text-zinc-400 h-7 w-7 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => onCreateFile(null, 'file')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCreateFile(null, 'file');
                    }
                  }}
                />
              }
            >
              <Plus className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Yangi fayl</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger 
              render={
                <div
                  role="button"
                  tabIndex={0}
                  className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-800 text-zinc-400 h-7 w-7 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.click();
                    }
                  }}
                />
              }
            >
              <label className="cursor-pointer w-full h-full flex items-center justify-center">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadFile(null, file);
                  }}
                />
                <Upload className="h-4 w-4" />
              </label>
            </TooltipTrigger>
            <TooltipContent>Fayl yuklash</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {renderTree()}
      </div>
    </div>
  );
};
