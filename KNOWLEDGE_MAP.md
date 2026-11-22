# Knowledge Map

What the user already knows, and how those topics connect. The "Active
Thinking (Always)" rule in `CLAUDE.md` and `CODEX.md` reads this file before
explaining something new, so each explanation can start from a topic the user
already knows.

## Rules

- Add or change an entry only when the user shows understanding (explains it
  back, applies it, or answers a `Think:` question correctly) or says what they
  already know. Covering a topic in a session is not the same as knowing it.
- Keep entries short. Update an entry as understanding deepens. Record a
  corrected misunderstanding under "Mixed up with" rather than deleting it.
- Domain terms and their meanings belong in `UBIQUITOUS_LANGUAGE.md`. This file
  records what the user knows and how it links.

## Depth

- `can explain`: could teach it to a teammate without notes.
- `can use`: applies it in real work, but may look details up.
- `shaky`: knows of it, but has gaps or mixes it up with something else.

## Learning focus

A goal the user stated on 2026-11-20, not evidence of knowledge, so it is not
an entry.

- The AI can produce code. The engineer's job is to design, integrate,
  validate and operate systems that stay dependable. Those are different jobs.
- Growing toward: software architecture and distributed systems.
- Use this to pick what to explain and what `Think:` asks. It is never a
  reason to add structure to code.

## Entry format

```text
### <Topic>
- Area: <Dart | Flutter | Riverpod | Drift/SQL | Android | Architecture | Distributed systems | Testing | Tooling | Payments | Other>
- Depth: <can explain | can use | shaky>
- Evidence: <how the user showed it> (<YYYY-MM-DD>)
- Connects to: <other topic> - <same idea | builds on | contrast>: <one line>
- Mixed up with: <optional: a topic the user confused this with, and the difference>
```

## Entries

Seed entries are self-reported, from an interview on 2026-11-18. Links marked
"suggested" are bridges to try in explanations. Drop the word "suggested" once
the user uses the link themselves.

Not on the map yet (start from zero, using the anchors below): software
architecture (layers, MVVM, DDD, SOLID, dependency injection, repositories) and
Android native (Kotlin/Java, Gradle, manifests, Pigeon).

### MQTT (publish/subscribe messaging)
- Area: Other (networking)
- Depth: can use
- Evidence: self-reported: has worked with it hands-on, but the fundamentals are not solid (2026-11-18)
- Connects to (suggested): Riverpod - same idea: `ref.watch` subscribes to a provider the way a client subscribes to a topic, and each new value triggers a rebuild

### Networking
- Area: Other (networking)
- Depth: can use
- Evidence: self-reported: has worked with it hands-on, but the fundamentals are not solid (2026-11-18)
- Connects to (suggested): Dart language - builds on: a network call takes time, which is why Dart returns a `Future` and code uses `await`

### CIDR ranges and firewall source filtering
- Area: Other (networking)
- Depth: shaky
- Evidence: applied it: picked the laptop (100.101.7.42) over the TV (192.168.1.50) as the one the SSH rule `-RemoteAddress 100.64.0.0/10` lets in, because it is inside the range (2026-11-21)
- Connects to (suggested): MQTT - same idea: `home/#` fixes the start of a topic and matches the rest, as `/10` fixes the first 10 bits of an address and matches the rest
- Mixed up with: `/10` as "0 to 10" (it is the count of fixed bits out of 32), and `-RemoteAddress` as the address the server listens on (it is the caller's address the firewall checks)

### Serial communication
- Area: Other (hardware)
- Depth: can use
- Evidence: self-reported: has worked with it hands-on, but the fundamentals are not solid (2026-11-18)
- Connects to (suggested): Dart language - same idea: bytes arrive in chunks over time, which is what a Dart `Stream` models

### Docker containers and Compose
- Area: Tooling
- Depth: shaky
- Evidence: corrected own architecture diagram (volumes, broker in front of sensors, UI reaches only the API) and answered that Docker Engine, not Compose, restarts containers after a reboot; concept level only, not yet hands-on (2026-11-19)
- Connects to (suggested): MQTT - same idea: containers reach each other by service name and port the way clients reach a broker, and the REST API is the single front door the way a broker is
- Mixed up with: Compose as a long-running program that holds the containers. It is a command that reads `compose.yaml`, tells Docker Engine what to create, and exits.

### Dart language
- Area: Dart
- Depth: shaky
- Evidence: self-reported (2026-11-18)
- Connects to (suggested): MQTT - same idea: a `Stream` delivers events to a listener the way a broker delivers messages to a subscriber

### Flutter UI
- Area: Flutter
- Depth: shaky
- Evidence: self-reported (2026-11-18)

### Riverpod
- Area: Riverpod
- Depth: shaky
- Evidence: self-reported (2026-11-18)
- Connects to (suggested): MQTT - same idea: `ref.watch` is like subscribing to a topic (every new value arrives), while `ref.read` is like reading the latest value once without subscribing

### SQL and databases (including Drift)
- Area: Drift/SQL
- Depth: shaky
- Evidence: self-reported (2026-11-18)

### Payments / point-of-sale domain
- Area: Payments
- Depth: shaky
- Evidence: self-reported (2026-11-18)
- Connects to (suggested): Serial communication - builds on: payment terminals are often driven over serial or USB links
