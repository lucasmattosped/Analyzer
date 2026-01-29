/**
 * Blueberry Math Analyzer 3.0 - Fetch Classes Endpoint
 *
 * Fetches list of classes (courses) from official Blueberry Math API
 * using authenticated user's credentials and ALL required headers.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, cookies, userAgent, baggage } = await request.json();

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Token JWT é obrigatório' },
        { status: 400 }
      );
    }

    console.log('=== BLUEBERRY MATH FETCH CLASSES ===');
    console.log('URL: https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt');
    console.log('Timestamp:', new Date().toISOString());

    // Build headers for Blueberry Math API request - replicate Python script headers
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'authorization': `Bearer ${token}`,
    };

    // Add optional headers if provided
    if (cookies) {
      headers['cookie'] = cookies;
    }

    if (userAgent) {
      headers['user-agent'] = userAgent;
    }

    if (baggage) {
      headers['baggage'] = baggage;
    }

    // Default user agent if not provided
    if (!userAgent) {
      headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      headers['priority'] = 'u=1, i';
    }

    // Request classes from Blueberry Math API
    const response = await fetch(
      'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt',
      {
        method: 'GET',
        headers
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Fetch classes failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erro ao buscar turmas da API Blueberry Math' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Response data:', {
      isArray: Array.isArray(data),
      hasData: !!data.data,
      dataArray: Array.isArray(data.data),
      dataLength: Array.isArray(data) ? data.length : (Array.isArray(data.data) ? data.data.length : 0)
    });

    // Extract classes from response
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
      .filter((cls: any) => cls.guid && cls.name)
      .map((cls: any) => ({
        guid: cls.guid,
        name: cls.name,
        hasBlueBerry: cls.hasBlueBerry !== undefined ? cls.hasBlueBerry : true
      }));

    console.log('Classes fetched:', formattedClasses.length);

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
