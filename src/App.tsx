import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged 
} from '@/lib/firebase';
import { 
  collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp, addDoc, orderBy, limit 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { FileNode, Project } from './types';
import { Navbar } from '@/components/Navbar';
import { FileExplorer } from '@/components/FileExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { GlobalChat } from '@/components/GlobalChat';
import { Toaster, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Menu, X, Code2, Globe, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { Files, Play, Settings } from 'lucide-react';
import { NotificationService } from '@/lib/NotificationService';

const DEFAULT_PROJECT_ID = 'default-project';

type MobileScreen = 'files' | 'editor' | 'preview' | 'community';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'community'>('editor');
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('editor');
  const [unreadCount, setUnreadCount] = useState(0);
  const lastViewedChatRef = useRef<number>(Date.now());

  // Auth Listener
  useEffect(() => {
    NotificationService.requestPermission();
    
    // Handle URL parameters
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (screen === 'community') {
      setActiveTab('community');
      setMobileScreen('community');
    }

    // Show widget guide for mobile users
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !localStorage.getItem('widget_guide_shown')) {
      setTimeout(() => {
        toast("Mobil vidjetni qo'shing!", {
          description: "Asosiy ekranda chat vidjetini o'rnatish uchun vidjetlar bo'limiga o'ting.",
          duration: 6000,
        });
        localStorage.setItem('widget_guide_shown', 'true');
      }, 3000);
    }

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  // Notifications Listener
  useEffect(() => {
    const q = query(
      collection(db, 'global_chat'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty || snapshot.metadata.hasPendingWrites) return;
      const latestMsg = snapshot.docs[0].data();
      
      // If message is new and we are not in community tab
      const msgTime = latestMsg.createdAt?.seconds ? latestMsg.createdAt.seconds * 1000 : Date.now();
      if (msgTime > lastViewedChatRef.current && activeTab !== 'community' && mobileScreen !== 'community') {
        setUnreadCount(prev => prev + 1);
        
        // Native Notification
        NotificationService.notify(`New message from ${latestMsg.userName}`, {
          body: latestMsg.content,
          tag: 'chat-notification',
          // @ts-ignore
          renotify: true
        });

        toast(`New message from ${latestMsg.userName}`, {
          description: latestMsg.content.substring(0, 50) + (latestMsg.content.length > 50 ? '...' : ''),
          action: {
            label: 'View',
            onClick: () => {
              setActiveTab('community');
              setMobileScreen('community');
            }
          },
          icon: <MessageSquare className="w-4 h-4 text-indigo-500" />
        });
      }
    });

    return () => unsubscribe();
  }, [activeTab, mobileScreen]);

  // Reset unread count when entering community tab
  useEffect(() => {
    if (activeTab === 'community' || mobileScreen === 'community') {
      setUnreadCount(0);
      lastViewedChatRef.current = Date.now();
    }
  }, [activeTab, mobileScreen]);

  // Project & Files Listener
  useEffect(() => {
    // For this demo, we use a fixed project ID or create one if it doesn't exist
    const projectRef = doc(db, 'projects', DEFAULT_PROJECT_ID);
    
    const unsubProject = onSnapshot(projectRef, (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      } else {
        // Initialize default project
        setDoc(projectRef, {
          name: 'My Awesome Project',
          ownerId: user?.uid || 'anonymous',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPublic: true
        });
      }
    });

    const filesRef = collection(db, 'projects', DEFAULT_PROJECT_ID, 'files');
    const unsubFiles = onSnapshot(filesRef, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileNode));
      setFiles(filesData);
      
      // If no active file, pick the first one
      if (!activeFileId && filesData.length > 0) {
        const indexFile = filesData.find(f => f.name === 'index.html') || filesData[0];
        setActiveFileId(indexFile.id);
      }
      
      // If no files at all, create index.html
      if (filesData.length === 0) {
        addDoc(filesRef, {
          projectId: DEFAULT_PROJECT_ID,
          name: 'index.html',
          type: 'file',
          content: '<h1>Hello YuToolss!</h1>',
          parentId: null,
          path: 'index.html',
          updatedAt: serverTimestamp()
        });
      }
    });

    return () => {
      unsubProject();
      unsubFiles();
    };
  }, [user, activeFileId]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleCreateFile = async (parentId: string | null, type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;

    try {
      const filesRef = collection(db, 'projects', DEFAULT_PROJECT_ID, 'files');
      await addDoc(filesRef, {
        projectId: DEFAULT_PROJECT_ID,
        name,
        type,
        content: type === 'file' ? '' : null,
        parentId,
        path: name,
        updatedAt: serverTimestamp()
      });
      toast.success(`${type} created`);
    } catch (error) {
      toast.error('Failed to create');
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'projects', DEFAULT_PROJECT_ID, 'files', id));
      if (activeFileId === id) setActiveFileId(null);
      toast.success('Deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleRenameFile = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'projects', DEFAULT_PROJECT_ID, 'files', id), {
        name: newName,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      toast.error('Rename failed');
    }
  };

  const handleContentChange = useCallback((value: string | undefined) => {
    if (!activeFileId) return;
    const fileRef = doc(db, 'projects', DEFAULT_PROJECT_ID, 'files', activeFileId);
    updateDoc(fileRef, {
      content: value || '',
      updatedAt: serverTimestamp()
    });
  }, [activeFileId]);

  const handleUploadFile = async (parentId: string | null, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const filesRef = collection(db, 'projects', DEFAULT_PROJECT_ID, 'files');
        await addDoc(filesRef, {
          projectId: DEFAULT_PROJECT_ID,
          name: file.name,
          type: 'file',
          content,
          parentId,
          path: file.name,
          updatedAt: serverTimestamp()
        });
        toast.success('File uploaded');
      } catch (error) {
        toast.error('Upload failed');
      }
    };
    reader.readAsText(file);
  };

  const activeFile = files.find(f => f.id === activeFileId);
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const MobileNav = () => (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around px-4 z-50 pb-safe">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("flex flex-col gap-1 h-auto py-2", mobileScreen === 'files' && "text-indigo-500")}
        onClick={() => setMobileScreen('files')}
      >
        <Files className="w-5 h-5" />
        <span className="text-[10px]">Fayllar</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("flex flex-col gap-1 h-auto py-2", mobileScreen === 'editor' && "text-indigo-500")}
        onClick={() => setMobileScreen('editor')}
      >
        <Code2 className="w-5 h-5" />
        <span className="text-[10px]">Muharrir</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("flex flex-col gap-1 h-auto py-2", mobileScreen === 'preview' && "text-indigo-500")}
        onClick={() => setMobileScreen('preview')}
      >
        <Play className="w-5 h-5" />
        <span className="text-[10px]">Ko'rinish</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn("flex flex-col gap-1 h-auto py-2 relative", mobileScreen === 'community' && "text-indigo-500")}
        onClick={() => {
          setMobileScreen('community');
          setActiveTab('community');
        }}
      >
        <Globe className="w-5 h-5" />
        <span className="text-[10px]">Hamjamiyat</span>
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-indigo-600 text-[8px]">
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 overflow-hidden">
        <Navbar 
          user={user}
          projectName={project?.name || 'Loading...'}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'community') setMobileScreen('community');
            else setMobileScreen('editor');
          }}
          unreadCount={unreadCount}
        />

        <main className="flex-1 flex overflow-hidden relative pb-16 sm:pb-0">
          {/* Desktop View */}
          <div className="hidden sm:flex flex-1 overflow-hidden">
            {activeTab === 'editor' ? (
              <>
                <div className="w-72 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl h-full">
                  <FileExplorer 
                    files={files}
                    activeFileId={activeFileId}
                    onFileSelect={(f) => setActiveFileId(f.id)}
                    onCreateFile={handleCreateFile}
                    onDeleteFile={handleDeleteFile}
                    onRenameFile={handleRenameFile}
                    onUploadFile={handleUploadFile}
                  />
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <ResizablePanelGroup direction="horizontal" className="flex-1">
                    <ResizablePanel defaultSize={70} minSize={30} className="flex flex-col">
                      <div className="flex-1 min-w-0 bg-zinc-950">
                        {activeFile ? (
                          <CodeEditor 
                            value={activeFile.content || ''}
                            language={activeFile.name.split('.').pop() || 'javascript'}
                            onChange={handleContentChange}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                              <Code2 className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Kodlashni boshlash uchun faylni tanlang</p>
                          </div>
                        )}
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-zinc-800/50 hover:bg-indigo-500/50 transition-colors" />

                    <ResizablePanel defaultSize={30} minSize={20}>
                      <div className="h-full w-full bg-white">
                        <LivePreview files={files} />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                <div className="flex-1 bg-zinc-950 overflow-y-auto p-6 sm:p-12">
                  <div className="max-w-3xl mx-auto space-y-12">
                    <div className="space-y-4">
                      <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 px-3 py-1">Hamjamiyat markazi</Badge>
                      <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
                        <span className="text-indigo-500">yutoolss</span> hamjamiyatiga xush kelibsiz
                      </h1>
                      <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl">
                        Boshqa dasturchilar bilan bog'laning, loyihalaringizni ulashing va real vaqtda fikr-mulohazalar oling. Bizning hamjamiyatimiz siz kabi ijodkorlar uchun qurilgan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageSquare className="text-indigo-500 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Umumiy chat</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                          Butun dunyodagi dasturchilar bilan real vaqtda muloqot qiling. Kod parchalari, rasmlar va fayllarni bir zumda ulashing.
                        </p>
                      </div>
                      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-colors group">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="text-purple-500 w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold">Ochiq loyihalar</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                          Boshqalar nima qurayotganini o'rganing. Loyihalarni nusxalang, ularning kodidan o'rganing va ekotizimga hissa qo'shing.
                        </p>
                      </div>
                    </div>

                    <div className="p-12 bg-linear-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                      <div className="relative z-10 space-y-4">
                        <h2 className="text-3xl font-black tracking-tight">Hamkorlikka tayyormisiz?</h2>
                        <p className="text-indigo-100 max-w-md">
                          yutoolss Studio-da veb-kelajakni qurayotgan minglab dasturchilarga qo'shiling.
                        </p>
                        <Button className="bg-white text-indigo-600 hover:bg-zinc-100 rounded-xl px-8 h-12 font-bold" onClick={() => setActiveTab('community')}>
                          Chatni hozir ochish
                        </Button>
                      </div>
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-96 h-full border-l border-zinc-800/50">
                  <GlobalChat user={user} />
                </div>
              </div>
            )}
          </div>

          {/* Mobile View - Separate Screens */}
          <div className="sm:hidden flex-1 flex flex-col overflow-hidden">
            {mobileScreen === 'files' && (
              <FileExplorer 
                files={files}
                activeFileId={activeFileId}
                onFileSelect={(f) => {
                  setActiveFileId(f.id);
                  setMobileScreen('editor');
                }}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onUploadFile={handleUploadFile}
              />
            )}
            {mobileScreen === 'editor' && (
              <div className="flex-1 flex flex-col">
                {activeFile ? (
                  <CodeEditor 
                    value={activeFile.content || ''}
                    language={activeFile.name.split('.').pop() || 'javascript'}
                    onChange={handleContentChange}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                    <Code2 className="w-12 h-12 mb-4 opacity-20" />
                    <p>Fayl tanlanmagan. Uni ochish uchun Fayllar bo'limiga o'ting.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setMobileScreen('files')}>
                      Fayllarni ochish
                    </Button>
                  </div>
                )}
              </div>
            )}
            {mobileScreen === 'preview' && (
              <div className="flex-1 bg-white">
                <LivePreview files={files} />
              </div>
            )}
            {mobileScreen === 'community' && (
              <GlobalChat user={user} />
            )}
          </div>
        </main>

        <MobileNav />
        <Toaster position="top-center" theme="dark" />
      </div>
    </TooltipProvider>
  );
}
