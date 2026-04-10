export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  projectId: string;
  name: string;
  type: FileType;
  content?: string;
  parentId: string | null;
  path: string;
  updatedAt: any;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
  isPublic?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}
