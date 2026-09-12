export const GOOGLE_CLIENT_ID = '1048722634593-9gp0lfqbnekgc7k8mhn6gol8l1h64ffg.apps.googleusercontent.com';

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

// Global declaration for Google Identity Services SDK
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: any) => void;
          };
        };
      };
    };
  }
}

/**
 * Parses JWT token payload from Google Credential response
 */
export function decodeGoogleJwt(token: string): GoogleUserProfile | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub || parsed.id || `g_${Date.now()}`,
      name: parsed.name || parsed.given_name || 'Google User',
      email: parsed.email || '',
      picture: parsed.picture || undefined,
    };
  } catch (e) {
    console.warn('[GoogleAuth] Failed to decode JWT payload:', e);
    return null;
  }
}

/**
 * Loads the official Google Identity Services script if not already present
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.accounts) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Initializes In-App Google Identity Services (One-Tap & In-App UI)
 */
export async function initGoogleInAppAuth(
  onSuccess: (user: GoogleUserProfile) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    await loadGoogleScript();
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response && response.credential) {
          const profile = decodeGoogleJwt(response.credential);
          if (profile) {
            onSuccess(profile);
            return;
          }
        }
        onError?.(new Error('Failed to retrieve user profile from Google.'));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
  } catch (err: any) {
    onError?.(err);
  }
}

/**
 * Renders the official in-app Google Sign-In button into a DOM container
 */
export async function renderGoogleButton(
  container: HTMLElement,
  onSuccess: (user: GoogleUserProfile) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    await initGoogleInAppAuth(onSuccess, onError);
    if (!window.google?.accounts?.id) return;

    container.innerHTML = '';
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      logo_alignment: 'left',
      width: container.clientWidth || 320,
    });
  } catch (err: any) {
    onError?.(err);
  }
}

/**
 * Triggers In-App Google Sign In with One-Tap and seamless in-app dialog
 */
export async function triggerGoogleSignIn(): Promise<GoogleUserProfile> {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    let resolved = false;

    // 1. Try In-App Google Identity Services (One-Tap / Embedded Credential Manager)
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response && response.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              resolved = true;
              resolve(profile);
              return;
            }
          }
          if (!resolved) {
            reject(new Error('Google sign-in could not be completed.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to in-app token client flow if One-Tap was skipped or blocked
          if (!resolved && window.google?.accounts?.oauth2) {
            try {
              const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'openid email profile',
                callback: async (tokenResponse: any) => {
                  if (tokenResponse && tokenResponse.access_token) {
                    try {
                      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: {
                          Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                      });

                      if (res.ok) {
                        const data = await res.json();
                        resolved = true;
                        resolve({
                          sub: data.sub || `g_${Date.now()}`,
                          name: data.name || data.given_name || 'Google User',
                          email: data.email || '',
                          picture: data.picture || undefined,
                        });
                      } else {
                        reject(new Error('Failed to fetch user information from Google.'));
                      }
                    } catch (fetchErr) {
                      reject(fetchErr);
                    }
                  } else {
                    reject(new Error('No access token returned from Google.'));
                  }
                },
                error_callback: (err: any) => {
                  reject(new Error(err?.message || 'Google Sign-In canceled or failed.'));
                },
              });

              tokenClient.requestAccessToken({ prompt: 'select_account' });
            } catch (fallbackErr) {
              reject(fallbackErr);
            }
          }
        }
      });
      return;
    }

    // 2. Direct Token Client Fallback
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });

                if (res.ok) {
                  const data = await res.json();
                  resolve({
                    sub: data.sub || `g_${Date.now()}`,
                    name: data.name || data.given_name || 'Google User',
                    email: data.email || '',
                    picture: data.picture || undefined,
                  });
                } else {
                  reject(new Error('Failed to fetch user information from Google.'));
                }
              } catch (fetchErr) {
                reject(fetchErr);
              }
            } else {
              reject(new Error('No access token returned from Google.'));
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err?.message || 'Google Sign-In canceled or failed.'));
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (e) {
        reject(e);
      }
      return;
    }

    reject(new Error('Google Identity Services SDK is not loaded.'));
  });
}
