/**
 * Blueberry Math Analyzer 3.0 - Authentication Validation Endpoint
 *
 * Validates user credentials (JWT token and cookies) by making a test request
 * to the official Blueberry Math API.
 *
 * SECURITY:
 * - Does NOT store any credentials in database
 * - Only validates that the token is valid with the Blueberry Math API
 * - Returns user information from the token payload
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

    // Validate token by requesting classes from Blueberry Math API
    // This will fail if the token is invalid or expired
    const response = await fetch(
      'https://dashboard.school.blueberrymath.com/api/front/courses?hasBlueBerry=1&lang=pt',
      {
        method: 'GET',
        headers
      }
    );

    if (!response.ok) {
      console.error('Token validation failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Decode JWT to get user information (basic JWT decode)
    const userName = decodeJWTName(cleanToken);

    return NextResponse.json({
      success: true,
      userName: userName || 'Professor',
      classesAvailable: true
    });

  } catch (error) {
    console.error('Authentication validation error:', error);
    return NextResponse.json(
      { error: 'Erro ao validar credenciais' },
      { status: 500 }
    );
  }
}

/**
 * Decodes user name from JWT token (simple base64 decode)
 * This is a client-side decode for display purposes only
 */
function decodeJWTName(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const claims = JSON.parse(decoded);

    // Try to extract user name from various possible fields
    return claims.name || claims.username || claims.email || null;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}
