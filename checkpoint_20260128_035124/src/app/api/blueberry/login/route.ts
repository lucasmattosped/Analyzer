/**
 * Blueberry Math Analyzer 3.0 - Enhanced Login Endpoint
 *
 * Authenticates user with Blueberry Math API using email and password.
 * Accepts manual cookies for enhanced compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, cookies: manualCookies } = await request.json();

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
    console.log('Has manual cookies:', !!manualCookies);

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

    // Use manual cookies if provided, otherwise note it
    const cookiesToStore = manualCookies ? manualCookies.trim() : null;
    const cookiesNote = manualCookies 
      ? 'Manual cookies provided by user' 
      : 'Using JWT token only - if this fails, try providing cookies manually';

    return NextResponse.json({
      status: 'success',
      data: {
        token,
        school,
        userName: school?.name || 'Professor',
        schoolsCount: delegatedSchools?.length || 0,
        // Return cookies for subsequent requests
        cookies: cookiesToStore,
        cookiesNote: cookiesNote
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
