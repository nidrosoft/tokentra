/**
 * Test Script for FTUE (First-Time User Experience) System
 * Run with: npx tsx scripts/test-ftue.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testFTUEPages() {
  console.log("\n📄 Testing FTUE-enabled Pages...\n");

  const pages = [
    "/dashboard",
    "/dashboard/usage",
    "/dashboard/providers",
    "/dashboard/budgets",
    "/dashboard/alerts",
  ];

  let passed = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`);
      const html = await response.text();
      
      // Check if FTUEProvider is present
      const hasFTUE = html.includes("FTUEProvider") || html.includes("ftue");
      
      if (response.ok) {
        console.log(`✅ ${page}: Returns ${response.status}${hasFTUE ? " (FTUE enabled)" : ""}`);
        passed++;
      } else {
        console.log(`❌ ${page}: Returns ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${page}: Failed -`, error);
      failed++;
    }
  }

  console.log(`\nPage Tests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

async function testFTUELibrary() {
  console.log("\n🔧 Testing FTUE Library...\n");

  try {
    // Test tours
    const { TOURS, getTour, getTourForPage } = await import("../src/lib/ftue/tours");
    
    console.log(`✅ Tours loaded: ${Object.keys(TOURS).length} tours defined`);
    
    const dashboardTour = getTour("dashboard_intro");
    if (dashboardTour) {
      console.log(`   - dashboard_intro: ${dashboardTour.steps.length} steps`);
    }
    
    const pageTour = getTourForPage("/dashboard");
    if (pageTour) {
      console.log(`   - Tour for /dashboard: ${pageTour.id}`);
    }

    // Test celebrations
    const { CELEBRATIONS, getCelebrationForTrigger } = await import("../src/lib/ftue/celebrations");
    
    console.log(`✅ Celebrations loaded: ${CELEBRATIONS.length} celebrations defined`);
    
    const providerCelebration = getCelebrationForTrigger("provider_connected");
    if (providerCelebration) {
      console.log(`   - provider_connected: "${providerCelebration.title}"`);
    }

    // Test tooltips
    const { CONTEXTUAL_TOOLTIPS } = await import("../src/lib/ftue/tooltips");
    
    console.log(`✅ Tooltips loaded: ${CONTEXTUAL_TOOLTIPS.length} tooltips defined`);

    // Test store
    const { useFTUEStore } = await import("../src/lib/ftue/store");
    
    console.log(`✅ FTUE Store loaded successfully`);

    // Test analytics
    const { FTUE_EVENTS, trackFTUEEvent } = await import("../src/lib/ftue/analytics");
    
    console.log(`✅ Analytics loaded: ${Object.keys(FTUE_EVENTS).length} event types`);

    return true;
  } catch (error) {
    console.error("❌ FTUE Library test failed:", error);
    return false;
  }
}

async function testEmptyStates() {
  console.log("\n📭 Testing Empty States...\n");

  try {
    const { EMPTY_STATES } = await import("../src/components/ftue/EmptyState");
    
    const states = Object.keys(EMPTY_STATES);
    console.log(`✅ Empty States loaded: ${states.length} states defined`);
    
    states.forEach((state) => {
      const config = EMPTY_STATES[state];
      console.log(`   - ${state}: "${config.title}"`);
    });

    return true;
  } catch (error) {
    console.error("❌ Empty States test failed:", error);
    return false;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  TokenTra FTUE (First-Time User Experience) System Tests");
  console.log("═══════════════════════════════════════════════════════════");

  const results = {
    ftueLibrary: await testFTUELibrary(),
    emptyStates: await testEmptyStates(),
    ftuePages: await testFTUEPages(),
  };

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Test Summary");
  console.log("═══════════════════════════════════════════════════════════");

  const allPassed = Object.values(results).every((r) => r);

  Object.entries(results).forEach(([name, passed]) => {
    console.log(`  ${passed ? "✅" : "❌"} ${name}`);
  });

  console.log("\n" + (allPassed ? "🎉 All tests passed!" : "⚠️ Some tests failed"));
  
  console.log("\n📋 FTUE System Summary:");
  console.log("   - Product Tours: Interactive step-by-step guides");
  console.log("   - Celebrations: Confetti, toasts, modals for milestones");
  console.log("   - Empty States: Actionable UI when no data exists");
  console.log("   - Help Widget: Floating help button with contextual help");
  console.log("   - State Persistence: Progress saved in localStorage");
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
