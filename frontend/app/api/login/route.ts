import crypto from 'crypto';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const REGION = process.env.COGNITO_REGION ?? process.env.NEXT_PUBLIC_AWS_REGION ?? 'us-west-1';
const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

function getSecretHash(username: string) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Cognito client id/secret is not configured on the server.');
  }

  return crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest('base64');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: 'Cognito client id is not configured on the server.' },
      { status: 500 },
    );
  }

  try {
    const client = new CognitoIdentityProviderClient({ region: REGION });
    const authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    if (CLIENT_SECRET) {
      authParameters.SECRET_HASH = getSecretHash(email);
    }

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: authParameters,
    });

    const response = await client.send(command);
    const idToken = response.AuthenticationResult?.IdToken;

    if (!idToken) {
      return NextResponse.json(
        { error: 'Login succeeded, but Cognito did not return an ID token.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ idToken });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed.';

    return NextResponse.json({ error: message }, { status: 401 });
  }
}
