# Step-by-step instructions for using a screenshot to audit directory changes:

---

## **How to Compare Directory Contents Using an Archived Screenshot**

This method lets you verify whether files have been added, removed, or modified since you captured the screenshot.

---

### **Phase 1: Create the Reference Screenshot**

1. **Capture a clear screenshot** of your file explorer/directory listing showing:
   - Filename
   - File size
   - Last modified date/time
   - (Optional but helpful: file type, permissions)

2. **Best practices for capture:**
   - Maximize the window to show all files
   - Sort by filename for consistent ordering
   - Use a clear, readable zoom level
   - Include the full path in the title bar if possible

3. **Save the screenshot** with a meaningful name:
   ```
   project-backup-2025-11-20.jpg
   ```

---

### **Phase 2: Extract Data from the Screenshot (Later)**

When you need to verify changes:

1. **Use OCR to extract text:**
   - **Online tools:** Google Drive (right-click > Open with Google Docs) or free OCR websites
   - **Desktop tools:** Adobe Acrobat, Windows Snipping Tool (Win+Shift+S, then copy to clipboard), or macOS Preview
   - **Command line:** `tesseract screenshot.jpg output.txt`

2. **Clean and format the data:**
   - Copy the extracted text into a spreadsheet
   - Ensure you have three columns: `Filename`, `Size`, `Modified Date`
   - Save as **`reference.csv`**:

   ```csv
   Filename,Size,Modified
   file-001-nbt98v1cbr.html,2KB,20.11.2025 08:39:00
   file-002-42bdrywa7b.html,2KB,20.11.2025 08:40:27
   ```

---

### **Phase 3: Compare Against Current Directory**

Choose one method:

#### **Option A: Automated (Node.js)**
If you have Node.js installed:
```bash
node compare-listings.js
```
This generates a detailed report showing matches, mismatches, missing, and extra files.

#### **Option B: Manual (Quick Check)**
1. Get current file list:
   ```bash
   # Windows PowerShell
   Get-ChildItem | Select-Object Name, LastWriteTime | Export-Csv current.csv

   # macOS/Linux
   ls -l --time-style="+%d.%m.%Y %H:%M:%S" > current.txt
   ```

2. Use a diff tool (like WinMerge, Beyond Compare, or VS Code) to compare `reference.csv` with `current.csv`

#### **Option C: Alternative Scripts**
Use simple PowerShell or Python snippet if you prefer those environments.

---

### **Phase 4: Interpret Results**

-  **✅ Matches**  : Files unchanged since screenshot
-  **❌ Mismatches**  : Modification dates differ (file was edited)
-  **📂 Missing**  : File in screenshot but not in directory (deleted/renamed/moved)
-  **➕ Extra**  : File in directory but not screenshot (newly created)

**Next steps:**
- Review mismatched files to confirm intentional changes
- Investigate missing files (were they backed up?)
- Decide whether to archive or remove extra files

---

### **Important Considerations & Limitations**

⚠️ **OCR Accuracy**: Blurry screenshots may cause filename errors. Always verify critical files manually.

⏰ **Timestamp Precision**: Filesystems record times to milliseconds; screenshots show seconds. A 1-2 second difference is normal.

📁 **Hidden Files**: Screenshots don't show hidden/system files. Use `ls -la` or `dir /a` for complete verification.

🔍 **Better Alternatives**: For regular monitoring, use:
- `git` or version control
- Backup software with change logs
- Directory snapshot tools like `tree /f > snapshot.txt`

---

**Quick Reference Workflow:**
```
Screenshot → OCR → CSV → Run Script → Review Report
```

This method is ideal for occasional audits, not continuous monitoring.
