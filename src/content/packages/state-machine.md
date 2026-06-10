---
name: "juststeveking/state-machine"
description: "A small, framework-agnostic PHP state machine for modeling valid transitions between states."
packagist: "https://packagist.org/packages/juststeveking/state-machine"
github: "https://github.com/JustSteveKing/state-machine"
link: "https://github.com/JustSteveKing/state-machine"
tech: ["PHP"]
featured: false
downloads: 114
monthlyDownloads: 114
stars: 0
version: "dev-main"
updatedAt: "2026-06-10"
---

# State Machine

A small, framework-agnostic PHP state machine for modeling valid transitions between states.

It is built around three contracts:
- `StateContract`
- `TransitionContract`
- `StateMachineContract`

You define your own states, transitions, and domain events. The package validates transitions and throws clear exceptions when a transition is invalid.

## Requirements

- PHP 8.5+

## Installation

```bash
composer require juststeveking/state-machine
```

## 30-Second Quick Start

If you already have your own states and transitions, this is the smallest working flow:

```php
<?php

declare(strict_types=1);

use App\Domain\Posts\PostStateMachine;
use App\Domain\Posts\Transitions\PublishPost;
use JustSteveKing\StateMachine\Exceptions\InvalidTransitionException;
use JustSteveKing\StateMachine\StateMachine;

$stateMachine = new StateMachine(
	machine: new PostStateMachine(currentStatus: 'draft'),
);

try {
	$event = $stateMachine->transition(
		transition: new PublishPost(),
		context: ['can_publish' => true],
	);

	// Persist new status, dispatch event, etc.
} catch (InvalidTransitionException $exception) {
	// Return/log why the transition was denied
}
```

## How It Works

When you attempt a transition, the package checks:

1. Is this transition class registered on the machine?
2. Is the current state one of the transition's allowed `from()` states?
3. Does the transition `guard()` allow it?
4. If all pass, create and return the domain event from `eventClass()`.

If any check fails, an `InvalidTransitionException` is thrown.

## Quick Start

This example models publishing a blog post from draft to published.

### 1. Create your states

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts\States;

use JustSteveKing\StateMachine\Contracts\StateContract;

final class DraftState implements StateContract
{
	public function value(): string
	{
		return 'draft';
	}

	public function label(): string
	{
		return 'Draft';
	}
}

final class PublishedState implements StateContract
{
	public function value(): string
	{
		return 'published';
	}

	public function label(): string
	{
		return 'Published';
	}
}
```

### 2. Create your event

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts\Events;

use JustSteveKing\StateMachine\Events\DomainEvent;

final class PostPublished extends DomainEvent
{
	public function name(): string
	{
		return 'post.published';
	}
}
```

### 3. Create a transition

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts\Transitions;

use App\Domain\Posts\Events\PostPublished;
use App\Domain\Posts\States\DraftState;
use App\Domain\Posts\States\PublishedState;
use JustSteveKing\StateMachine\Contracts\StateContract;
use JustSteveKing\StateMachine\Contracts\TransitionContract;

final class PublishPost implements TransitionContract
{
	/**
	 * @return array<int, StateContract>
	 */
	public function from(): array
	{
		return [new DraftState()];
	}

	public function to(): StateContract
	{
		return new PublishedState();
	}

	/**
	 * @return class-string<PostPublished>
	 */
	public function eventClass(): string
	{
		return PostPublished::class;
	}

	public function guard(mixed $context): ?string
	{
		if (! is_array($context) || ($context['can_publish'] ?? false) !== true) {
			return 'User is not allowed to publish this post.';
		}

		return null;
	}
}
```

### 4. Create a machine adapter for your model/entity

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts;

use App\Domain\Posts\States\DraftState;
use App\Domain\Posts\Transitions\PublishPost;
use JustSteveKing\StateMachine\Contracts\StateContract;
use JustSteveKing\StateMachine\Contracts\StateMachineContract;
use JustSteveKing\StateMachine\Contracts\TransitionContract;

final readonly class PostStateMachine implements StateMachineContract
{
	public function __construct(
		private string $currentStatus,
	) {}

	/**
	 * @return array<int, TransitionContract>
	 */
	public function transitions(): array
	{
		return [
			new PublishPost(),
		];
	}

	public function currentState(): StateContract
	{
		return match ($this->currentStatus) {
			'draft' => new DraftState(),
			default => new DraftState(),
		};
	}
}
```

