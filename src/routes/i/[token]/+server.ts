import { redirect, type RequestHandler } from '@sveltejs/kit';
import { sessions, invites, createNewUser } from '$lib/server/store';
import { setAuthCookie } from '$lib/server/cookies';

export const GET: RequestHandler = ({ params, cookies, url }) => {

    if (!params.token) {
        return new Response('token missing', { status: 400 });
    }
	const invite = invites.get(params.token);
	if (!invite) return new Response('link invalid', { status: 410 });

	const session = sessions.get(invite);
	if (!session) return new Response('session missing', { status: 404 });

	invites.delete(params.token);

    const user = createNewUser(session.id, true, "From invite");

	setAuthCookie(cookies, user.id, session.id );

	throw redirect(302, '/');
};