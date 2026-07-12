# Monetarisierung — Subway Runner 3D

> Stand: 2026-07-12. Strategie und Phasenplan. Voraussetzungen: `STORE_READINESS.md`.

## Grundprinzip

Free-to-play. Das Spiel bleibt vollstaendig kostenlos spielbar; Einnahmen kommen aus
Werbung (mit fairem Consent) und optionalen Kaeufen. Kein Pay-to-win, keine Lootboxen
(vereinfacht Alterseinstufung und Review erheblich).

## Zwei Wege zu ersten Einnahmen

### Option A: Web-Plattformen (schnell, ohne Store-Accounts)

Einreichung des bestehenden Web-Builds bei Spiele-Portalen mit Revenue-Share:

| Plattform | Modell | Anforderung |
|-----------|--------|-------------|
| CrazyGames | Ad-Revenue-Share | eigenes SDK einbinden (Ads an Game-Over-Punkten), QA-Review |
| Poki | Ad-Revenue-Share | Poki SDK, Performance-Anforderungen streng |
| itch.io | Pay-what-you-want / Direktverkauf | Upload als HTML5-Zip, sofort live |

Aufwand: SDK-Integration je ~1-2 Tage. Vorteil: Traffic bringt die Plattform mit —
das loest das groesste Problem (niemand findet die App). Realistisch bei Portal-Annahme:
niedrige dreistellige EUR/Monat bei gutem Ranking, sonst Taschengeld. Aber: echte
Spieler-Daten (Retention!) fuer die Store-Version.

### Option B: App Stores (nachhaltiger, mehr Aufwand)

Phasenplan unten. Wichtig: Ohne Marketing/ASO ist Store-Sichtbarkeit nahe null.
Einnahmen skalieren mit DAU, nicht mit Feature-Menge.

## Phasenplan (Store-Version)

### Phase M0 — v1.0 ohne Monetarisierung (Empfehlung fuer Erst-Submission)
"Data Not Collected"-Privacy, schnellster Review, Fokus auf Bewertungen + Retention-Daten.

### Phase M1 — Werbung (Update 1.1)
- **Interstitial** nach Game Over: Frequency Cap 1 Anzeige pro 3 Runs UND min. 120 s
  Abstand (Retention schuetzen — aggressive Interstitials toeten D1-Retention).
- **Rewarded Video** (freiwillig, wertvollster Formattyp):
  - "Weiterlaufen" nach Crash (1x pro Run)
  - Coin/Score-Verdoppelung nach dem Run
- Consent: Google UMP vor erstem Request, Ablehnen = gleichwertiger Button.
  Ohne Consent nur nicht-personalisierte Ads (niedrigerer eCPM, aber sauber).
- iOS v1: NPA-only → kein ATT-Dialog.
- Grobe Benchmarks 2026 (EU, Hyper-Casual): Interstitial eCPM ~5-12 EUR,
  Rewarded ~12-30 EUR. Bei 500 DAU und 3 Impressions/DAU: grob 3-15 EUR/Tag.
  Merke: DAU ist der Hebel, nicht das Format.

### Phase M2 — In-App-Kaeufe (Update 1.2)
- "Werbung entfernen" 2,99 EUR (Standard-Preispunkt, Kaufrate typ. 1-3% der aktiven Nutzer)
- Charakter-Pakete (kosmetisch): 1,99 EUR — CHARACTER_PRESETS existieren bereits,
  Freischaltung via localStorage-Flag + Purchase-Validierung
- Implementierung: RevenueCat (ein SDK fuer beide Stores, Server-Validierung inklusive)

### Phase M3 — Live-Ops (nur wenn M1/M2 traegt)
- Saisonale Welten/Skins, Daily Challenges (Retention), Season Pass

## KPIs (ab Tag 1 messen — aber DSGVO-konform)

Erst mit Consent-Analytics (opt-in) oder aggregiert ohne Identifier
(siehe `_INFO/Datenschutz.md` Kap. 2):
- Retention D1 / D7 (Ziel Hyper-Casual: D1 > 30%, D7 > 8%)
- Runs pro Session, Session-Laenge
- Ab M1: ARPDAU, Ad-Impressions pro DAU, Rewarded-Opt-in-Rate (Ziel > 25%)
- Ab M2: Conversion "Remove Ads"

## Ehrliche Einschaetzung

Der Markt fuer Endless Runner ist gesaettigt; ohne Alleinstellungsmerkmal in der
Vermarktung entscheidet Distribution. Die Gestensteuerung (Kopf-/Koerpersteuerung)
ist das differenzierende Feature — dafuer eignet sich Kurzvideo-Marketing
(TikTok/Reels: "Spiel steuern nur mit dem Kopf") deutlich besser als Store-ASO.
Empfehlung: Option A (Portale) sofort starten, Store-Track parallel in Ruhe aufbauen,
Marketing-Videos um die Gestensteuerung bauen.
