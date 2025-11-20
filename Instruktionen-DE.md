# Schritt-für-Schritt-Anleitung zur Verwendung eines Screenshots zur Überprüfung von Verzeichnisänderungen:

---

## **So vergleichen Sie Verzeichnisinhalte mithilfe eines archivierten Screenshots**

Mit dieser Methode können Sie überprüfen, ob seit der Erstellung des Screenshots Dateien hinzugefügt, entfernt oder geändert wurden.

---

### **Phase 1: Erstellen Sie den Referenz-Screenshot**

1. **Erstellen Sie einen klaren Screenshot** Ihres Datei-Explorers/Verzeichnisverzeichnisses, der Folgendes anzeigt:
- Dateiname
- Dateigröße
- Datum/Uhrzeit der letzten Änderung
- (Optional, aber hilfreich: Dateityp, Berechtigungen)

2. **Bewährte Verfahren für die Erfassung:**
- Maximieren Sie das Fenster, um alle Dateien anzuzeigen
- Sortieren Sie nach Dateinamen, um eine konsistente Reihenfolge zu gewährleisten
- Verwenden Sie eine klare, lesbare Zoomstufe
- Fügen Sie nach Möglichkeit den vollständigen Pfad in die Titelleiste ein

3. **Speichern Sie den Screenshot** unter einem aussagekräftigen Namen:
```
project-backup-2025-11-20.jpg
```

---

### **Phase 2: Extrahieren Sie Daten aus dem Screenshot (zu einem späteren Zeitpunkt)**

Wenn Sie Änderungen überprüfen müssen:

1. **Verwenden Sie OCR, um Text zu extrahieren:**
- **Online-Tools:** Google Drive (Rechtsklick > Mit Google Docs öffnen), einen KI-Chatbot oder eine kostenlose OCR-Website
- **Desktop-Tools:** Adobe Acrobat, Windows Snipping Tool (Win+Umschalt+S, dann in die Zwischenablage kopieren) oder macOS Preview
- **Befehlszeile:** `tesseract screenshot.jpg output.txt`

2. **Daten bereinigen und formatieren:**
- Kopieren Sie den extrahierten Text in eine Tabelle
- Stellen Sie sicher, dass Sie drei Spalten haben: `Dateiname`, `Grösse`, `Änderungsdatum`
- Speichern Sie die Datei als **`referenzdaten.csv`**:

```csv
   Dateiname,Größe,Geändert
   file-001-nbt98v1cbr.html,2KB,20.11.2025 08:39:00
   file-002-42bdrywa7b.html,2KB,20.11.2025 08:40:27
```

---

### **Phase 3: Vergleich mit dem aktuellen Verzeichnis**

Wählen Sie eine Methode aus:

#### **Option A: Automatisiert (Node.js)**
Wenn Sie Node.js installiert haben:
```bash
node compare-listings.js
```
Dadurch wird ein detaillierter Bericht erstellt, der Übereinstimmungen, Abweichungen, fehlende und zusätzliche Dateien anzeigt.

#### **Option B: Manuell (Schnellprüfung)**
1. Aktuelle Dateiliste abrufen:
```bash
# Windows PowerShell
Get-ChildItem | Select-Object Name, LastWriteTime | Export-Csv current.csv

# macOS/Linux
   ls -l --time-style=„+%d.%m.%Y %H:%M:%S“ > current.txt
```

2. Verwenden Sie ein Diff-Tool (wie WinMerge, Beyond Compare oder VS Code), um `reference.csv` mit `current.csv` zu vergleichen.

#### **Option C: Alternative Skripte**
Verwenden Sie ein einfaches PowerShell- oder Python-Snippet, wenn Sie diese Umgebungen bevorzugen.

---

### **Phase 4: Ergebnisse interpretieren**

-  **✅ Übereinstimmungen**  : Dateien seit dem Screenshot unverändert
-  **❌ Nichtübereinstimmungen**  : Änderungsdaten unterscheiden sich (Datei wurde bearbeitet)
-  **📂 Fehlende**  : Datei im Screenshot, aber nicht im Verzeichnis (gelöscht/umbenannt/verschoben)
-  **➕ Zusätzliche**  : Datei im Verzeichnis, aber nicht im Screenshot (neu erstellt)

**Nächste Schritte:**
- Überprüfen Sie nicht übereinstimmende Dateien, um beabsichtigte Änderungen zu bestätigen.
- Untersuchen Sie fehlende Dateien (wurden sie gesichert?).
- Entscheiden Sie, ob Sie zusätzliche Dateien archivieren oder entfernen möchten

---

### **Wichtige Überlegungen und Einschränkungen**

⚠️ **OCR-Genauigkeit**: Unscharfe Screenshots können zu Fehlern bei den Dateinamen führen. Überprüfen Sie wichtige Dateien immer manuell.

⏰ **Zeitstempelgenauigkeit**: Dateisysteme zeichnen Zeiten auf Millisekunden genau auf; Screenshots zeigen Sekunden an. Eine Abweichung von 1–2 Sekunden ist normal.

📁 **Versteckte Dateien**: Screenshots zeigen keine versteckten/Systemdateien an. Verwenden Sie `ls -la` oder `dir /a` für eine vollständige Überprüfung.

🔍 **Bessere Alternativen**: Verwenden Sie für die regelmäßige Überwachung:
- `git` oder Versionskontrolle
- Backup-Software mit Änderungsprotokollen
- Tools für Verzeichnis-Snapshots wie `tree /f > snapshot.txt`

---

**Schnellreferenz-Workflow:**
```
Screenshot → OCR → CSV → Skript ausführen → Bericht überprüfen
```

Diese Methode eignet sich ideal für gelegentliche Audits, nicht jedoch für die kontinuierliche Überwachung.
