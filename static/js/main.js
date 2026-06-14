const fileInput  = document.getElementById("file-input");
const uploadBox  = document.getElementById("upload-box");
const loading    = document.getElementById("loading");
const resultCard = document.getElementById("result-card");

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) uploadResume(fileInput.files[0]);
});

uploadBox.addEventListener("click", (e) => {
  if (e.target !== fileInput) fileInput.click();
});

uploadBox.addEventListener("dragover", e => {
  e.preventDefault();
  uploadBox.style.borderColor = "#00d4ff";
});

uploadBox.addEventListener("drop", e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".pdf")) uploadResume(file);
});

async function uploadResume(file) {
  uploadBox.classList.add("hidden");
  loading.classList.remove("hidden");
  resultCard.classList.add("hidden");

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res  = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    loading.classList.add("hidden");
    resultCard.innerHTML = buildResult(data);
    resultCard.classList.remove("hidden");
  } catch (err) {
    loading.classList.add("hidden");
    uploadBox.classList.remove("hidden");
    alert("Error: " + err.message);
  }
}

function buildResult(d) {
  const verdictClass = d.verdict === "Shortlist" ? "shortlist"
                     : d.verdict === "Maybe"     ? "maybe"
                     : "reject";

  const strengths    = d.strengths.map(s    => `<li>${s}</li>`).join("");
  const improvements = d.improvements.map(i => `<li>${i}</li>`).join("");

  return `
    <div class="result">
      <span class="verdict ${verdictClass}">${d.verdict}</span>
      <div class="scores">
        <div class="score-card">
          <div class="num">${d.overall_score}</div>
          <div class="label">Overall</div>
        </div>
        <div class="score-card">
          <div class="num">${d.skills_score}</div>
          <div class="label">Skills</div>
        </div>
        <div class="score-card">
          <div class="num">${d.experience_score}</div>
          <div class="label">Experience</div>
        </div>
        <div class="score-card">
          <div class="num">${d.education_score}</div>
          <div class="label">Education</div>
        </div>
      </div>
      <p class="summary">${d.summary}</p>
      <div class="two-col">
        <div>
          <p class="section-title">Strengths</p>
          <ul>${strengths}</ul>
        </div>
        <div>
          <p class="section-title">Improvements</p>
          <ul>${improvements}</ul>
        </div>
      </div>
    </div>
  `;
}