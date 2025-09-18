import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import { issues, users } from '@/db/schema'
import { mockDelay } from './utils'
import { unstable_cacheTag } from 'next/cache'

export const getCurrentUser = async () => {
    const session = await getSession()
    if (!session) {
        return null
    }

    try {
        const results = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))

        return results[0] || null
    } catch (e) {
        console.error('Error fetching user by email:', e)
        return null
    }
    
}

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })
        return user
    } catch (e) {
        console.error('Error fetching user by email:', e)
        return null
    }

}

export async function getIssues() {
    'use cache' // Prevents the dashboard from refetching issues on every render
    // However, it can't be used with dynamic data such as user authentication (currentUser)
    cacheTag('issues-list') // Invalidate this cache tag when issues are created/updated/deleted to refetch the list
    try {
        await mockDelay(1000) // Simulate network delay
        // const currentUser = await getCurrentUser()
        //     if (!currentUser) {
        //     throw new Error('Unauthorized')
        // }
        const result = await db.query.issues.findMany({
        //where: eq(issues.userId, currentUser.id), // Prevents user from fetching all user data
        with: {
            user: true, // This block joins tables in the DB (User and Issue)
        },
        orderBy: (issues, { desc }) => [desc(issues.createdAt)],
        })
        return result
    } catch (error) {
        console.error('Error fetching issues:', error)
        throw new Error('Failed to fetch issues')
    }
}

export const getIssue = async(id: number) => {
    try {
        await mockDelay(500) // Simulate network delay
        const issue = await db.query.issues.findFirst({
        where: eq(issues.id, id),
        with: {
            user: true,
        },
        })
        return issue
    } catch (e) {
        console.error('Error fetching issue by id:', e)
        return null
    }
    
}