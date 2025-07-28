import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { users, sessions} from './store';
import { env } from '$env/dynamic/public';

const CODE_LENGTH = parseInt(env.PUBLIC_SESSION_CODE_LENGTH?? "6");

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

export function randomCode(): string {
	let code: string;
	do {
		code = Math.random().toString(10).slice(2, 2 + CODE_LENGTH);
	} while ([...sessions.values()].some((s) => s.code === code));
	return code;
}