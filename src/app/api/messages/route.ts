import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

// Local-dev contact inbox. In production the contact form posts to Formspree
// (email delivery), so this filesystem-backed inbox is never written on Vercel.
const MESSAGES_FILE = path.join(process.cwd(), 'src/data/messages.json');
const isServerless = !!process.env.VERCEL;

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

async function readMessages(): Promise<Message[]> {
  try {
    const content = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(content) as Message[];
  } catch {
    return [];
  }
}

async function writeMessages(data: Message[]) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/messages - Fetch messages (Admin only)
export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const messages = await readMessages();
    return NextResponse.json(messages.reverse()); // newest first
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

// POST /api/messages - Submit contact form (Public, local dev only)
export async function POST(request: Request) {
  // On Vercel the filesystem is read-only; the contact form uses Formspree there.
  if (isServerless) {
    return NextResponse.json(
      { error: 'Inbox is local-dev only. Set NEXT_PUBLIC_FORMSPREE_ENDPOINT for production.' },
      { status: 501 }
    );
  }
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      subject: subject || 'No Subject',
      message,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = await readMessages();
    currentMessages.push(newMessage);
    await writeMessages(currentMessages);

    return NextResponse.json({ success: true, message: 'Message recorded successfully' });
  } catch (error) {
    console.error('Error recording message:', error);
    return NextResponse.json({ error: 'Failed to record message' }, { status: 500 });
  }
}

// DELETE /api/messages?id=... - Delete a message (Admin only)
export async function DELETE(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const updated = (await readMessages()).filter((msg) => msg.id !== id);
    await writeMessages(updated);

    return NextResponse.json({ success: true, message: 'Message removed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
