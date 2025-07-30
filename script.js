let moodEntries = [];
let selectedMood = null;

const moods = {
  1: { emoji: "😩", text: "Terrible", color: "#dc3545" },
  2: { emoji: "😞", text: "Bad", color: "#fd7e14" },
  3: { emoji: "😐", text: "Okay", color: "#ffc107" },
  4: { emoji: "🙂", text: "Good", color: "#28a745" },
  5: { emoji: "😁", text: "Great", color: "#17a2b8" },
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
  document.getElementById("mood__average").textContent =
    avg > 0 ? `${moods[rounded].emoji} ${avg.toFixed(1)}` : "😐 0.0";
  document.getElementById("mood__stats").textContent =
    moodEntries.length > 0
      ? `${moodEntries.length} total entries • Average: ${avg.toFixed(1)}/5`
      : "No entries recorded yet.";
}

function showMoodEntries() {
  const container = document.getElementById("entries__container");
  if (moodEntries.length === 0) {
    container.innerHTML =
      '<div class="no__entries">No mood entries yet. Add your first entry above!</div>';
    return;
  }
  container.innerHTML = moodEntries
    .slice(0, 10)
    .map((entry) => {
      const mood = moods[entry.mood];
      const date = new Date(entry.id).toLocaleDateString();
      return `
      <div class="mood__entry">
        <div class="entry__header">
          <div class="entry__left">
            <div class="entry__mood">
              <span style="font-size: 20px;">${mood.emoji}</span>
              <span style="color: ${mood.color};">${mood.text} (${
        entry.mood
      }/5)</span>
            </div>
            <div class="entry__date">${date}</div>
          </div>
          <button class="delete__entry" onclick="deleteMoodEntry(${
            entry.id
          })">×</button>
        </div>
        ${entry.note ? `<div class="entry__note">${entry.note}</div>` : ""}
      </div>`;
    })
    .join("");
}

function updateMoodChart() {
  const barsContainer = document.getElementById("chart__bars"); // barsContainer is grabbing the chart__bars in HTML

  const days = []; // to display
  for (let i = 6; i >= 0; i--) {
    // loops from 6 to 0 => 6,5,4,3,2,1,0
    const date = new Date(); // get the current date
    date.setDate(date.getDate() - i); // setting all of the dates from 6,5,4,3,2, and 1 day ago
    const dateString = date.toDateString();
    const entry = moodEntries.find((e) => e.date === dateString); // going into the moodEntries array [] going over and finding the one that matches my dateString

    days.push({
      // pushing this object to days []
      label: date.toLocaleDateString("en-US", { weekday: "short" }), // "American" way of displaying the date
      mood: entry ? entry.mood : 0, // going to check if an entry exists, if not it will = 0
      date: date.toLocaleDateString(), // showing the date
    });
  }

  barsContainer.innerHTML = days // call barsContainer and change each of the days
    .map((day) => {
      const height = day.mood > 0 ? (day.mood / 5) * 100 : 2; // 0 to 100% EX: day.mood = 2 = 0.40 = 40%
      const mood = day.mood > 0 ? moods[day.mood] : null; // one moods object
      const hasData = day.mood > 0; //true || false

      return `
            <div class="chart__bar--container">
                <div class="chart__bar"
                    style="height: ${height}%; ${
        hasData
          ? `background-color: ${mood.color}80; border-color: ${mood.color};` // if it hasData
          : "" // if it doesn't
      }">
                    <div class="chart__toolTip">
                        ${
                          hasData
                            ? `${mood.emoji} ${mood.text} (${day.mood}/5)` // if it hasData
                            : "No entry" // if it doesn't
                        }
                    </div>
                </div>
                <div class="chart__x--label">${day.label}</div>
            </div>
        `;
    })
    .join("");
}

function updateDisplay() {
  updateMoodSummary(); // starts at the top (mood average + number of entries)
  showMoodEntries(); // the list of mood entries
  updateMoodChart(); // the 7-day chart
}

function showMessage(text) {
  // "hello world"
  const div = document.createElement("div"); // creates a div
  div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: #8a2be2;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
  div.textContent = text;
  document.body.appendChild(div); // inserting the message/ notification into the body
  setTimeout(() => div.remove(), 3000); // remove it from the body after 3 seconds
}

function initializeJournal() {
  // load saved data from localStorage and make the moodEntries variable equal to it
  const saved = localStorage.getItem("moodEntries");
  if (saved) {
    moodEntries = JSON.parse(saved);
  }

  // shows the correct day of the week and day of the month in the top right corner of the screen
  const now = new Date();
  document.getElementById("currentDay").textContent = now.toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );
  document.getElementById("currentDate").textContent = now.toLocaleDateString();

  //
  document.querySelectorAll(".mood__option").forEach((option) => {
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".mood__option")
        .forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectedMood = parseInt(option.dataset.mood);
    });
  });

  document.getElementById("add__entry--btn").addEventListener("click", () => {
    if (!selectedMood) {
      showMessage("Please select a mood first!");
      return;
    }

    const note = document.getElementById("mood__note").value.trim();
    addMoodEntry(selectedMood, note);
    document.getElementById("mood__note").value = "";
    document
      .querySelectorAll(".mood__option")
      .forEach((opt) => opt.classList.remove("selected"));
    selectedMood = null;
    showMessage("Mood entry added!");
  });

  updateDisplay(); // updats the UI
}

document.addEventListener("DOMContentLoaded", initializeJournal); // to help with the project scaleability - this isn't running the function until it is completely loaded

// save mood entries befor the user leaves the page
window.addEventListener("beforerunload", () => {
    saveMoodEntries();
});
// another way of writing w/o needing saveMoodEntries in the addMoodEntries() and deleteMoodEntries functions 