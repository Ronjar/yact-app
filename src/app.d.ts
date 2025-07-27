declare global {
	namespace App {
interface Locals {
			__io?: true;
			server: import("http").Server;
		}

		interface Platform {
			server: import("http").Server;
		}
	}
}

export {};
