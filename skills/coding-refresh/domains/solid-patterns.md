# solid-patterns

General coding practice: SOLID, design patterns, refactoring and DDD terms as
dev_guides explains them. Checks factual errors only: a principle defined
wrongly, an example that does not compile, a dead link.

## Targets

All paths are under `D:/Github/dev_guides/`.

- `docs/oop_solid_dart.md`
- `skills/dev-flutter/references/architecture.md` and
  `skills/scotch-flutter/references/architecture.md` - claims about named
  principles and patterns only.
- `skills/dev-flutter/references/external_sources.md` and
  `skills/scotch-flutter/references/external_sources.md` - the Design Patterns
  links.

## Sources

- https://martinfowler.com/ - Use for: Martin Fowler's definitions of patterns, refactorings and architecture terms.
- https://refactoring.com/catalog/ - Use for: names and steps of refactorings.
- https://refactoring.guru/design-patterns - Use for: intent and structure of the classic design patterns (third-party, kept because dev_guides already cites it and Fowler's site does not cover every pattern); prefer Fowler where the two differ.
- https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html - Use for: Robert C. Martin's own statement of the SOLID principles.
- https://www.domainlanguage.com/ddd/reference/ - Use for: Eric Evans's definitions of DDD building blocks.
- https://dart.dev/language/class-modifiers - Use for: whether Dart examples using `abstract`, `interface`, `sealed`, `base` or `final` classes are correct.

## Notes

- `CLAUDE.md` "Code Level (Always)" is a team choice and not a target. Its "two
  concrete uses justify an abstraction" rule can disagree with textbook ISP or
  OCP examples in `docs/oop_solid_dart.md`; that is a difference of choice for
  the Watch list, not an error.
