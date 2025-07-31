import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { users, sessions, shares, invites} from './store.js';

const SESSION_CODE_LENGTH = parseInt(process.env.PUBLIC_SESSION_CODE_LENGTH?? "6");
const SHARE_CODE_LENGTH = parseInt(process.env.PUBLIC_SHARE_CODE_LENGTH?? "6");
const INVITE_TOKEN_LENGTH = parseInt(process.env.PUBLIC_INVITE_TOKEN_LENGTH?? "24");

export function randomName(): string {
	let name: string;
	do {
		name = uniqueNamesGenerator({
			dictionaries: [adjectives, animals],
			separator: '-',
			style: 'lowerCase'
		});
	} while ([...users.values()].some((u) => u.name === name));
	return name;
}

export function randomSessionCode(): string {
	let code: string;
	do {
		code = Math.random().toString(10).slice(2, 2 + SESSION_CODE_LENGTH);
	} while ([...sessions.values()].some((s) => s.code === code));
	return code;
}

export function randomShareCode(): string {
		let code: string;
	do {
		code = Math.random().toString(10).slice(2, 2 + SHARE_CODE_LENGTH);
	} while ([...shares.keys()].some((s) => s === code));
	return code;
}

export function randomInviteToken(): string {
	let token: string;
	do {
		token = Math.random().toString(10).slice(2, 2 + INVITE_TOKEN_LENGTH);
	} while ([...invites.keys()].some((s) => s === token));
	return token;
}