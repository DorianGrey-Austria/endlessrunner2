# Store Readiness — Subway Runner 3D

> Stand: 2026-07-12. Master-Checkliste fuer App Store (Apple) und Google Play.
> Datenschutz-Grundlagen: `~/Desktop/coding/_INFO/Datenschutz.md` (Schnell-Checkliste Kap. 5).

## Strategie (3 Stufen)

| Stufe | Kanal | Status | Aufwand |
|-------|-------|--------|---------|
| 1 | Web (endlessrunner.vibecoding.company) | LIVE | - |
| 2 | PWA (installierbar, offline-faehig) | V5.4 fertig | erledigt |
| 3 | Capacitor-Wrapper → App Store + Google Play | Scaffold vorhanden | Wochen |

Parallel-Option fuer schnelle erste Einnahmen ohne Store-Accounts: Web-Game-Plattformen
(CrazyGames, Poki, itch.io) mit Revenue-Share — siehe `MONETIZATION.md`.

## 1. Accounts und Kosten (Blocker — nur der Betreiber kann das)

- [ ] **Apple Developer Program**: 99 USD/Jahr, developer.apple.com. Bei Firmenkonto: D-U-N-S-Nummer noetig (kostenlos, dauert Tage bis Wochen). Privatperson geht auch (Name erscheint im Store).
- [ ] **Google Play Console**: 25 USD einmalig, play.google.com/console. Identitaetspruefung (Ausweis) einplanen; neue Privat-Konten brauchen 12 Tester fuer 14 Tage vor Production-Release.
- [ ] **EU Trader-Status (DSA)**: Beide Stores verlangen fuer monetarisierte Apps Haendler-Verifizierung — Adresse und Kontakt werden OEFFENTLICH im Store angezeigt. Vorher klaeren: Gewerbe/Impressum-Daten verwenden, nicht Privatadresse.
- [ ] **AdMob-Konto** (falls Werbung): admob.google.com, an Play-Konto koppeln. Auszahlung: Steuerdaten + Bankkonto.
- [ ] **Steuern/Gewerbe**: App-Einnahmen sind Einkommen. Kleinunternehmerregelung pruefen. Apple/Google fuehren EU-USt auf Verkaeufe ab (Marketplace-Regel), Einnahmen trotzdem erklaeren.

## 2. Technische Vorbereitung (Capacitor-Wrapper)

- [x] Touch-Steuerung (Swipe) — V5.4
- [x] PWA: Manifest, Service Worker, Icons — V5.4
- [ ] **Assets lokal buendeln**: three.min.js + three.module.js + jsm-Loader von unpkg nach `vendor/` vendoren; Importmap auf lokale Pfade umstellen. Im Store-Build darf nichts vom CDN kommen (Offline-Start, Review-Stabilitaet).
- [ ] **Gestensteuerung im App-Build deaktivieren (v1-Empfehlung)**: Kamera-Berechtigung (NSCameraUsageDescription) verkompliziert Review + Privacy-Angaben massiv. Feature-Flag: im Capacitor-Build Gesten-Buttons ausblenden. Spaeter als Update nachliefern.
- [ ] **Performance auf echten Geraeten**: iPhone (aktuell + 3 Jahre alt) und Mittelklasse-Android (z.B. Samsung A-Serie). Ziel 60 FPS, LOW-Quality-Fallback pruefen.
- [ ] Safe-Area (Notch) pruefen (`viewport-fit=cover` gesetzt, env(safe-area-inset-*) fuer UI-Overlays nachziehen falls noetig).
- [ ] App-Icon 1024x1024 (Apple) — aktuelles Icon ist Programmier-Platzhalter; fuer den Store professionelle Version erstellen (z.B. via SD-WebUI/Designer).
- [ ] Splash Screens (Capacitor generiert aus einer Quelle: `npx capacitor-assets generate`).
- [ ] Versionierung: Marketing-Version = package.json (5.4.0), Build-Nummern pro Store-Upload hochzaehlen.

## 3. Monetarisierungs-Voraussetzungen (Details: MONETIZATION.md)

