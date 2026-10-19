import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const SETTINGS_KEY = 'admin_availability';

// Default: Mon-Fri enabled (0=Sun, 1=Mon, ..., 6=Sat)
const DEFAULT_AVAILABILITY = {
  enabledDays: [1, 2, 3, 4, 5], // Mon-Fri
  startHour: 9,
  endHour: 17,
  meetingDuration: 30,
  adminNotifyEmail: '',
  emailNotificationsEnabled: false,
};

// GET /api/admin/availability — Public (used by booking page)
export async function GET() {
  try {
    const row = await prisma.adminSetting.findUnique({ where: { key: SETTINGS_KEY } });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      return NextResponse.json({ ...DEFAULT_AVAILABILITY, ...parsed });
    }
    return NextResponse.json(DEFAULT_AVAILABILITY);
  } catch (err) {
    console.error('[admin/availability] GET error:', err);
    return NextResponse.json(DEFAULT_AVAILABILITY);
  }
}

// PUT /api/admin/availability — Admin only (saves settings)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = {
      enabledDays: body.enabledDays ?? DEFAULT_AVAILABILITY.enabledDays,
      startHour: body.startHour ?? DEFAULT_AVAILABILITY.startHour,
      endHour: body.endHour ?? DEFAULT_AVAILABILITY.endHour,
      meetingDuration: body.meetingDuration ?? DEFAULT_AVAILABILITY.meetingDuration,
      adminNotifyEmail: body.adminNotifyEmail ?? DEFAULT_AVAILABILITY.adminNotifyEmail,
      emailNotificationsEnabled: body.emailNotificationsEnabled ?? DEFAULT_AVAILABILITY.emailNotificationsEnabled,
    };

    await prisma.adminSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(settings) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(settings) },
    });

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('[admin/availability] PUT error:', err);
    return NextResponse.json({ error: 'Failed to save availability settings' }, { status: 500 });
  }
}
