```javascript
/*
  Google Apps Script Web App URL
*/
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwIc0NcHKR7goQ7WcGY3GPdmf-jjWGc4K4-WM3GC9Q3iHbTPQUliWEthy9fcVG0KYtW/exec";

const form = document.getElementById("assignmentForm");
const fileInput = document.getElementById("assignmentFile");
const fileName = document.getElementById("fileName");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");


// Show selected file name
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  fileName.textContent = file
    ? `${file.name} (${formatBytes(file.size)})`
    : "No file selected";
});


// Submit Assignment
form.addEventListener("submit", async (e) => {

  e.preventDefault();
  hideMessage();

  // Check whether Apps Script URL has been entered
  if (
    !GOOGLE_APPS_SCRIPT_URL ||
    GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR")
  ) {
    showMessage(
      "error",
      "The portal is not connected to Google Sheets. Please configure the Google Apps Script Web App URL."
    );
    return;
  }


  const file = fileInput.files[0];

  // Check file
  if (!file) {
    showMessage("error", "Please select your assignment PDF.");
    return;
  }


  // Check PDF
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    showMessage("error", "Only PDF files are accepted.");
    return;
  }


  // Maximum 10 MB
  if (file.size > 10 * 1024 * 1024) {
    showMessage(
      "error",
      "The PDF is larger than 10 MB. Please reduce the file size and try again."
    );
    return;
  }


  setLoading(true);


  try {

    // Convert PDF to Base64
    const base64 = await fileToBase64(file);


    // Collect student information
    const payload = {

      studentName:
        document.getElementById("studentName").value.trim(),

      rollNo:
        document.getElementById("rollNo").value.trim(),

      branch:
        document.getElementById("branch").value,

      year:
        document.getElementById("year").value,

      section:
        document.getElementById("section").value.trim(),

      semester:
        document.getElementById("semester").value,

      subject:
        document.getElementById("subject").value.trim(),

      assignmentTitle:
        document.getElementById("assignmentTitle").value.trim(),

      email:
        document.getElementById("email").value.trim(),

      fileName:
        file.name,

      mimeType:
        file.type || "application/pdf",

      fileData:
        base64
    };


    /*
      Send data to Google Apps Script

      text/plain is used to avoid CORS preflight.
    */

    await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify(payload)
      }
    );


    // Show success message
    showMessage(
      "success",
      "Your assignment has been submitted successfully."
    );


    // Reset form
    form.reset();

    fileName.textContent =
      "No file selected";


    // Scroll to submission section
    window.scrollTo({
      top:
        document.getElementById("submit").offsetTop - 70,
      behavior: "smooth"
    });


  } catch (error) {

    console.error(error);

    showMessage(
      "error",
      "Submission could not be completed. Please check your internet connection and try again."
    );

  } finally {

    setLoading(false);

  }

});


// Convert file to Base64
function fileToBase64(file) {

  return new Promise((resolve, reject) => {

    const reader =
      new FileReader();

    reader.onload = () => {

      const result =
        String(reader.result);

      const base64 =
        result.split(",")[1];

      resolve(base64);

    };

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


// Format file size
function formatBytes(bytes) {

  if (!bytes) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const i =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return (
    (bytes /
      Math.pow(1024, i)
    ).toFixed(i ? 1 : 0)
    + " "
    + units[i]
  );

}


// Loading state
function setLoading(loading) {

  submitBtn.disabled =
    loading;

  btnText.textContent =
    loading
      ? "Submitting..."
      : "Submit Assignment";

  spinner.classList.toggle(
    "hidden",
    !loading
  );

}


// Show message
function showMessage(type, text) {

  message.className =
    `message ${type}`;

  message.textContent =
    text;

  message.classList.remove(
    "hidden"
  );

}


// Hide message
function hideMessage() {

  message.className =
    "message hidden";

  message.textContent =
    "";

}
```