- [ ] AdMob SDK via `@capacitor-community/admob`; App-IDs (iOS/Android) in Config.
- [ ] **UMP Consent (Pflicht in EU)**: Google User Messaging Platform vor dem ersten Ad-Request; Ablehnen gleichwertig anbieten (kein Dark Pattern, siehe Datenschutz.md Kap. 3). Ohne Consent: nur nicht-personalisierte Anzeigen (NPA).
- [ ] **Apple ATT**: Nur noetig bei personalisierter Werbung/Tracking. v1-Empfehlung: NPA-only auf iOS → kein ATT-Dialog, einfacherer Review.
- [ ] IAP "Werbung entfernen": StoreKit2/Play Billing via RevenueCat (einfachste Wartung) oder capacitor-plugin.
- [ ] privacy.html erweitern SOBALD Ads live: AdMob als Empfaenger, Consent-Widerruf-Link, Stand-Datum bumpen.

## 4. Store-Eintraege (Assets und Texte)

- [ ] Texte DE/EN: `docs/store-listing/` (vorbereitet, vor Submission reviewen)
- [ ] Screenshots: iPhone 6.9" (1320x2868) + 6.5" (1284x2778), iPad 13" (2064x2752); Android Phone + 7" + 10" Tablet. Tipp: Capacitor-App im Simulator + echte Geraete, jeweils Gameplay in Welt 1, 3, 7, 10 + Menue.
- [ ] Google Play Feature-Grafik: 1024x500.
- [ ] Alterseinstufung: IARC-Fragebogen (Play) — keine Gewalt/Einkaeufe(v1)/Werbung(v1) → voraussichtlich USK 0 / PEGI 3; Apple: 4+.
- [ ] Datenschutz-URL: https://endlessrunner.vibecoding.company/privacy.html (live nach naechstem Deploy).
- [ ] Support-URL/E-Mail: festlegen (nicht private E-Mail; Alias einrichten).

## 5. Datenschutz-Disclosures (muessen der Realitaet entsprechen)

- [ ] **Apple `PrivacyInfo.xcprivacy`** im Xcode-Projekt: ohne Ads "Data Not Collected"; mit AdMob: deren Privacy-Manifest-Angaben uebernehmen (SDK bringt eigenes Manifest mit).
- [ ] **Apple App Privacy** (App Store Connect): ohne Ads "Daten werden nicht erhoben". Mit AdMob: Identifiers/Usage Data deklarieren.
- [ ] **Google Data Safety**: analog. UMP-Consent dokumentieren.
- [ ] Abgleich mit privacy.html — Store-Angaben und Erklaerung duerfen sich nicht widersprechen.

## 6. Qualitaets-Gates vor Submission

- [ ] 30 Minuten crash-frei auf echtem iPhone UND echtem Android.
- [ ] Offline-Start der App (Flugmodus) funktioniert.
- [ ] Alle 10 Welten per Debug-Jump (`?level=N` / Shift+1..0) durchgetestet.
- [ ] TestFlight-Beta (Apple) bzw. Play Internal Testing: mindestens 1 Woche, echte Nutzer.
- [ ] E2E-Suite gruen (`npx playwright test`), `npm run test` gruen.

## 7. Realistische Reihenfolge

1. **Woche 1**: Accounts beantragen (Apple dauert; D-U-N-S falls Firma). Parallel: Vendoring + Capacitor-Build lokal auf iPhone-Simulator.
2. **Woche 2**: Echte Geraete-Tests, Splash/Icons, Store-Texte finalisieren, Screenshots.
3. **Woche 3**: TestFlight + Play Internal Testing (12-Tester-Regel beachten!).
4. **Woche 4+**: Submission ohne Ads (schnellerer Review), Ads als Folge-Update mit UMP.

> Empfehlung: v1 OHNE Werbung einreichen ("Data Not Collected" = einfachster Review),
> Monetarisierung als 1.1-Update. Das entkoppelt Store-Lernkurve von AdMob-Lernkurve.
