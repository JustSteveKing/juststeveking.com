---
name: "juststeveking/tabstack"
description: "A PHP library allowing access to the Tabstack REST API"
packagist: "https://packagist.org/packages/juststeveking/tabstack"
github: "https://github.com/JustSteveKing/tabstack"
link: "https://github.com/JustSteveKing/tabstack"
tech: ["PHP"]
featured: false
downloads: 1
monthlyDownloads: 1
stars: 0
version: "dev-main"
updatedAt: "2026-06-23"
---

# Tabstack PHP API Library

[](https://packagist.org/packages/juststeveking/tabstack)

This library provides convenient access to the Tabstack REST API from PHP.

## Installation

```shell
composer require juststeveking/tabstack
```

## Usage

```php
use JustSteveKing\Tabstack\Tabstack;
use JustSteveKing\Tabstack\Requests\AgentAutomate;

$client = Tabstack::make(apiKey: $_ENV['TABSTACK_API_KEY']);

$response = $client->agent()->automate(
    params: new AgentAutomate(
        task: 'Find the top 3 trending repositories and extract their names, descriptions, and star counts',
    ),
);
```

### Request & Response types

All request parameters are typed value objects and all responses are strongly-typed DTOs. You may import and use them directly:

```php
use JustSteveKing\Tabstack\Tabstack;
use JustSteveKing\Tabstack\Requests\ExtractJson;
use JustSteveKing\Tabstack\Responses\ExtractJsonResponse;

$client = Tabstack::make(apiKey: $_ENV['TABSTACK_API_KEY']);

$params = new ExtractJson(
    url: 'https://example.com/products',
    jsonSchema: [
        'type' => 'object',
        'properties' => [
            'name' => ['type' => 'string'],
            'price' => ['type' => 'number'],
        ],
    ],
);

$result = $client->extract()->json(params: $params);
// $result->data — the extracted structured data as an array
```

```php
use JustSteveKing\Tabstack\Requests\ExtractMarkdown;
use JustSteveKing\Tabstack\Requests\MarkdownContent;
use JustSteveKing\Tabstack\Responses\ExtractMarkdownResponse;

$result = $client->extract()->markdown(
    params: new ExtractMarkdown(
        url: 'https://example.com/article',
        content: MarkdownContent::Main, // Main (article only, default) | Full (entire page)
        metadata: true,
    ),
);
// $result->content  — clean Markdown string
// $result->url      — original URL
// $result->metadata — title, description, image (when metadata: true)
```

```php
use JustSteveKing\Tabstack\Requests\GenerateJson;
use JustSteveKing\Tabstack\Responses\GenerateJsonResponse;

$result = $client->generate()->json(
    params: new GenerateJson(
        url: 'https://example.com/article',
        instructions: 'Summarise the article and list key takeaways.',
        jsonSchema: [
            'type' => 'object',
            'properties' => [
                'summary' => ['type' => 'string'],
                'takeaways' => ['type' => 'array', 'items' => ['type' => 'string']],
            ],
        ],
    ),
);
// $result->data — AI-transformed structured data
```

### Effort levels

The `extract` and `generate` endpoints accept an optional `EffortLevel` enum that controls the speed vs. capability tradeoff:

```php
use JustSteveKing\Tabstack\Requests\EffortLevel;
use JustSteveKing\Tabstack\Requests\ExtractMarkdown;

$result = $client->extract()->markdown(
    params: new ExtractMarkdown(
        url: 'https://example.com',
        effort: EffortLevel::Max, // Min | Standard | Max
    ),
);
```

| Value | Speed | Behaviour |
|-------|-------|-----------|
| `Min` | 1–5s | Fastest; no JS rendering fallback |
| `Standard` | 3–15s | Balanced reliability (default) |
| `Max` | 15–60s | Full browser rendering for JS-heavy sites |

### Geotargeting

Any request that accepts a `GeoTarget` will route the fetch through a proxy in the specified country (ISO 3166-1 alpha-2):

```php
use JustSteveKing\Tabstack\Requests\ExtractMarkdown;
use JustSteveKing\Tabstack\Requests\GeoTarget;

$result = $client->extract()->markdown(
    params: new ExtractMarkdown(
        url: 'https://example.com',
        geoTarget: new GeoTarget(country: 'GB'),
    ),
);
```

### Agent endpoints (streaming)

`agent()->automate()` and `agent()->research()` always stream via Server-Sent Events. Instead of a raw PSR-7 response, they return a typed, iterable stream (`AutomateStream` / `ResearchStream`) that parses the SSE body incrementally and yields typed events as they arrive.

```php
use JustSteveKing\Tabstack\Requests\AgentResearch;
use JustSteveKing\Tabstack\Requests\ResearchMode;

$stream = $client->agent()->research(
    params: new AgentResearch(
        query: 'What are the latest advancements in quantum computing?',
        mode: ResearchMode::Balanced,
    ),
);

// 1. Iterate — process each event as it streams in
foreach ($stream as $event) {
    echo $event->event . PHP_EOL; // e.g. "searching:start", "writing:end", "complete"
}
```

Three ways to consume a stream:

```php
// 2. Callback — invoke a handler per event
$stream->each(function ($event): void {
    // $event->event is the event name, $event->data the payload
});

// 3. Collect — drain the whole stream into an array of events
$events = $stream->collect();

// 4. Wait — block until the task settles, returning the terminal event
//    (complete / error, plus done for automate)
$final = $stream->wait();

// 5. Result — block and map the terminal `complete` event to a typed result
$report = $stream->result(); // ResearchResult|null (AutomateResult|null for automate)
```

#### Typed results

`result()` consumes the stream and returns a typed view of the final `complete` event:

```php
$report = $client->agent()->research(
    params: new AgentResearch(query: 'Latest in quantum computing'),
)->result();

echo $report->report;                          // the synthesised report (markdown)
echo $report->metadata->get('totalPagesAnalyzed');

$result = $client->agent()->automate(params: $task)->result();
if ($result->success) {
    echo $result->finalAnswer;
    echo $result->stats?->durationMs;
}
```

#### Resuming a stream

Each event exposes its SSE `id` and the stream tracks the latest via `lastEventId()`. If a connection drops, resume by passing it back — the SDK sends it as the `Last-Event-ID` header:

```php
$stream = $client->agent()->research(params: $query);

try {
    foreach ($stream as $event) { /* ... */ }
} catch (\JustSteveKing\Tabstack\Exceptions\ConnectionException $e) {
    $resumed = $client->agent()->research(params: $query, lastEventId: $stream->lastEventId());
}
```

#### Event payloads

Each event exposes a string `event` name and a `data` payload. Object payloads are wrapped in an immutable `Payload` that supports both accessor and array syntax; scalar payloads are returned as-is.

```php
$final = $client->agent()->research(
    params: new AgentResearch(query: 'Latest in quantum computing'),
)->wait();

$answer  = $final->data->get('answer');        // accessor, with optional default
$sources = $final->data->get('sources', []);
$hasMeta = $final->data->has('metrics');        // key presence
$raw     = $final->data->toArray();             // back to a plain array
$answer  = $final->data['answer'];              // ArrayAccess (read-only)
```

There is no typed class per event type — the event set is open-ended, so payloads stay flexible.

#### Interactive mode

When an automate task is started with `interactive: true`, the stream emits `interactive:form_data:request` events carrying a `requestId`. Respond with `agent()->automateInput()` — supply field values or cancel. Input requests expire after two minutes.

```php
use JustSteveKing\Tabstack\Requests\AgentAutomate;
use JustSteveKing\Tabstack\Requests\AgentAutomateInput;
use JustSteveKing\Tabstack\Requests\InputField;

$stream = $client->agent()->automate(
    params: new AgentAutomate(
        task: 'Sign in and download the latest invoice',
        url: 'https://example.com/login',
        interactive: true,
    ),
);

foreach ($stream as $event) {
    if ('interactive:form_data:request' === $event->event) {
        $client->agent()->automateInput(
            params: new AgentAutomateInput(
                requestId: $event->data->get('requestId'),
                fields: [
                    new InputField(ref: 'email', value: 'user@example.com'),
                    new InputField(ref: 'password', value: $_ENV['SITE_PASSWORD']),
                ],
            ),
        );
    }
}
```

#### Action firewall

`automate` runs behind an action firewall that guards against prompt injection. Two `AgentAutomate` parameters relax it — use with care:

```php
use JustSteveKing\Tabstack\Requests\AgentAutomate;

new AgentAutomate(
    task: 'Complete the checkout flow',
    url: 'https://shop.example.com',
    trustedHostnames: ['shop.example.com'], // bypass the firewall for these hosts only
    unsafeMode: false,                       // true disables the firewall entirely — avoid in production
);
```

> ⚠️ `unsafeMode` removes injection protection for every host. Only set `trustedHostnames` for hosts you fully control.

## Configuration

`Tabstack::make()` works with just an API key, but accepts an optional base URI (to target a different environment) and your own PSR-18 client (to configure timeouts, retries, logging, or any middleware):

```php
use JustSteveKing\Tabstack\Tabstack;

$client = Tabstack::make(
    apiKey: $_ENV['TABSTACK_API_KEY'],
    baseUri: 'https://api.tabstack.ai/v1',   // optional, this is the default
    client: $myConfiguredPsr18Client,        // optional, otherwise auto-discovered
);
```

Every request is sent with a `User-Agent: tabstack-php/{version}` header.

### Retries

By default the client retries rate-limited (429) and connection failures up to twice, honouring the `Retry-After` header and falling back to exponential backoff. Tune it with `RetryConfig` — including opt-in retries for 5xx server errors:

```php
use JustSteveKing\Tabstack\RetryConfig;
use JustSteveKing\Tabstack\Tabstack;

$client = Tabstack::make(
    apiKey: $_ENV['TABSTACK_API_KEY'],
    retry: new RetryConfig(
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        retryServerErrors: true,
    ),
);

// Disable retries entirely:
$client = Tabstack::make(apiKey: $_ENV['TABSTACK_API_KEY'], retry: RetryConfig::disabled());
```

## Error handling

Any non-2xx response throws a `TabstackException` subclass, mapped from the HTTP status. Transport failures (DNS, connection refused, timeouts) are wrapped in a `ConnectionException`. Every exception exposes the `statusCode` and the decoded response `body`.

```php
use JustSteveKing\Tabstack\Exceptions\AuthenticationException;
use JustSteveKing\Tabstack\Exceptions\RateLimitException;
use JustSteveKing\Tabstack\Exceptions\TabstackException;

try {
    $result = $client->extract()->json(params: $params);
} catch (RateLimitException $e) {
    sleep($e->retryAfter ?? 5);   // seconds, from the Retry-After header
} catch (AuthenticationException $e) {
    // 401 — bad or missing API key
} catch (TabstackException $e) {
    report($e->getMessage(), $e->statusCode, $e->body);
}
```

| Exception | Status |
|-----------|--------|
| `BadRequestException` | 400 |
| `AuthenticationException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `ValidationException` | 422 |
| `RateLimitException` | 429 (exposes `retryAfter`) |
| `ClientException` | other 4xx |
| `ServerException` | 5xx |
| `ConnectionException` | transport failure (no response) |

All extend `TabstackException`, so catch that to handle everything. Streaming endpoints (`automate`, `research`) throw the same exceptions if the request fails before the stream begins.

## Requirements

- PHP 8.5 or later
- A PSR-18 HTTP client (e.g. `symfony/http-client`) — discovered automatically via `php-http/discovery`
- A PSR-17 HTTP factory (e.g. `nyholm/psr7`) — included as a dependency

## Semantic versioning

This package generally follows [SemVer](https://semver.org/spec/v2.0.0.html) conventions, though certain backwards-incompatible changes may be released as minor versions:

1. Changes that only affect static types, without breaking runtime behaviour.
2. Changes to library internals which are technically public but not intended or documented for external use.
3. Changes that we do not expect to impact the vast majority of users in practice.

We are keen for your feedback; please open an [issue](https://github.com/juststeveking/tabstack/issues) with questions, bugs, or suggestions.

## Credits

- [Steve McDougall](https://github.com/JustSteveKing)
- [All Contributors](../../contributors)

## LICENSE

The MIT License (MIT). Please see [License File](./LICENSE) for more information.

