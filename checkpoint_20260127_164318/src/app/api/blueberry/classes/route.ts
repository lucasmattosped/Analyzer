/**
 * Blueberry Math Analyzer 3.0 - Fetch Classes Endpoint
 *
 * Fetches the list of classes (courses) from the official Blueberry Math API
 * using the authenticated user's credentials.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, cookies } = await request.json();

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Token JWT é obrigatório' },
        { status: 400 }
      );
    }

    // Clean token (remove "Bearer " prefix if present)
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Build headers for Blueberry Math API request
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'authorization': `Bearer ${cleanToken}`,
      'referer': 'https://dashboard.school.blueberrymath.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    };

    // Add cookies if provided
    if (cookies) {
      headers['cookie'] = cookies;
    }

    // Request classes from Blueberry Math API
    const response = await fetch(
      'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt',
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      console.error('Fetch classes failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erro ao buscar turmas da API Blueberry Math' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract classes from response
    // The API response structure may vary, so we handle multiple possible formats
    let classes: any[] = [];

    if (Array.isArray(data)) {
      classes = data;
    } else if (data.data && Array.isArray(data.data)) {
      classes = data.data;
    } else if (data.courses && Array.isArray(data.courses)) {
      classes = data.courses;
    }

    // Transform to our format
    const formattedClasses = classes
      .filter((cls: any) => cls.guid && cls.name) // Filter out invalid entries
      .map((cls: any) => ({
        guid: cls.guid,
        name: cls.name,
        hasBlueBerry: cls.hasBlueBerry !== undefined ? cls.hasBlueBerry : true
      }));

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      total: formattedClasses.length
    });

  } catch (error) {
    console.error('Fetch classes error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar turmas' },
      { status: 500 }
    );
  }
}
