import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserWithOrg } from "@/lib/auth/session";
import { createAnalysisEngine } from "@/lib/optimization/analysis-engine";

/**
 * POST /api/v1/optimization/analyze
 * Trigger enterprise optimization analysis (18 categories)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserWithOrg();
    let organizationId: string;
    
    if (user?.organizationId) {
      organizationId = user.organizationId;
    } else if (process.env.NODE_ENV === 'development' && process.env.DEMO_ORGANIZATION_ID) {
      organizationId = process.env.DEMO_ORGANIZATION_ID;
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse optional parameters
    const body = await request.json().catch(() => ({}));
    const days = body.days || 30;

    // Run enterprise optimization analysis
    const engine = createAnalysisEngine({ orgId: organizationId });
    const result = await engine.analyze(days);

    // Save recommendations to database
    const savedCount = await engine.analyzeAndSave();

    return NextResponse.json({
      success: true,
      data: {
        status: "completed",
        recommendationsGenerated: result.recommendations.length,
        savedRecommendations: savedCount,
        patternsDetected: result.patterns.length,
        anomaliesDetected: result.anomalies.length,
        analyzedRecords: result.analyzedRecords,
        analysisTimeMs: result.analysisTimeMs,
        summary: {
          totalSpend: result.summary.totalSpend,
          potentialSavings: result.summary.potentialSavings,
          savingsPercent: result.summary.savingsPercent,
          healthScore: result.summary.healthScore,
          topOpportunities: result.summary.topOpportunities.slice(0, 5),
        },
      },
    });
  } catch (error) {
    console.error("Error in POST /api/v1/optimization/analyze:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run optimization analysis" },
      { status: 500 }
    );
  }
}
