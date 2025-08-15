import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: Log SOS event
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 [SOS API] Received SOS log request');

    const body = await request.json();
    const { latitude, longitude, status, message, userId } = body;

    // Validate required fields
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !status) {
      console.error('❌ [SOS API] Invalid request data:', { latitude, longitude, status });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: latitude, longitude, status' 
        },
        { status: 400 }
      );
    }

    // Create SOS log entry
    // TODO: Uncomment when database is connected and migrated
    const sosLog = {
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      latitude: parseFloat(latitude.toString()),
      longitude: parseFloat(longitude.toString()),
      status: status.toString(),
      message: message ? message.toString() : null,
      userId: userId ? userId.toString() : null,
      timestamp: new Date(),
    };
    
    // await prisma.sOSLog.create({
    //   data: {
    //     latitude: parseFloat(latitude.toString()),
    //     longitude: parseFloat(longitude.toString()),
    //     status: status.toString(),
    //     message: message ? message.toString() : null,
    //     userId: userId ? userId.toString() : null,
    //     timestamp: new Date(),
    //   },
    // });

    console.log('✅ [SOS API] SOS event logged successfully:', sosLog.id);

    return NextResponse.json({
      success: true,
      message: 'SOS event logged successfully',
      log: {
        id: sosLog.id,
        latitude: sosLog.latitude,
        longitude: sosLog.longitude,
        status: sosLog.status,
        timestamp: sosLog.timestamp,
      },
    });

  } catch (error) {
    console.error('💥 [SOS API] Error logging SOS event:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log SOS event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve SOS history
export async function GET(request: NextRequest) {
  try {
    console.log('📋 [SOS API] Received SOS history request');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query conditions
    const whereCondition = userId ? { userId } : {};

    // Fetch SOS logs
    // TODO: Replace with actual Prisma query when database is connected
    const sosLogs = [
      // Mock data for testing
      {
        id: 'mock_sos_1',
        userId: userId || null,
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'SMS Sent',
        message: 'Emergency test message',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    // await prisma.sOSLog.findMany({
    //   where: whereCondition,
    //   orderBy: { timestamp: 'desc' },
    //   take: Math.min(limit, 100),
    //   select: {
    //     id: true, userId: true, latitude: true, longitude: true,
    //     status: true, message: true, timestamp: true,
    //     createdAt: true, updatedAt: true,
    //   },
    // });

    console.log('✅ [SOS API] Retrieved', sosLogs.length, 'SOS logs');

    return NextResponse.json({
      success: true,
      logs: sosLogs,
      count: sosLogs.length,
    });

  } catch (error) {
    console.error('💥 [SOS API] Error retrieving SOS history:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve SOS history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Clear SOS history (optional)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ [SOS API] Received SOS history clear request');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Build delete conditions
    const whereCondition = userId ? { userId } : {};

    // Delete SOS logs
    // TODO: Replace with actual Prisma query when database is connected
    const deleteResult = { count: 0 };
    
    // await prisma.sOSLog.deleteMany({ where: whereCondition });

    console.log('✅ [SOS API] Deleted', deleteResult.count, 'SOS logs');

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteResult.count} SOS logs`,
      deletedCount: deleteResult.count,
    });

  } catch (error) {
    console.error('💥 [SOS API] Error clearing SOS history:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear SOS history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
