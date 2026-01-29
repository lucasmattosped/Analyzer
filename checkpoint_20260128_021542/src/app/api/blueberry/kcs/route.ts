/**
 * Blueberry Math Analyzer 3.0 - Fetch Knowledge Components (KCs) Endpoint
 *
 * Fetches list of Knowledge Components for a specific class from
 * official Blueberry Math API using authenticated user's JWT token.
 *
 * Knowledge Components represent specific mathematical topics and skills
 * that students are working on.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, classGuid } = await request.json();

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

    console.log('=== BLUEBERRY MATH FETCH KCS ===');
    console.log('Class GUID:', classGuid);
    console.log('URL: https://dashboard.school.blueberrymath.com/api/blueberry/teacher/' + classGuid + '/kcs?lang=pt');
    console.log('Timestamp:', new Date().toISOString());

    // Build headers for Blueberry Math API request
    // NOTE: Authorization uses token directly WITHOUT 'Bearer' prefix (per FLUXO-INTEGRACAO-BLUEBERRY.md)
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'Authorization': token,  // Token only, NO 'Bearer' prefix
      'Referer': `https://dashboard.school.blueberrymath.com/${classGuid}/reports`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    };

    // Request KCs from Blueberry Math API
    const response = await fetch(
      `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${classGuid}/kcs?lang=pt`,
      {
        method: 'GET',
        headers
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Fetch KCs failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erro ao buscar componentes de conhecimento da API Blueberry Math' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Response data:', {
      hasData: !!data.data,
      hasKcs: !!data.kcs,
      dataArray: Array.isArray(data.data),
      kcsArray: Array.isArray(data.kcs)
    });

    // Extract KCs from response
    let kcs: any[] = [];

    if (Array.isArray(data)) {
      kcs = data;
    } else if (data.data && Array.isArray(data.data)) {
      kcs = data.data;
    } else if (data.kcs && Array.isArray(data.kcs)) {
      kcs = data.kcs;
    }

    console.log('KCs extracted:', kcs.length);

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
