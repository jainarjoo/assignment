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

/* --------------------------------
   FILE SELECTION
--------------------------------- */
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  fileName.textContent = file
    ? `${file.name} (${formatBytes(file.size)})`
    : "No file selected";
});


/* --------------------------------
   FORM SUBMISSION
--------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  hideMessage();

  if (!GOOGLE_APPS_SCRIPT_URL ||
      GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")) {

    showMessage(
      "error",
      "The portal is not connected to Google Sheets yet. Please ask the administrator to add the deployed Google Apps Script URL in script.js."
    );

    return;
  }

  const file = fileInput.files[0];

  /* Check PDF */
  if (!file) {
    showMessage("error", "Please select your assignment PDF.");
    return;
  }

  /* Check file type */
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    showMessage("error", "Only PDF files are accepted.");
    return;
  }

  /* Check file size */
  if (file.size > 10 * 1024 * 1024) {
    showMessage(
      "error",
      "The PDF is larger than 10 MB. Please reduce the file size and try again."
    );
    return;
  }

  /* Start loading */
  setLoading(true);

  try {

    /*
      Convert PDF to Base64
    */
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
      Send data to Google Apps Script
    */
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });


    /*
      IMPORTANT:
      no-cors does not allow us to read the server response.
      Therefore, after the request completes, show the
      confirmation screen.
    */

    showSuccessScreen();

    form.reset();

    fileName.textContent = "No file selected";

  }

  catch (err) {

    console.error(err);

    showMessage(
      "error",
      "Submission could not be completed. Please check your internet connection and try again."
    );

  }

  finally {

    setLoading(false);

  }

});


/* --------------------------------
   CONVERT FILE TO BASE64
--------------------------------- */
function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      resolve(
        String(reader.result).split(",")[1]
      );

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


/* --------------------------------
   FORMAT FILE SIZE
--------------------------------- */
function formatBytes(bytes) {

  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];

  const i = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(
    bytes / Math.pow(1024, i)
  ).toFixed(i ? 1 : 0)} ${units[i]}`;

}


/* --------------------------------
   LOADING STATE
--------------------------------- */
function setLoading(loading) {

  submitBtn.disabled = loading;

  btnText.textContent = loading
    ? "Submitting Assignment..."
    : "Submit Assignment";

  spinner.classList.toggle(
    "hidden",
    !loading
  );

}


/* --------------------------------
   SUCCESS MESSAGE
--------------------------------- */
function showSuccessScreen() {

  message.className = "message success";

  message.innerHTML = `
    <div class="success-icon">✓</div>

    <div class="success-title">
      Assignment Submitted Successfully!
    </div>

    <div class="success-text">
      Your assignment has been submitted successfully.
    </div>

    <div class="success-note">
      Please keep your PDF and student details for your records.
    </div>
  `;

  message.classList.remove("hidden");

  /*
    Bring the success message to the centre
    of the student's screen.
  */
  setTimeout(() => {

    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }, 100);

}


/* --------------------------------
   NORMAL MESSAGE
--------------------------------- */
function showMessage(type, text) {

  message.className = `message ${type}`;

  message.textContent = text;

  message.classList.remove("hidden");

}


/* --------------------------------
   HIDE MESSAGE
--------------------------------- */
function hideMessage() {

  message.className = "message hidden";

  message.textContent = "";

}
