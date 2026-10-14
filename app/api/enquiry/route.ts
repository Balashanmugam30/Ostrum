import { NextResponse } from 'next/server';

export interface EnquiryPayload {
  name: string;
  email: string;
  city?: string;
  phone?: string;
  company?: string;
  position?: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: EnquiryPayload = await request.json();

    const { name, email, city, phone, company, position, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Full name is required.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    // RFC 5322 compliant email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project description or message is required.' },
        { status: 400 }
      );
    }

    // Server-side audit log
    console.log('[Ostrum Enquiry Received]', {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      city: city?.trim() || 'N/A',
      phone: phone?.trim() || 'N/A',
      company: company?.trim() || 'N/A',
      position: position?.trim() || 'N/A',
      messageLength: message.trim().length,
    });

    // In a production environment with email credentials (e.g. RESEND_API_KEY, SENDGRID_API_KEY),
    // you can dispatch an email to hello@ostrum.co here.
    return NextResponse.json(
      {
        success: true,
        message:
          'Thank you for reaching out. We have received your project details and a studio partner will be in touch within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Ostrum Enquiry Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process enquiry. Please try again or email hello@ostrum.co directly.' },
      { status: 500 }
    );
  }
}
