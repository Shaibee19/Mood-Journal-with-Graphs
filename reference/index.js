/* =====================
PART 1 JS (Kat)
===================== */

// Mood Journal - Vanilla JS Version
let moodEntries = [];
let selectedMood = null;

const moods = {
  1: { emoji: "😢", text: "Terrible", color: "#dc3545" },
  2: { emoji: "😟", text: "Bad", color: "#fd7e14" },
  3: { emoji: "😐", text: "Okay", color: "#ffc107" },
  4: { emoji: "😊", text: "Good", color: "#28a745" },
  5: { emoji: "😄", text: "Great", color: "#17a2b8" },
};

function saveMoodEntries() {
  localStorage.setItem("moodEntries", JSON.stringify(moodEntries));
}

function addMoodEntry(mood, note) {
  const today = new Date().toDateString();
  moodEntries = moodEntries.filter((e) => e.date !== today);
  moodEntries.push({ id: Date.now(), mood, note, date: today });
  moodEntries.sort((a, b) => b.id - a.id);
  saveMoodEntries(); // Save after adding
  updateDisplay();
}

function deleteMoodEntry(id) {
  moodEntries = moodEntries.filter((e) => e.id !== id);
  saveMoodEntries(); // Save after deleting
  updateDisplay();
}

function getMoodAverage() {
  if (moodEntries.length === 0) return 0;
  return moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length;
}

function updateMoodSummary() {
  const avg = getMoodAverage();
  const rounded = Math.round(avg);
  document.getElementById("mood-average").textContent =
    avg > 0 ? `${moods[rounded].emoji} ${avg.toFixed(1)}` : "😐 0.0";
  document.getElementById("mood-stats").textContent =
    moodEntries.length > 0
      ? `${moodEntries.length} total entries • Average: ${avg.toFixed(1)}/5`
      : "No entries recorded yet";
}

function showMoodEntries() {
  const container = document.getElementById("entries-container");
  if (moodEntries.length === 0) {
    container.innerHTML =
      '<div class="no-entries">No mood entries yet. Add your first entry above!</div>';
    return;
  }
  container.innerHTML = moodEntries
    .slice(0, 10)
    .map((entry) => {
      const mood = moods[entry.mood];
      const date = new Date(entry.id).toLocaleDateString();
      return `
      <div class="mood-entry">
        <div class="entry-header">
          <div class="entry-left">
            <div class="entry-mood">
              <span style="font-size: 20px;">${mood.emoji}</span>
              <span style="color: ${mood.color};">${mood.text} (${
        entry.mood
      }/5)</span>
            </div>
            <div class="entry-date">${date}</div>
          </div>
          <button class="delete-entry" onclick="deleteMoodEntry(${
            entry.id
          })">×</button>
        </div>
        ${entry.note ? `<div class="entry-note">${entry.note}</div>` : ""}
      </div>`;
    })
    .join("");
}