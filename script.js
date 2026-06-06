const uploadUrl = "https://www.dropbox.com/request/abcd1234efgh5678";

const uploadButton = document.getElementById("uploadButton");
const qrCodeContainer = document.getElementById("qrCode");

uploadButton.href = uploadUrl;

new QRCode(qrCodeContainer, {
  text: uploadUrl,
  width: 170,
  height: 170,
  colorDark: "#ffffff",
  colorLight: "#020617",
  correctLevel: QRCode.CorrectLevel.H,
});

window.addEventListener("load", () => {
  qrCodeContainer.classList.add("loaded");
});
