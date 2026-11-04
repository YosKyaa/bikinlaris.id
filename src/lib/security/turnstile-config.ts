/** Cloudflare Turnstile settings shared by the /ikut widget and the server check. */

/** Widget script, loaded on /ikut only (also allowed in the CSP, next.config.ts). */
export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
export const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
/** The widget's action; the server refuses tokens made for another form. */
export const TURNSTILE_SIGNUP_ACTION = "daftar";
/** Tokens are at most 2048 characters (Cloudflare docs). */
export const TURNSTILE_TOKEN_MAX_LENGTH = 2048;
