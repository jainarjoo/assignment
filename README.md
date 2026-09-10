# B.Tech Assignment Submission Portal

A static HTML/CSS/JavaScript student portal for B.Tech 3rd/4th year CSE and AIML students.

## What it does

- Students fill in name, roll number, branch, year, section, semester, subject and assignment topic.
- Students upload a PDF assignment.
- The PDF is saved to Google Drive.
- Student details + the PDF link are added automatically to the supplied Google Sheet.
- The website does NOT redirect students to Google Forms.

## Files

- `index.html` — website
- `style.css` — design/responsive layout
- `script.js` — form validation and submission
- `Code.gs` — Google Apps Script backend
- `README.md` — setup instructions

## One-time Google setup

### 1. Open your Google Sheet

Use:
https://docs.google.com/spreadsheets/d/1P5xb12v0n_mzKVR-KML1SJZ-JDeZ1bIjB-NZsCDw9hc/edit?usp=sharing

Make sure you have edit access.

### 2. Open Apps Script

In the Google Sheet:
Extensions → Apps Script

Delete the default code and paste all content from `Code.gs`.

The Sheet ID is already configured in the code.

### 3. Deploy as Web App

In Apps Script:
Deploy → New deployment → Select type: Web app

Recommended settings:
- Execute as: Me
- Who has access: Anyone

Click Deploy and authorize the requested Google permissions.

Copy the generated Web App URL.

### 4. Connect the website

Open `script.js` and replace:

PASTE_YOUR_DEPLOYED_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE

with your Web App URL.

Do not put your Google account password, API key, or other secret in the HTML/JavaScript.

### 5. Publish the website

You can upload the four website files to GitHub Pages, Netlify, Vercel, your college server, or any normal static hosting service.

## Important notes

- The PDF upload is converted to Base64 in the browser and sent to Apps Script. The portal limits files to 10 MB.
- Google Sheets itself does not store PDF files. The PDF is stored in Google Drive and the clickable Drive URL is stored in the Sheet.
- The Apps Script currently makes submitted PDFs "Anyone with the link can view". If that is not suitable for your institute, remove the `setSharing(...)` line and use your institution's preferred Drive sharing policy.
- For production use, consider adding duplicate-submission rules, a submission deadline, faculty login/admin authentication, and stronger file-size controls.
