/*
  IMPORTANT:
  1. Deploy the Code.gs file as a Google Apps Script Web App.
  2. Copy the Web App URL and paste it below.
*/
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzqXsFWb7KvQDc1LPs0K1nIaA2o99nlqWB21DllQ_UyAC4kacdOyhaiuwJR-8rI4Knv/exec";

const form = document.getElementById("assignmentForm");
const fileInput = document.getElementById("assignmentFile");
const fileName = document.getElementById("fileName");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? `${file.name} (${formatBytes(file.size)})` : "No file selected";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage();

 if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
  showMessage("error", "The portal is not connected to Google Sheets yet. Please ask the administrator to add the deployed Google Apps Script URL in script.js.");
  return;
}

  const file = fileInput.files[0];
  if (!file) return showMessage("error", "Please select your assignment PDF.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return showMessage("error", "Only PDF files are accepted.");
  }
  if (file.size > 10 * 1024 * 1024) {
    return showMessage("error", "The PDF is larger than 10 MB. Please reduce the file size and try again.");
  }

  setLoading(true);

  try {
    const base64 = await fileToBase64(file);
    const payload = {
      studentName: document.getElementById("studentName").value.trim(),
      rollNo: document.getElementById("rollNo").value.trim(),
      branch: document.getElementById("branch").value,
      year: document.getElementById("year").value,
      section: document.getElementById("section").value.trim(),
      semester: document.getElementById("semester").value,
      subject: document.getElementById("subject").value.trim(),
      assignmentTitle: document.getElementById("assignmentTitle").value.trim(),
      email: document.getElementById("email").value.trim(),
      fileName: file.name,
      mimeType: file.type || "application/pdf",
      fileData: base64
    };

    /*
      text/plain is intentional: it avoids a browser CORS preflight.
      The Apps Script doPost() receives and processes the JSON body.
    */
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(payload)
    });

    showMessage("success", "Your assignment has been submitted. Please keep your PDF and student details for your records.");
    form.reset();
    fileName.textContent = "No file selected";
    window.scrollTo({top: document.getElementById("submit").offsetTop - 70, behavior: "smooth"});
  } catch (err) {
    console.error(err);
    showMessage("error", "Submission could not be completed. Please check your internet connection and try again.");
  } finally {
    setLoading(false);
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? "Submitting..." : "Submit Assignment";
  spinner.classList.toggle("hidden", !loading);
}

function showMessage(type, text) {
  message.className = `message ${type}`;
  message.textContent = text;
  message.classList.remove("hidden");
}

function hideMessage() {
  message.className = "message hidden";
  message.textContent = "";
}
