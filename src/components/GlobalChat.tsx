import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, Image as ImageIcon, File as FileIcon, User as UserIcon, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

import { User } from 'firebase/auth';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  createdAt: any;
}

interface GlobalChatProps {
  user: User | null;
}

export const GlobalChat: React.FC<GlobalChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'global_chat'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'global_chat'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        content: newMessage,
        type: 'text',
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    // In a real app, we would upload to Firebase Storage. 
    // For this demo, we'll simulate it with a data URL or just a placeholder.
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const isImage = file.type.startsWith('image/');
      
      try {
        await addDoc(collection(db, 'global_chat'), {
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userPhoto: user.photoURL || '',
          content: isImage ? 'Rasm yubordi' : `Fayl yubordi: ${file.name}`,
          type: isImage ? 'image' : 'file',
          fileUrl: dataUrl, // NOTE: Storing large strings in Firestore is not ideal, but for demo purposes...
          fileName: file.name,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800/50">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Hamjamiyat chati</h2>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">{messages.length} xabar</span>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((msg, index) => {
            const isMe = msg.userId === user?.uid;
            const showAvatar = index === 0 || messages[index - 1].userId !== msg.userId;
            
            return (
              <div key={msg.id} className={cn(
                "flex flex-col gap-1",
                isMe ? "items-end" : "items-start"
              )}>
                {showAvatar && !isMe && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-6 h-6 border border-zinc-800">
                      <AvatarImage src={msg.userPhoto} />
                      <AvatarFallback><UserIcon className="w-3 h-3" /></AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{msg.userName}</span>
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm transition-all",
                  isMe 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none"
                )}>
                  {msg.type === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                  
                  {msg.type === 'image' && (
                    <div className="space-y-2">
                      <img 
                        src={msg.fileUrl} 
                        alt="Shared" 
                        className="rounded-lg max-w-full h-auto border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[10px] opacity-70 italic">{msg.content}</p>
                    </div>
                  )}

                  {msg.type === 'file' && (
                    <a 
                      href={msg.fileUrl} 
                      download={msg.fileName}
                      className="flex items-center gap-3 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                    >
                      <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium truncate">{msg.fileName}</span>
                        <span className="text-[10px] opacity-50">Yuklab olish uchun bosing</span>
                      </div>
                    </a>
                  )}
                </div>
                
                <span className="text-[9px] text-zinc-600 font-mono mt-1">
                  {msg.createdAt?.seconds ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm') : '...'}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800/50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={user ? "Xabar yozing..." : "Chat uchun kiring"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!user}
              className="bg-zinc-950 border-zinc-800 focus-visible:ring-indigo-500/50 pr-20 h-11 rounded-xl"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <label className={cn(
                "p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors",
                (!user || isUploading) && "opacity-50 pointer-events-none"
              )}>
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={!user || isUploading} />
                <Paperclip className="w-4 h-4 text-zinc-500" />
              </label>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!user || !newMessage.trim()}
                className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
        {!user && (
          <p className="text-[10px] text-zinc-500 mt-2 text-center italic">
            Hamjamiyatda ishtirok etish uchun tizimga kirishingiz kerak.
          </p>
        )}
      </div>
    </div>
  );
};
