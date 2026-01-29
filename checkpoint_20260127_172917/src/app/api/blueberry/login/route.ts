/**
 * Blueberry Math Analyzer 3.0 - Enhanced Login Endpoint
 *
 * Authenticates user with Blueberry Math API using email and password.
 * Attempts multiple ways to capture cookies from the response.
 *
 * Based on blueberry_alunos.py - must replicate exact headers from working Python script
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('=== BLUEBERRY MATH LOGIN ===');
    console.log('URL: https://dashboard.school.blueberrymath.com/api/login');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());

    // Make login request to Blueberry Math API
    const loginResponse = await fetch('https://dashboard.school.blueberrymath.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      },
      body: JSON.stringify({ email, password }),
    });

    // Get ALL response headers
    const headersObj: Record<string, string> = {};
    loginResponse.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    console.log('Response headers received:', Object.keys(headersObj).length, 'headers');
    console.log('All headers:', headersObj);
    
    // Log important headers
    const setCookie = loginResponse.headers.get('set-cookie');
    const cookieHeader = loginResponse.headers.get('cookie');
    console.log('set-cookie header:', setCookie ? 'Present' : 'Not found');
    console.log('cookie header:', cookieHeader ? 'Present' : 'Not found');
    console.log('cookie in headersObj:', 'cookie' in headersObj ? 'Yes' : 'No');

    const loginData = await loginResponse.json();

    console.log('Response status:', loginResponse.status);
    console.log('Response data:', {
      status: loginData.status,
      hasToken: !!loginData.data?.token,
      tokenPreview: loginData.data?.token ? loginData.data.token.substring(0, 30) + '...' : 'none',
      hasSettings: !!loginData.data?.settings,
      delegatedSchoolsCount: loginData.data?.delegatedSchools?.length || 0,
    });
    console.log('============================');

    if (!loginResponse.ok || loginData.status !== 'success') {
      console.error('LOGIN FAILED:', loginData.message || 'Unknown error');
      return NextResponse.json(
        { error: loginData.message || 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const { token, delegatedSchools } = loginData.data;
    const school = delegatedSchools?.[0] || null;

    console.log('LOGIN SUCCESS - User authenticated');
    console.log('Has token:', !!token);
    console.log('Schools available:', delegatedSchools?.length || 0);
    if (school) {
      console.log('Primary school:', school.name);
    }

    // If set-cookie is not available, we'll use the raw cookies from headers
    const cookiesToStore = setCookie || cookieHeader || (headersObj['cookie'] || null);

    console.log('Cookies to be stored:', cookiesToStore ? 'Yes' : 'No');

    // Return ALL headers to frontend
    return NextResponse.json({
      status: 'success',
      data: {
        token,
        school,
        userName: school?.name || 'Professor',
        schoolsCount: delegatedSchools?.length || 0,
        // Return all headers for subsequent requests
        allHeaders: headersObj,
        // Specific headers needed
        cookies: cookiesToStore,
        userAgent: headersObj['user-agent'] || null,
        baggage: headersObj['baggage'] || null,
        // Note about cookies
        cookiesNote: cookiesToStore ? 'Captured from response' : 'Will use default headers'
      },
    });

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
