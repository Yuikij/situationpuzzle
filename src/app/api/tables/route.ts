import {  NextResponse } from 'next/server';
import { getTablesWithRawSQL } from '../../lib/db-pg';

export async function GET() {
  try {
    // 查询数据库的所有表名
    const tables = await getTablesWithRawSQL();
    
    return NextResponse.json({ 
      success: true,
      tables: tables,
      count: tables.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database query error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 