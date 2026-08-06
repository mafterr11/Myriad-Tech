import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {updateSession} from './lib/supabase/proxy';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request) {
  return updateSession(request, intlMiddleware);
}
 
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
