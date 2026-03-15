import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// GET — fetch current user's profile
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.siteUser.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, company: true, plan: true, createdAt: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
}

// PATCH — update name, company, or password
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, company, currentPassword, newPassword } = await req.json();

    const updateData: Record<string, string> = {};

    if (name?.trim()) updateData.name = name.trim();
    if (company !== undefined) updateData.company = company.trim();

    // Password change — only if both fields provided
    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password is required to set a new one.' }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
        }

        const user = await prisma.siteUser.findUnique({ where: { id: session.user.id } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
        }

        updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.siteUser.update({
        where: { id: session.user.id },
        data: updateData,
        select: { id: true, name: true, email: true, company: true, plan: true, createdAt: true },
    });

    return NextResponse.json({ user: updated });
}
