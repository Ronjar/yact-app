export interface Message {
	id: string;
	authorId: string;
	text?: string;
	createdAt: number;
	kind: 'text' | 'image' | 'video' | 'file';
	url?: string;
	name?: string;
}

export type ShareEntry =
  | { type: 'text';  text: string }
  | { type: 'file';  fileId: string };

export interface FileMeta {
	path: string;
	sessionId: string;
	mime: string;
	name: string;
}

export interface Session {
	id: string;
	code: string;
	adminId: string;
	messages: Message[];
}

export interface User {
	id: string;
	name: string; 
	sessionId: string;
	isVerified: boolean;
	socketId?: string;
}