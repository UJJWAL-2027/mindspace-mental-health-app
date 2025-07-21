import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbOperations } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const moods = dbOperations.getMoodsByUserId(session.user.id);

    return NextResponse.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { value, note } = await req.json();

    if (value === undefined) {
      return NextResponse.json({ error: 'Mood value is required' }, { status: 400 });
    }

    const mood = await dbOperations.createMood({
      value: parseInt(value),
      note: note || null,
      userId: session.user.id
    });

    return NextResponse.json(mood);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}