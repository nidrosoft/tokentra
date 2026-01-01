/**
 * Provider API Test Script
 * 
 * Tests all 10 provider APIs to ensure they're working correctly.
 * Run with: npx tsx scripts/test-provider-apis.ts
 */

const BASE_URL = 'http://localhost:3000/api/v1';
const DEMO_ORG_ID = 'b1c2d3e4-f5a6-7890-bcde-f12345678901';

interface TestResult {
  provider: string;
  endpoint: string;
  status: 'pass' | 'fail';
  statusCode?: number;
  message: string;
  responseTime: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  endpoint: string,
  method: string = 'GET',
  body?: object
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    return {
      provider: name,
      endpoint: `${method} ${endpoint}`,
      status: response.ok ? 'pass' : 'fail',
      statusCode: response.status,
      message: response.ok 
        ? `Success: ${JSON.stringify(data).slice(0, 100)}...`
        : `Error: ${data.error || response.statusText}`,
      responseTime,
    };
  } catch (error) {
    return {
      provider: name,
      endpoint: `${method} ${endpoint}`,
      status: 'fail',
      message: `Network error: ${(error as Error).message}`,
      responseTime: Date.now() - startTime,
    };
  }
}

async function testProviderList() {
  console.log('\n📋 Testing Provider List API...\n');
  
  const result = await testEndpoint(
    'Provider List',
    `/providers?organization_id=${DEMO_ORG_ID}`
  );
  results.push(result);
  printResult(result);
}

async function testProviderTestEndpoint() {
  console.log('\n🔌 Testing Provider Connection Test API for all 10 providers...\n');
  
  const providers = [
    { 
      type: 'openai', 
      name: 'OpenAI',
      credentials: { type: 'api_key', adminApiKey: 'sk-test-key-12345' }
    },
    { 
      type: 'anthropic', 
      name: 'Anthropic',
      credentials: { type: 'api_key', adminApiKey: 'sk-ant-test-key-12345' }
    },
    { 
      type: 'google', 
      name: 'Google Vertex AI',
      credentials: { type: 'service_account', projectId: 'test-project', serviceAccountKey: '{}' }
    },
    { 
      type: 'azure', 
      name: 'Azure OpenAI',
      credentials: { type: 'api_key', apiKey: 'test-key', endpoint: 'https://test.openai.azure.com', subscriptionId: 'sub-123', resourceGroup: 'rg-test' }
    },
    { 
      type: 'aws', 
      name: 'AWS Bedrock',
      credentials: { type: 'access_key', accessKeyId: 'AKIATEST123', secretAccessKey: 'secret123', region: 'us-east-1' }
    },
    { 
      type: 'xai', 
      name: 'xAI (Grok)',
      credentials: { type: 'api_key', apiKey: 'xai-test-key-12345' }
    },
    { 
      type: 'deepseek', 
      name: 'DeepSeek',
      credentials: { type: 'api_key', apiKey: 'sk-deepseek-test-12345' }
    },
    { 
      type: 'mistral', 
      name: 'Mistral AI',
      credentials: { type: 'api_key', apiKey: 'mistral-test-key-12345' }
    },
    { 
      type: 'cohere', 
      name: 'Cohere',
      credentials: { type: 'api_key', apiKey: 'cohere-test-key-12345' }
    },
    { 
      type: 'groq', 
      name: 'Groq',
      credentials: { type: 'api_key', apiKey: 'gsk_test-key-12345' }
    },
  ];

  for (const provider of providers) {
    const result = await testEndpoint(
      provider.name,
      '/providers/test',
      'POST',
      {
        provider: provider.type,
        credentials: provider.credentials,
      }
    );
    results.push(result);
    printResult(result);
  }
}

