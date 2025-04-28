import * as React from 'react';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { AuthError } from 'next-auth';
import { providerMap, signIn } from '@/auth';

export default function SignIn() {
    return (
        <SignInPage
            localeText={{ signInTitle: 'Login to TAUU', to: '', signInSubtitle: 'Please Login with your school Google Account' }}
            providers={providerMap}
            signIn={async (
                provider: AuthProvider,
                callbackUrl?: string,
            ) => {
                'use server';
                try {
                    return await signIn(provider.id, {
                        redirectTo: callbackUrl ?? '/',
                    });
                } catch (error) {
                    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
                        throw error;
                    }
                    // Handle Auth.js errors
                    if (error instanceof AuthError) {
                        return {
                            error: error.message,
                            type: error.type,
                        };
                    }
                    return {
                        error: 'Internal Server Error',
                        type: 'UnknownError',
                    };
                }
            }}
        />
    );
}
