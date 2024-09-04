import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    

    return NextResponse.json({ text: 'bruh' });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: 'An error occurred while processing the PDF.' }, { status: 500 });
  }
}