async function testProviderCRUD() {
  console.log('\n📝 Testing Provider CRUD Operations...\n');
  
  // First, get existing providers to find a valid ID
  let existingProviderId: string | null = null;
  try {
    const listResponse = await fetch(`${BASE_URL}/providers?organization_id=${DEMO_ORG_ID}`);
    const listData = await listResponse.json();
    if (listData.data && listData.data.length > 0) {
      existingProviderId = listData.data[0].id;
      console.log(`   Found existing provider: ${existingProviderId}\n`);
    }
  } catch {}

  // Test creating a provider connection (using Groq which has simpler validation)
  // Note: This will fail credential validation since we're using a fake key
  const createResult = await testEndpoint(
    'Create Provider (expects validation failure)',
    '/providers',
    'POST',
    {
      organization_id: DEMO_ORG_ID,
      provider: 'groq',
      display_name: 'Test Groq Connection',
      credentials: { type: 'api_key', apiKey: 'gsk_test-create-12345' },
      settings: {
        syncInterval: 60,
        backfillDays: 30,
        enableRealtime: false,
        customDimensions: [],
      },
    }
  );
  // Mark as pass if we got a proper validation error (400) - that means the API is working
  if (createResult.statusCode === 400 && createResult.message.includes('Connection test failed')) {
    createResult.status = 'pass';
    createResult.message = 'API correctly validates credentials before creating';
  }
  results.push(createResult);
  printResult(createResult);

  // Use existing provider ID if available, otherwise use a valid UUID format
  const providerId = existingProviderId || '00000000-0000-0000-0000-000000000000';

  // Test getting a specific provider
  const getResult = await testEndpoint(
    'Get Provider',
    `/providers/${providerId}`
  );
  results.push(getResult);
  printResult(getResult);

  // Test updating a provider
  const updateResult = await testEndpoint(
    'Update Provider',
    `/providers/${providerId}`,
    'PATCH',
    {
      displayName: 'Updated Test Connection',
      settings: { syncInterval: 30 },
    }
  );
  results.push(updateResult);
  printResult(updateResult);

  // Test provider health
  const healthResult = await testEndpoint(
    'Provider Health',
    `/providers/${providerId}/health`
  );
  results.push(healthResult);
  printResult(healthResult);

  // Test sync history
  const historyResult = await testEndpoint(
    'Sync History',
    `/providers/${providerId}/sync`
  );
  results.push(historyResult);
  printResult(historyResult);

  // Test triggering a sync
  const syncResult = await testEndpoint(
    'Trigger Sync',
    `/providers/${providerId}/sync`,
    'POST'
  );
  results.push(syncResult);
  printResult(syncResult);

  // Test deleting a provider
  const deleteResult = await testEndpoint(
    'Delete Provider',
    `/providers/${providerId}`,
    'DELETE'
  );
  results.push(deleteResult);
  printResult(deleteResult);
}

async function testSyncAll() {
  console.log('\n🔄 Testing Sync All Providers...\n');
  
  const result = await testEndpoint(
    'Sync All',
    '/providers/sync-all',
    'POST',
    { organization_id: DEMO_ORG_ID }
  );
  results.push(result);
  printResult(result);
}

function printResult(result: TestResult) {
  const icon = result.status === 'pass' ? '✅' : '❌';
  const statusCode = result.statusCode ? ` [${result.statusCode}]` : '';
  console.log(`${icon} ${result.provider}: ${result.endpoint}${statusCode} (${result.responseTime}ms)`);
  if (result.status === 'fail') {
    console.log(`   └─ ${result.message}`);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total;
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`   - ${r.provider}: ${r.endpoint}`);
      console.log(`     ${r.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

async function main() {
  console.log('🚀 TokenTRA Provider API Test Suite');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Demo Org ID: ${DEMO_ORG_ID}`);
  console.log('='.repeat(60));

  try {
    // Test provider list
    await testProviderList();
    
    // Test connection testing for all 10 providers
    await testProviderTestEndpoint();
    
    // Test CRUD operations
    await testProviderCRUD();
    
    // Test sync all
    await testSyncAll();
    
    // Print summary
    printSummary();
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

main();
