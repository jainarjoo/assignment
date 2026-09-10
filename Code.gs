/*******************************************************
 * GOOGLE APPS SCRIPT BACKEND
 * Assignment Submission Portal
 *
 * This script:
 * 1. Receives student details + PDF from the website.
 * 2. Saves the PDF in Google Drive.
 * 3. Adds a submission row to your Google Sheet.
 *******************************************************/

const SHEET_ID = "1P5xb12v0n_mzKVR-KML1SJZ-JDeZ1bIjB-NZsCDw9hc";

// A folder will be created automatically inside your Drive.
// You can also replace this with an existing folder ID.
const DRIVE_FOLDER_NAME = "BTech Assignment Submissions";

function doGet() {
  return ContentService
    .createTextOutput("Assignment Submission API is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No submission data received.");
    }

    const data = JSON.parse(e.postData.contents);

    const required = ["studentName", "rollNo", "branch", "year", "subject", "assignmentTitle", "fileName", "fileData"];
    required.forEach(function(key) {
      if (!data[key]) throw new Error("Missing field: " + key);
    });

    // Decode and save PDF
    const bytes = Utilities.base64Decode(data.fileData);
    const safeFileName = sanitizeFileName(
      data.rollNo + "_" + data.subject + "_" + data.assignmentTitle + "_" + data.fileName
    );

    const blob = Utilities.newBlob(bytes, "application/pdf", safeFileName);
    const folder = getOrCreateFolder(DRIVE_FOLDER_NAME);
    const file = folder.createFile(blob);

    // Optional: make the submitted PDF accessible to anyone with the link.
    // Remove/comment these two lines if your institute does not want public links.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    // Add headers automatically if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Student Name", "Roll No", "Branch", "Year",
        "Section", "Semester", "Subject", "Assignment Title",
        "College Email", "PDF File Name", "PDF Link"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.studentName,
      data.rollNo,
      data.branch,
      data.year,
      data.section || "",
      data.semester || "",
      data.subject,
      data.assignmentTitle,
      data.email || "",
      safeFileName,
      file.getUrl()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Assignment submitted successfully",
        fileUrl: file.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error(error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function sanitizeFileName(name) {
  return String(name)
    .replace(/[\\\\/:*?"<>|#%{}~&]/g, "_")
    .replace(/\s+/g, "_")
    .substring(0, 180);
}
