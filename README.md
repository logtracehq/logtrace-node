# logtrace

Node.js client for the Logtrace API. Works in TypeScript and plain JavaScript.

## Install

```bash
npm install logtrace-node
```

## Usage

```ts
import { Client } from 'logtrace-node';

const client = Client.new(process.env.LOGTRACE_API_KEY!);

await client.createEvent({ ... });
await client.createSession({ ... });
await client.createAuditLog({ ... });
```

## Express middleware

Automatically attaches request context (IP, method, endpoint, headers, status code) to every call made inside a handler.

```ts
import { Client, logger, fromContext } from 'logtrace-node';

const client = Client.new(process.env.LOGTRACE_API_KEY!);

app.use(logger(client));

app.post('/login', async (req, res) => {
  const rc = fromContext(client);
  await rc.createSession({ loginAt: new Date(), status: 'active', ... });
  res.json({ ok: true });
});
```

`fromContext` falls back gracefully outside of HTTP context (workers, cron jobs, tests).

## Error handling

```ts
import { LogtraceError } from 'logtrace-node';

try {
  await client.createEvent({ ... });
} catch (err) {
  if (err instanceof LogtraceError) {
    console.error(err.statusCode, err.message);
  }
}
```
