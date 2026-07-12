import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), 'src/data/messages.json');

// Helper to load messages
async function readMessages() {
  try {
    const content = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// Helper to save messages
async function writeMessages(data: any[]) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/messages - Fetch messages (Admin only)
export async function GET(request: Request) {
  try {
    const headerPassword = request.headers.get('x-admin-password');
    const systemPassword = process.env.ADMIN_PASSWORD;

    if (!systemPassword) {
      return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
    }

    if (headerPassword !== systemPassword) {
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    const messages = await readMessages();
    // Return newest messages first
    return NextResponse.json(messages.reverse());
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}

// POST /api/messages - Submit contact form (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      subject: subject || 'No Subject',
      message,
      timestamp: new Date().toISOString()
    };

    const currentMessages = await readMessages();
    currentMessages.push(newMessage);
    await writeMessages(currentMessages);

    // =========================================================================
    // DYNAMIC NOTIFICATION HOOK PLACEHOLDER
    // =========================================================================
    // You can easily plug in a Slack/Discord webhook, or email transporter here!
    // Example Discord Webhook call:
    /*
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    if (DISCORD_WEBHOOK_URL) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📬 **New Portfolio Message!**\n**From:** ${name} (${email})\n**Subject:** ${subject}\n**Message:**\n${message}`
        })
      });
    }
    */
    // =========================================================================

    return NextResponse.json({ success: true, message: 'Message recorded successfully' });
  } catch (error) {
    console.error('Error recording message:', error);
    return NextResponse.json({ error: 'Failed to record message' }, { status: 500 });
  }
}

// DELETE /api/messages - Delete a message (Admin only)
export async function DELETE(request: Request) {
  try {
    const headerPassword = request.headers.get('x-admin-password');
    const systemPassword = process.env.ADMIN_PASSWORD;

    if (!systemPassword) {
      return NextResponse.json({ error: 'Server misconfigured: ADMIN_PASSWORD not set' }, { status: 500 });
    }

    if (headerPassword !== systemPassword) {
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const currentMessages = await readMessages();
    const updatedMessages = currentMessages.filter((msg: any) => msg.id !== id);
    
    await writeMessages(updatedMessages);

    return NextResponse.json({ success: true, message: 'Message removed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
