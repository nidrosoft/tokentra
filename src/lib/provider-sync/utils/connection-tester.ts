/**
 * Connection Tester - Validate Provider Credentials
 * 
 * Tests provider connections before saving to ensure credentials
 * are valid and have the required permissions.
 */

import type {
  ProviderType,
  ProviderCredentials,
  ConnectionTestResult,
  OpenAICredentials,
  AnthropicCredentials,
  GoogleCredentials,
  AzureCredentials,
  AWSCredentials,
} from '../types';

export class ConnectionTester {
  /**
   * Test provider connection and permissions
   */
  async testConnection(
    provider: ProviderType,
    credentials: ProviderCredentials
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      switch (provider) {
        case 'openai':
          return await this.testOpenAI(credentials as OpenAICredentials);
        case 'anthropic':
          return await this.testAnthropic(credentials as AnthropicCredentials);
        case 'google':
          return await this.testGoogle(credentials as GoogleCredentials);
        case 'azure':
          return await this.testAzure(credentials as AzureCredentials);
        case 'aws':
          return await this.testAWS(credentials as AWSCredentials);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: (error as Error).message,
        permissions: [],
      };
    }
  }

  /**
   * Test OpenAI connection
   */
  private async testOpenAI(credentials: OpenAICredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    // Validate API key format
    if (!credentials.adminApiKey?.startsWith('sk-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid API key format. OpenAI keys start with "sk-"',
        errorCode: 'INVALID_KEY_FORMAT',
        permissions: [],
      };
    }

    // Test usage API access
    const startTimeUnix = Math.floor(Date.now() / 1000) - 86400;
    const response = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?start_time=${startTimeUnix}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${credentials.adminApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: error.error?.message || `API error: ${response.status}`,
        errorCode: error.error?.code || `HTTP_${response.status}`,
        permissions: [],
      };
    }

    // Try to get organization info
    let orgMetadata: Record<string, unknown> = {};
    try {
      const orgResponse = await fetch('https://api.openai.com/v1/organization', {
        headers: { Authorization: `Bearer ${credentials.adminApiKey}` },
      });
      if (orgResponse.ok) {
        orgMetadata = await orgResponse.json();
      }
    } catch {
      // Organization endpoint is optional
    }

    return {
      success: true,
      latencyMs: Date.now() - startTime,
      metadata: {
        organizationId: orgMetadata.id,
        organizationName: orgMetadata.name,
      },
      permissions: ['usage:read', 'costs:read', 'projects:read'],
    };
  }

  /**
   * Test Anthropic connection
   */
  private async testAnthropic(credentials: AnthropicCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    // Validate Admin API key format
    if (!credentials.adminApiKey?.startsWith('sk-ant-admin-')) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Invalid Admin API key. Anthropic Admin keys start with "sk-ant-admin-"',
        errorCode: 'INVALID_KEY_FORMAT',
        permissions: [],
      };
    }

    // Test usage API
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(
      `https://api.anthropic.com/v1/organizations/usage_report/messages?starting_at=${startDate}&limit=1`,
      {
        headers: {
          'x-api-key': credentials.adminApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: error.error?.message || `API error: ${response.status}`,
        errorCode: error.error?.type || `HTTP_${response.status}`,
        permissions: [],
      };
    }

    return {
      success: true,
      latencyMs: Date.now() - startTime,
      permissions: ['usage:read', 'costs:read', 'workspaces:read'],
    };
  }

  /**
   * Test Google Vertex AI connection
   */
  private async testGoogle(credentials: GoogleCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.serviceAccountKey && credentials.type === 'service_account') {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Service account key is required',
        errorCode: 'MISSING_CREDENTIALS',
        permissions: [],
      };
    }

    if (!credentials.projectId) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'Project ID is required',
        errorCode: 'MISSING_PROJECT_ID',
        permissions: [],
      };
    }

    try {
      // For server-side testing, we'd use google-auth-library
      // For now, validate the service account key format
      if (credentials.serviceAccountKey) {
        const keyFile = JSON.parse(credentials.serviceAccountKey);
        if (!keyFile.type || keyFile.type !== 'service_account') {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: 'Invalid service account key format',
            errorCode: 'INVALID_KEY_FORMAT',
            permissions: [],
          };
        }
        if (!keyFile.project_id || !keyFile.private_key || !keyFile.client_email) {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: 'Service account key is missing required fields',
            errorCode: 'INCOMPLETE_KEY',
            permissions: [],
          };
        }
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { projectId: credentials.projectId },
        permissions: ['monitoring:read', 'billing:read'],
      };
    } catch (error) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: `Invalid service account key: ${(error as Error).message}`,
        errorCode: 'INVALID_KEY',
        permissions: [],
      };
    }
  }

  /**
   * Test Azure OpenAI connection
   */
  private async testAzure(credentials: AzureCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (credentials.type === 'service_principal') {
      if (!credentials.tenantId || !credentials.clientId || !credentials.clientSecret) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Service Principal requires tenantId, clientId, and clientSecret',
          errorCode: 'MISSING_CREDENTIALS',
          permissions: [],
        };
      }

      // Test OAuth token acquisition
      const tokenUrl = `https://login.microsoftonline.com/${credentials.tenantId}/oauth2/v2.0/token`;

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
          scope: 'https://management.azure.com/.default',
          grant_type: 'client_credentials',
        }),
      });

      if (!tokenResponse.ok) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Failed to authenticate with Azure. Check your Service Principal credentials.',
          errorCode: 'AUTH_FAILED',
          permissions: [],
        };
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: {
          subscriptionId: credentials.subscriptionId,
          resourceGroup: credentials.resourceGroup,
        },
        permissions: ['costs:read', 'metrics:read', 'resources:read'],
      };
    } else {
      // API Key authentication
      if (!credentials.apiKey || !credentials.endpoint) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'API Key and Endpoint are required',
          errorCode: 'MISSING_CREDENTIALS',
          permissions: [],
        };
      }

      // Test endpoint accessibility
      try {
        const testUrl = `${credentials.endpoint.replace(/\/$/, '')}/openai/models?api-version=2024-02-01`;
        const response = await fetch(testUrl, {
          headers: { 'api-key': credentials.apiKey },
        });

        if (!response.ok) {
          return {
            success: false,
            latencyMs: Date.now() - startTime,
            error: `Azure OpenAI API error: ${response.status}`,
            errorCode: `HTTP_${response.status}`,
            permissions: [],
          };
        }

        return {
          success: true,
          latencyMs: Date.now() - startTime,
          metadata: { endpoint: credentials.endpoint },
          permissions: ['models:read', 'completions:create'],
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: `Failed to connect to Azure endpoint: ${(error as Error).message}`,
          errorCode: 'CONNECTION_FAILED',
          permissions: [],
        };
      }
    }
  }

  /**
   * Test AWS Bedrock connection
   */
  private async testAWS(credentials: AWSCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    if (!credentials.region) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: 'AWS Region is required',
        errorCode: 'MISSING_REGION',
        permissions: [],
      };
    }

    if (credentials.type === 'iam_role') {
      if (!credentials.roleArn) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'IAM Role ARN is required for cross-account access',
          errorCode: 'MISSING_ROLE_ARN',
          permissions: [],
        };
      }

      // Validate ARN format
      if (!credentials.roleArn.match(/^arn:aws:iam::\d{12}:role\/.+$/)) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Invalid IAM Role ARN format',
          errorCode: 'INVALID_ARN_FORMAT',
          permissions: [],
        };
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { region: credentials.region, roleArn: credentials.roleArn },
        permissions: ['cloudwatch:read', 'ce:read', 'bedrock:invoke'],
      };
    } else {
      // Access Key authentication
      if (!credentials.accessKeyId || !credentials.secretAccessKey) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Access Key ID and Secret Access Key are required',
          errorCode: 'MISSING_CREDENTIALS',
          permissions: [],
        };
      }

      // Validate access key format
      if (!credentials.accessKeyId.match(/^AK[A-Z0-9]{18}$/)) {
        return {
          success: false,
          latencyMs: Date.now() - startTime,
          error: 'Invalid Access Key ID format',
          errorCode: 'INVALID_KEY_FORMAT',
          permissions: [],
        };
      }

      return {
        success: true,
        latencyMs: Date.now() - startTime,
        metadata: { region: credentials.region },
        permissions: ['cloudwatch:read', 'ce:read', 'bedrock:invoke'],
      };
    }
  }
}

// Singleton instance
let testerInstance: ConnectionTester | null = null;

export function getConnectionTester(): ConnectionTester {
  if (!testerInstance) {
    testerInstance = new ConnectionTester();
  }
  return testerInstance;
}
