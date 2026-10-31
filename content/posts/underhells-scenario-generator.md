---
title: "A pick your own adventure scenario generator for Necromunda"
date: "2026-10-31"
tags: ["necromunda", "javascript"]
excerpt: "A little browser tool that rolls up a fresh Necromunda scenario on demand, so you never have to sit there wondering what to play next."
---

If you play Necromunda for long enough, you hit a wall. After months of games
you have run through all the published scenarios, and coming up with something
new every week gets genuinely tough. You sit down to play and spend the first
half hour flicking through books and notes trying to invent a reason for two
gangs to shoot at each other.

So I built a little tool to do that part for you. Think of it almost like a
pick your own adventure generator: you tell it how many players and which mode,
hit Generate, and it rolls up a complete scenario, ready to play.

![The scenario generator mid roll, showing an Underhells scenario called Hold the Breach with Vorn Kadd the Ferryman and his quote, above the battlefield and objective cards](/images/posts/underhells-scenario-generator/generator.webp)

Each roll gives you a battlefield, a primary objective, a random complication,
a few secondary objectives and the rewards for winning. No two rolls land the
same way, so there is always a fresh setup waiting rather than the same handful
of missions on rotation.

## Two modes

- **Hive War** is the plain mode for an ordinary skirmish. Pick your players,
  roll, and you have a quick game to drop into without any campaign baggage.
- **Underhells** is the themed one. It leans into a grimmer, deeper setting with
  Roaming Horrors, Data Crystals, the Broodmind and a running commentary from
  Vorn Kadd, the Ferryman of the Underhells, who drops a different grim line
  every time you roll.

## How it works

Under the bonnet it is deliberately simple. There is no framework, no build
step, no backend. Just a single HTML page, a stylesheet and one JavaScript file
that holds the data tables and the logic.

Each mode has three tables: environments, objectives and complications.
Generating a scenario picks one from each at random, then shuffles the
objective's secondary goals together with an extra from the complication and
deals out three. That small bit of mixing means two scenarios with the same
objective still play differently. Underhells mode then bolts on its extra rules
cards and a Ferryman quote that matches the type of objective you rolled.

The whole thing is static, so "deploying" it is just opening the file in a
browser. Same spirit as this site: no server to babysit.

## The fun part was the writing

Honestly, the code is the easy bit. Most of the effort went into the data: the
environment intros, the objective flavour and especially Vorn Kadd's lines. A
generator is only as good as the stuff it can pull from, so I tried to make
every entry read like it belongs in the world rather than a dry list of rules.

## Where I would like to take it

Right now it is a single standalone HTML page, which is perfect for getting
something working and sharing it quickly. Eventually though, I would like to
turn it into a proper app: saved scenarios, your own custom tables, maybe a
shared link you can send round the group before game night. That is a project
for another day, but the plan is there.

Have a roll yourself: the generator is
[live here](https://sh3ll-m.github.io/necromunda-scenario-generator/), and the
code is [on GitHub](https://github.com/Sh3ll-M/necromunda-scenario-generator).
