export interface Message {
	id: string;
	authorId: string;
	text: string;
	createdAt: number;
}

export interface Session {
	id: string;
	code: string;
	adminId: string;
	messages: Message[];
}

export interface User {
	id: string;
	sessionId: string;
	isVerified: boolean;
	socketId?: string;
}