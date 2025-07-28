import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { users } from './store';

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
