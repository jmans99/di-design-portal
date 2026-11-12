# Dot AI

Dot's box and the reply bars send typed text to a model. This replaces the
keyword matcher as the first step; the matcher stays as the fallback.

## Flow

1. Typed text goes to `/?ask=<text>` (`components/dot/ai-conversation.tsx`).
2. The page posts the chat to `POST /api/dot` (`app/api/dot/route.ts`).
3. The model returns one action (`lib/dot/ai.ts`):
   - `create` + a format: Dot starts that format, as a tile click would.
   - `search` + search words: Dot opens the asset search reply (`/?find=…`).
   - `answer` + a reply and up to three portal pages: shown in the chat, which
     then goes on in the reply bar.
4. For the first message, `create` and `search` replace `/?ask=…` in history,
   so Back does not ask the model again.

In the scripted conversation (`components/dot/conversation.tsx`) a typed reply
inside a format's flow is still matched with keywords, so the flow is kept.
On the "couldn't match" page (no format) it goes to the AI.

## Without a key

`/api/dot` answers 503 when `OPENAI_API_KEY` is not set. The page then uses the
keyword matcher (`lib/dot/intent.ts`) exactly as before: format, asset search,
or "I couldn't match that yet". After the first 503 the page stops asking for
the rest of the visit. The same fallback applies if the model call fails on
the first message.

## Configuration

- `OPENAI_API_KEY` (server only, never `NEXT_PUBLIC_`): in `.env.local` for
  local work, and in the Vercel project settings for production.
- `OPENAI_BASE_URL` (optional): the API base, without `/responses`. Defaults
  to OpenAI. For the UNICEF AI gateway (Azure API Management) it is
  `https://apim-ai-gateway-sndbx.azure-api.net/openai/v1`, and the key is the
  subscription key from the gateway's developer portal.
- `OPENAI_MODEL` (optional): defaults to the model named in the route. Behind
  the gateway it is the deployment name.

The route uses the Responses API (`POST {base}/responses`) with a strict JSON
schema, and sends the key both as `Authorization: Bearer` and as `api-key`.

## Guard rails

- The key stays on the server; the browser only talks to `/api/dot`.
- The model's output is checked: formats and page links come from fixed lists,
  so a made-up link or format is dropped.
- The prompt holds the brand facts (fonts, colour scales from
  `lib/color-tokens.ts`) and tells the model not to invent facts or numbers.
- Cost limits: at most 12 messages of 600 characters per request, a short
  reply, same-site requests only, and 20 requests a minute per client (in
  memory, per server instance). The portal has no login, so also set a monthly
  spending limit on the key itself.
