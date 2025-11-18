import { NextResponse } from 'next/server';
import { getAllContentItems } from '@/lib/content-utils';

export async function GET() {
  try {
    const items = getAllContentItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching content items:', error);
    return NextResponse.json({ error: 'Failed to fetch content items' }, { status: 500 });
  }
}

