import type { PageServerLoad } from "./$types";
import { parseAuthCookie } from "$lib/server/cookies";

export const load: PageServerLoad = ({ cookies }) => {
  const auth = parseAuthCookie(cookies);
  return {
    autoResume: auth ?? null
  };
};
