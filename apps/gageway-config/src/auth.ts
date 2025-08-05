/**
 * [auth的相关文档] https://authjs.dev/getting-started/adapters/prisma
 */

import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/db/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    // 关联数据库
    adapter: PrismaAdapter(prisma),  
    trustHost: true,
    
    theme: {
        logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
    },
    providers: [GitHub],
    
    // 可选：自定义回调
    callbacks: {
        session: async ({ session, user }) => {
            if (session?.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
})


