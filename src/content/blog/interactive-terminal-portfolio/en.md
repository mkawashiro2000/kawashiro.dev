---
title: "Building a terminal that visitors actually want to use"
description: "The interactive shell of kawashiro.dev: typewriter output, real telemetry, a guestbook in SQLite, games, and the easter eggs every dev tries."
pubDate: 2026-07-23
tags: ["react", "typescript", "ux", "terminal"]
---

The PRO mode of this site is a fake terminal — but the best kind of fake: everything it *shows* is real, only the shell itself is theater. Here's what went into making it feel alive.

## The illusion layer

A terminal emulator convinces through small details, not big features:

- **Boot sequence.** Entering PRO mode plays systemd-style `[  OK  ]` lines with a 110ms cadence before the prompt appears. Pure theater, instant credibility.
- **Typewriter output.** Command output drains from a queue at ~26ms per line instead of appearing at once. A `Ctrl+L` clears it, `Ctrl+C` prints the classic `^C`.
- **Tab completion.** A trie over the command lexicon; ambiguous prefixes print the candidates in columns, like bash.
- **A queue, not a `setTimeout` chain.** All output goes through one drain loop, so a fast typist can't interleave two commands' output.

## The real layer

The convincing part is that the data isn't mocked:

- `htop` opens a Server-Sent Events stream with the actual CPU, RAM and SoC temperature of the Raspberry Pi serving the page, complete with an ASCII sparkline of the last 60 seconds.
- `neofetch` queries `/api/v1/sysinfo` — real kernel version, real uptime, real load average.
- `weather` shows the live weather in Constanza, where the server physically sits, via Open-Meteo with a 10-minute cache.
- `guestbook sign <message>` writes to a SQLite database on the Pi (rate-limited to one signature per IP per minute, capped at 500 rows).

## The fun layer

Every dev types the same things into a terminal they don't own. All of them are handled:

- `sudo rm -rf /` → a dramatic descent into `/var/lib/dreams`, aborted by "protective instincts".
- `sudo apt update` → a plausible Debian update that ends by opening a video you didn't ask for.
- `matrix` → full-screen katakana rain on a canvas. Any key wakes you up.
- `cowsay`, `fortune`, and yes, `fortune | cowsay` works.
- `typing` → a WPM test, because a terminal is a keyboard-first place.

## What I'd tell anyone building one

1. Make the output honest. One real number beats ten fake dashboards.
2. Respect muscle memory: arrows for history, Tab for completion, Ctrl+L, Ctrl+C. Breaking those breaks the spell.
3. Mobile needs a different contract — 16px input (or iOS zooms), no focus-stealing on scroll, command chips instead of typing.
