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

    const journals = dbOperations.getJournalsByUserId(session.user.id);

    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, mood } = await req.json();

    if (!title || !content || mood === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const journal = await dbOperations.createJournal({
      title,
      content,
      mood: parseInt(mood),
      userId: session.user.id
    });

    return NextResponse.json(journal);
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}