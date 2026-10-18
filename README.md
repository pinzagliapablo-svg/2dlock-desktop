# 2Dlock Desktop — Windows + aggiornamenti automatici

Questa cartella converte l'ultima build HTML fornita (2Dlock V2.9 Red Serpent Lockdown) in un'app desktop Electron.

## Cosa include

- Finestra desktop Windows: installer NSIS (`2Dlock-Setup-...exe`).
- Gioco locale: dopo l'installazione non serve un browser.
- Salvataggi del gioco persistenti in `%APPDATA%\2Dlock`, separati dalla cartella d'installazione; l'installer non cancella tali dati durante l'aggiornamento o la disinstallazione.
- Controllo aggiornamenti all'avvio e poi circa ogni 6 ore.
- Pannello in-game per scaricare l'aggiornamento e riavviare per installarlo.
- Workflow GitHub Actions per costruire e pubblicare la release Windows e il feed necessario a `electron-updater`.
- Il riferimento a Google Fonts è stato rimosso dalla build desktop per evitare richieste a siti esterni; quando offline verranno usati i font di fallback già definiti dal gioco.

## Come ottenere l'EXE con aggiornamenti automatici

Serve un repository GitHub **pubblico** controllato da te: gli aggiornamenti vengono pubblicati lì e i client possono scaricarli senza incorporare token segreti nell’app. Non devi ospitare un server separato.

1. Crea un repository GitHub, ad esempio `2dlock-desktop`, e carica il contenuto di questa cartella (compreso `.github/workflows/release-windows.yml`).
2. Nella pagina del repository apri **Settings → Actions → General** e consenti a `GITHUB_TOKEN` di leggere e scrivere contenuti, se non è già consentito. Il workflow richiede `contents: write`.
3. Verifica che il tag corrisponda alla versione in `package.json`, attualmente `2.9.0`.
4. Pubblica il primo tag dalla tua copia locale:

   ```bash
   git tag v2.9.0
   git push origin v2.9.0
   ```

5. In GitHub apri **Actions** e controlla il workflow. Al termine, in **Releases** dovresti trovare l'installer Windows e i metadati di aggiornamento.
6. Scarica l'installer `.exe` dalla Release e installa 2Dlock. Le installazioni ottenute da questa release saranno collegate al feed di aggiornamento del repository.

Il primo tag `v2.9.0` presuppone che il contenuto corrente sia stato caricato nel repository. Non creare tag della stessa versione una seconda volta: per ogni aggiornamento aumenta la versione in `package.json` (per esempio `3.0.0`), aggiorna `index.html` con il nuovo gioco, fai commit e tagga `v3.0.0`.

## Come rilasciare un aggiornamento futuro

1. Sostituisci `index.html` con l'HTML aggiornato del gioco.
2. Incrementa `version` in `package.json` e commit/push.
3. Crea e invia un tag uguale alla versione, per esempio:

   ```bash
   git tag v3.0.0
   git push origin v3.0.0
   ```

4. GitHub Actions crea la nuova release Windows. L'app installata controlla il feed all'avvio, mostra una notifica al giocatore e permette di scaricare l'aggiornamento e riavviare per applicarlo.

## Build manuale su Windows (senza pubblicare aggiornamenti)

Prerequisiti: Windows 10/11 x64 e Node.js LTS. Apri `CREA_EXE.bat`. Il file installer sarà creato nella cartella `dist`. Una build locale creata senza configurare una release GitHub non ha un feed di aggiornamento automatico.

Per avviare in sviluppo, apri `AVVIA_DEV.bat`.

## Note importanti

- Da questo ambiente Linux posso verificare i file di progetto e la sintassi ma non posso eseguire l'installer Windows sul tuo PC. Il workflow `windows-latest` è incluso proprio per costruire il `.exe` su un runner Windows.
- Aggiornamenti automatici richiedono Internet durante il controllo/download. Il gameplay locale non richiede un server online; i font remoti sono stati rimossi, quindi offline il gioco usa i fallback di sistema.
- Per evitare falsi positivi o avvisi di Windows SmartScreen nelle distribuzioni pubbliche, in futuro si può firmare il file con un certificato code-signing. La build non firmata può comunque essere installabile, ma Windows può mostrare un avviso.
