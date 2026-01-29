/**
 * Blueberry Math Analyzer 3.0 - Fetch Knowledge Components (KCs) Endpoint
 *
 * Fetches the list of Knowledge Components for a specific class from the
 * official Blueberry Math API using the authenticated user's credentials.
 *
 * Knowledge Components represent the specific mathematical topics and skills
 * that students are working on.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, cookies, classGuid } = await request.json();

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Token JWT é obrigatório' },
        { status: 400 }
      );
    }

    if (!classGuid) {
      return NextResponse.json(
        { error: 'GUID da turma é obrigatório' },
        { status: 400 }
      );
    }

    // Clean token (remove "Bearer " prefix if present)
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Build headers for Blueberry Math API request
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'authorization': `Bearer ${cleanToken}`,
      'referer': `https://dashboard.school.blueberrymath.com/${classGuid}/reports`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    };

    // Add cookies if provided
    if (cookies) {
      headers['cookie'] = cookies;
    }

    // Request KCs from Blueberry Math API
    const response = await fetch(
      `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${classGuid}/kcs?lang=pt`,
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      console.error('Fetch KCs failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erro ao buscar componentes de conhecimento da API Blueberry Math' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract KCs from response
    let kcs: any[] = [];

    if (Array.isArray(data)) {
      kcs = data;
    } else if (data.data && Array.isArray(data.data)) {
      kcs = data.data;
    } else if (data.kcs && Array.isArray(data.kcs)) {
      kcs = data.kcs;
    }

    return NextResponse.json({
      success: true,
      kcs: kcs,
      total: kcs.length
    });

  } catch (error) {
    console.error('Fetch KCs error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar componentes de conhecimento' },
      { status: 500 }
    );
  }
}
