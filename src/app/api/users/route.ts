import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getCurrentUser } from '@/lib/auth';

const ROLE_NAME_TO_ID: Record<string, number> = {
  ADMIN: 4,
  AGENT: 5,
  MANAGER: 6,
  EMPLOYEE: 7,
};

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const roleId = ROLE_NAME_TO_ID[role as string];
    if (!roleId) {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roleId },
      select: { id: true, name: true, email: true, role: { select: { name: true } } },
    });

    return NextResponse.json({ user: { ...user, id: String(user.id), role: user.role.name } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = request.nextUrl.searchParams.get('role');

    const users = await prisma.user.findMany({
      where: role ? { role: { name: role } } : undefined,
      select: { id: true, name: true, email: true, role: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ users: users.map((u) => ({ id: String(u.id), name: u.name, email: u.email, role: u.role.name })) });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
