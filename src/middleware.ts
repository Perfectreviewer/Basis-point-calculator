// Astro Middleware — protects /admin/* routes (except /admin/login)
import { defineMiddleware } from 'astro:middleware';
import { getSessionFromCookies, validateSessionToken } from '@admin/utils/auth';

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Only protect /admin/* routes (skip login page and API routes)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = getSessionFromCookies(context.request.headers.get('cookie'));

        if (!session) {
            return context.redirect('/admin/login');
            // console.log("Middleware would redirect here");
        }

        const user = await validateSessionToken(session);
        if (!user) {
            return context.redirect('/admin/login');
            // console.log("Middleware would redirect here 2");
        }
    }

    return next();
});
