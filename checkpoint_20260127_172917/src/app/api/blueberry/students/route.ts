/**
 * Blueberry Math Analyzer 3.0 - Fetch Students Endpoint
 *
 * Fetches student data for a specific class from official Blueberry Math API
 * using authenticated user's JWT token.
 *
 * The data returned includes:
 * - Time spent by each student
 * - Activity counts (correct, incorrect, abandoned)
 * - Knowledge Components (KCs) mastered/forgotten
 * - Identified difficulties
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, classGuid, days } = await request.json();

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

    // Validate days parameter
    const daysNum = days ? parseInt(days.toString()) : 7;
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      return NextResponse.json(
        { error: 'Parâmetro days deve estar entre 1 e 90' },
        { status: 400 }
      );
    }

    console.log('=== BLUEBERRY MATH FETCH STUDENTS ===');
    console.log('Class GUID:', classGuid);
    console.log('Period (days):', daysNum);
    console.log('URL: https://dashboard.school.blueberrymath.com/api/blueberry/teacher/' + classGuid + '/students?days=' + daysNum + '&lang=pt');
    console.log('Timestamp:', new Date().toISOString());

    // Build headers for Blueberry Math API request
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'authorization': `Bearer ${token}`,
      'referer': `https://dashboard.school.blueberrymath.com/${classGuid}/reports`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    };

    // Request students from Blueberry Math API
    const response = await fetch(
      `https://dashboard.school.blueberrymath.com/api/blueberry/teacher/${classGuid}/students?days=${daysNum}&lang=pt`,
      {
        method: 'GET',
        headers
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('Fetch students failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Erro ao buscar alunos da API Blueberry Math' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('Response data:', {
      hasData: !!data.data,
      hasUsers: !!data.users,
      hasStudents: !!data.students,
      dataArray: Array.isArray(data.data),
      usersArray: Array.isArray(data.users),
      studentsArray: Array.isArray(data.students)
    });

    // Extract students from response
    let students: any[] = [];

    if (Array.isArray(data)) {
      students = data;
    } else if (data.data && Array.isArray(data.data)) {
      students = data.data;
    } else if (data.users && Array.isArray(data.users)) {
      students = data.users;
    } else if (data.students && Array.isArray(data.students)) {
      students = data.students;
    } else {
      // Try to find users array recursively
      students = findUsersRecursively(data);
    }

    console.log('Students extracted:', students.length);

    // Validate that we got student data
    if (!Array.isArray(students)) {
      console.error('Unexpected response structure:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'Formato de resposta inválido da API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      students: students,
      total: students.length,
      period: daysNum
    });

  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alunos' },
      { status: 500 }
    );
  }
}

/**
 * Recursively searches for a users array in response object
 */
function findUsersRecursively(obj: any): any[] {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findUsersRecursively(item);
      if (result.length > 0) {
        return result;
      }
    }
    return [];
  }

  if (obj === null || typeof obj !== 'object') {
    return [];
  }

  // Check if this object has a users array
  if (obj.users && Array.isArray(obj.users)) {
    return obj.users;
  }

  // Check if this object has a students array
  if (obj.students && Array.isArray(obj.students)) {
    return obj.students;
  }

  // Recursively search in properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const result = findUsersRecursively(obj[key]);
      if (result.length > 0) {
        return result;
      }
    }
  }

  return [];
}
