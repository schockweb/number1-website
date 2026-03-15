import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, company } = await req.json();

        // Validate inputs
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        // Check for existing account
        const existing = await prisma.siteUser.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        // Hash password — 12 rounds is the sweet spot (secure + not too slow)
        const passwordHash = await bcrypt.hash(password, 12);

        // Save to database
        const user = await prisma.siteUser.create({
            data: {
                name,
                email,
                passwordHash,
                company: company || null,
                plan: 'Free Tier',
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                company: user.company,
                plan: user.plan,
            },
        });
    } catch (err) {
        console.error('[/api/auth/register]', err);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
