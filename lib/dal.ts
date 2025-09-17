import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'
import { mockDelay } from './utils'

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
    await mockDelay(1000) // Simulate network delay
        
    try {

        const currentUser = await getCurrentUser()
            if (!currentUser) {
            throw new Error('Unauthorized')
        }
        const result = await db.query.issues.findMany({
        where: eq(issues.userId, currentUser.id), // Prevents user from fetching all user data
        with: {
            user: true, 
        },
        orderBy: (issues, { desc }) => [desc(issues.createdAt)],
        })
        return result
    } catch (error) {
        console.error('Error fetching issues:', error)
        throw new Error('Failed to fetch issues')
    }
}