### 5. Run a transition

```php
<?php

declare(strict_types=1);

use App\Domain\Posts\PostStateMachine;
use App\Domain\Posts\Transitions\PublishPost;
use JustSteveKing\StateMachine\Exceptions\InvalidTransitionException;
use JustSteveKing\StateMachine\StateMachine;

$machine = new StateMachine(
	machine: new PostStateMachine(currentStatus: 'draft'),
);

try {
	$event = $machine->transition(
		transition: new PublishPost(),
		context: ['can_publish' => true],
	);

	// $event->from, $event->to, $event->context, $event->occurredAt
} catch (InvalidTransitionException $exception) {
	// Handle denial / invalid transition
	// Example: log, return a validation message, etc.
}
```

## Second Example: Publish And Archive

This example shows one machine with multiple transitions and state-dependent rules.

Use this when you want to support a lifecycle like `draft -> published -> archived`.

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts\Transitions;

use App\Domain\Posts\Events\PostArchived;
use App\Domain\Posts\States\ArchivedState;
use App\Domain\Posts\States\PublishedState;
use JustSteveKing\StateMachine\Contracts\StateContract;
use JustSteveKing\StateMachine\Contracts\TransitionContract;

final class ArchivePost implements TransitionContract
{
	/**
	 * @return array<int, StateContract>
	 */
	public function from(): array
	{
		return [new PublishedState()];
	}

	public function to(): StateContract
	{
		return new ArchivedState();
	}

	/**
	 * @return class-string<PostArchived>
	 */
	public function eventClass(): string
	{
		return PostArchived::class;
	}

	public function guard(mixed $context): ?string
	{
		if (! is_array($context) || ($context['can_archive'] ?? false) !== true) {
			return 'User is not allowed to archive this post.';
		}

		return null;
	}
}
```

```php
<?php

declare(strict_types=1);

namespace App\Domain\Posts;

use App\Domain\Posts\States\ArchivedState;
use App\Domain\Posts\States\DraftState;
use App\Domain\Posts\States\PublishedState;
use App\Domain\Posts\Transitions\ArchivePost;
use App\Domain\Posts\Transitions\PublishPost;
use JustSteveKing\StateMachine\Contracts\StateContract;
use JustSteveKing\StateMachine\Contracts\StateMachineContract;
use JustSteveKing\StateMachine\Contracts\TransitionContract;

final readonly class PostStateMachine implements StateMachineContract
{
	public function __construct(
		private string $currentStatus,
	) {}

	/**
	 * @return array<int, TransitionContract>
	 */
	public function transitions(): array
	{
		return [
			new PublishPost(),
			new ArchivePost(),
		];
	}

	public function currentState(): StateContract
	{
		return match ($this->currentStatus) {
			'draft' => new DraftState(),
			'published' => new PublishedState(),
			'archived' => new ArchivedState(),
			default => new DraftState(),
		};
	}
}
```

```php
<?php

declare(strict_types=1);

use App\Domain\Posts\PostStateMachine;
use App\Domain\Posts\Transitions\ArchivePost;
use JustSteveKing\StateMachine\StateMachine;

$machine = new StateMachine(
	machine: new PostStateMachine(currentStatus: 'published'),
);

$event = $machine->transition(
	transition: new ArchivePost(),
	context: ['can_archive' => true],
);

// $event->from->value() === 'published'
// $event->to->value() === 'archived'
```

## Exception Messages

`InvalidTransitionException` includes named constructors and clear messages for:
- Transition class is not registered on the machine
- Current state is not allowed by the transition
- Guard rejected the transition

This makes it easy to return user-friendly validation errors or audit denied actions.

## Important Notes

- Transition registration is class-based, not instance-based.
  - If the machine registers `PublishPost::class`, any `new PublishPost()` instance is accepted.
  - A different class with similar logic is still rejected as not registered.
- `guard()` must return `null` to allow transition.
- Any non-null string from `guard()` denies transition and becomes part of the exception message.

## Testing

If you are contributing to this package:

```bash
composer test
composer stan
composer lint
```

## License

[MIT](./LICENSE)

