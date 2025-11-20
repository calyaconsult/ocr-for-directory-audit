/**
 * @file This script compares the contents of a directory with a CSV file that contains a list of files and their metadata.
 * It is used to audit the directory and identify any changes since the CSV file was created.
 * The script will exit with a status code of 1 if any discrepancies are found, and 0 otherwise.
 * @see README.md
 * @see Instructions-EN.md
 * @see Instruktionen-DE.md
 */
const fs = require('fs');

// Configuration
const CSV_FILE = 'ocr-data.csv';
const SCRIPT_FILE = 'compare-listings.js';

/**
 * Parses a date string from the CSV file into a Date object.
 * @param {string} dateStr The date string to parse, in 'DD.MM.YYYY HH:MM:SS' format.
 * @returns {Date|null} The parsed Date object, or null if parsing fails.
 */
function parseCSVDate(dateStr) {
  try {
    const [datePart, timePart] = dateStr.trim().split(' ');
    const [day, month, year] = datePart.split('.');
    const [hours, minutes, seconds] = timePart.split(':');
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`);
    return null;
  }
}

/**
 * Formats a Date object into a string for display.
 * @param {Date} date The Date object to format.
 * @returns {string} The formatted date string, in 'DD.MM.YYYY HH:MM:SS' format.
 */
function formatDate(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Reads and parses the specified CSV file.
 * @param {string} filename The name of the CSV file to read.
 * @returns {Array<Object>} An array of objects, where each object represents a row in the CSV file.
 */
function readCSV(filename) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or only contains headers');
    }

    const data = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        if (values.length >= 3) {
          data.push({
            name: values[0].trim(),
            size: values[1].trim(),
            modified: values[2].trim()
          });
        }
      }
    }

    return data;
  } catch (error) {
    console.error(`Error reading CSV file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Gets a list of files in the current directory, excluding the script itself and the CSV file.
 * @returns {Map<string, Object>} A map of filenames to file metadata objects.
 */
function getCurrentDirectoryFiles() {
  const files = new Map();

  try {
    const dirEntries = fs.readdirSync('.', { withFileTypes: true });

    for (const entry of dirEntries) {
      if (entry.isFile()) {
        const filename = entry.name;

        // Skip script file and CSV file
        if (filename === SCRIPT_FILE || filename === CSV_FILE) {
          continue;
        }

        try {
          const stats = fs.statSync(filename);
          files.set(filename, {
            modified: stats.mtime
          });
        } catch (error) {
          console.warn(`Warning: Could not stat file '${filename}': ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory: ${error.message}`);
    process.exit(1);
  }

  return files;
}

/**
 * The main function of the script. It compares the files in the current directory with the data in the CSV file
 * and prints a report of the differences.
 */
function compareListings() {
  console.log('🔍 Starting file comparison...\n');

  // Read CSV data
  const csvData = readCSV(CSV_FILE);
  const csvFiles = new Map();
  csvData.forEach(item => {
    csvFiles.set(item.name, item);
  });

  console.log(`📄 Found ${csvFiles.size} files in CSV`);

  // Get actual files
  const actualFiles = getCurrentDirectoryFiles();
  console.log(`📁 Found ${actualFiles.size} files in directory (excluding ${SCRIPT_FILE} and ${CSV_FILE})`);

  // Initialize result arrays
  const matches = [];
  const mismatches = [];
  const missingInDir = [];
  const extraInDir = [];

  // Compare CSV files against actual files
  csvFiles.forEach((csvItem, filename) => {
    if (actualFiles.has(filename)) {
      const actualItem = actualFiles.get(filename);
      const csvDate = parseCSVDate(csvItem.modified);

      if (!csvDate) {
        mismatches.push({
          filename: filename,
          csvDate: csvItem.modified,
          actualDate: formatDate(actualItem.modified),
          reason: 'Invalid CSV date format'
        });
        return;
      }

      const actualDate = actualItem.modified;
      const timeDiff = Math.abs(csvDate.getTime() - actualDate.getTime());

      // Consider dates matching if within 2 seconds (to account for filesystem precision)
      if (timeDiff <= 2000) {
        matches.push({
          filename: filename,
          csvDate: csvItem.modified,
          actualDate: formatDate(actualDate)
        });
      } else {
        mismatches.push({
          filename: filename,
          csvDate: csvItem.modified,
          actualDate: formatDate(actualDate),
          diffMs: timeDiff
        });
      }
    } else {
      missingInDir.push({
        filename: filename,
        csvDate: csvItem.modified
      });
    }
  });

  // Find files in directory that are not in CSV
  actualFiles.forEach((actualItem, filename) => {
    if (!csvFiles.has(filename)) {
      extraInDir.push({
        filename: filename,
        actualDate: formatDate(actualItem.modified)
      });
    }
  });

  // Print results
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 COMPARISON RESULTS');
  console.log(`${'='.repeat(60)}`);

  // Matches
  console.log(`\n✅ MATCHES: ${matches.length} file(s)`);
  if (matches.length > 0) {
    matches.forEach(item => {
      console.log(`   📄 ${item.filename}`);
      console.log(`      Date: ${item.csvDate} ✓`);
    });
  }

  // Mismatches
  console.log(`\n❌ MISMATCHES: ${mismatches.length} file(s)`);
  if (mismatches.length > 0) {
    mismatches.forEach(item => {
      console.log(`   📄 ${item.filename}`);
      if (item.reason) {
        console.log(`      ⚠️  ${item.reason}`);
      } else {
        console.log(`      CSV:    ${item.csvDate}`);
        console.log(`      Actual: ${item.actualDate}`);
        console.log(`      Diff:   ${(item.diffMs / 1000).toFixed(1)} seconds`);
      }
    });
  }

  // Missing in directory
  console.log(`\n📂 MISSING IN DIRECTORY: ${missingInDir.length} file(s)`);
  if (missingInDir.length > 0) {
    missingInDir.forEach(item => {
      console.log(`   📄 ${item.filename}`);
      console.log(`      Expected: ${item.csvDate}`);
    });
  }

  // Extra in directory
  console.log(`\n➕ EXTRA IN DIRECTORY: ${extraInDir.length} file(s)`);
  if (extraInDir.length > 0) {
    extraInDir.forEach(item => {
      console.log(`   📄 ${item.filename}`);
      console.log(`      Actual: ${item.actualDate}`);
    });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📈 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`   CSV file:                ${CSV_FILE}`);
  console.log(`   Script file:             ${SCRIPT_FILE}`);
  console.log(`   Files in CSV:            ${csvFiles.size}`);
  console.log(`   Files in directory:      ${actualFiles.size}`);
  console.log(`   Matches:                 ${matches.length}`);
  console.log(`   Mismatches:              ${mismatches.length}`);
  console.log(`   Missing in directory:    ${missingInDir.length}`);
  console.log(`   Extra in directory:      ${extraInDir.length}`);
  console.log(`${'='.repeat(60)}`);

  // Exit with error code if there are discrepancies
  if (mismatches.length > 0 || missingInDir.length > 0 || extraInDir.length > 0) {
    console.log('\n⚠️  Discrepancies found!');
    process.exit(1);
  } else {
    console.log('\n🎉 All files match perfectly!');
    process.exit(0);
  }
}

// Run the script
compareListings();
