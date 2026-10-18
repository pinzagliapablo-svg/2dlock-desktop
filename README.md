# 2Dlock Desktop — Windows + aggiornamenti automatici

Questo repository converte il gioco HTML `index.html` in un'app desktop Windows basata su Electron.

## Cosa include

- Installer Windows NSIS: `2Dlock-Setup-...exe`.
- Gioco in una finestra desktop, senza bisogno di avviare un browser.
- Salvataggi persistenti in `%APPDATA%\\2Dlock`, separati dalla cartella di installazione.
- Controllo aggiornamenti all'avvio e poi circa ogni 6 ore.
- Pannello in-game per scaricare e applicare l'aggiornamento.
- GitHub Actions per creare l'installer Windows e pubblicare i file necessari agli aggiornamenti automatici.

## Pubblicare una nuova versione del gioco

1. Sostituisci `index.html` con l'HTML aggiornato.
2. Incrementa `version` in `package.json` **e** `package-lock.json` (esempio: `3.0.0` → `3.0.1`).
3. Fai commit e push sulla branch `main`.
4. GitHub Actions controlla il progetto, crea la release `vX.Y.Z` se non esiste, costruisce l'installer Windows e carica `.exe`, `.blockmap` e `latest.yml`.
5. Gli EXE già installati controllano il feed GitHub e possono scaricare la nuova versione dal pannello di aggiornamento.

**Importante:** ogni push su `main` che deve pubblicare un aggiornamento deve avere una versione nuova. Se la release per quella versione esiste già, il workflow si ferma intenzionalmente invece di sovrascrivere accidentalmente una release precedente.

Per ricostruire una release esistente manualmente, apri **Actions → Build and publish 2Dlock for Windows → Run workflow** e inserisci il tag esatto.

## Build manuale su Windows

Prerequisiti: Windows 10/11 x64 e Node.js LTS. Apri `CREA_EXE.bat`: l'installer viene creato nella cartella `dist`. Una build locale non pubblicata non distribuisce aggiornamenti automatici.

Per avviare in sviluppo, usa `AVVIA_DEV.bat`.

## Dati e compatibilità

- L'installer non cancella i salvataggi presenti in `%APPDATA%\\2Dlock`.
- Il gameplay locale non richiede un server online; gli aggiornamenti automatici richiedono Internet.
- La build non firmata può mostrare un avviso Windows SmartScreen.
