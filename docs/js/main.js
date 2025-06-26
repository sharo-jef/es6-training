// --- APPLICATION LOGIC ---

// DOM Elements
const chapterListEl = document.getElementById("chapter-list");
const slideTitleEl = document.getElementById("slide-title");
const slideContentEl = document.getElementById("slide-content");
const slideCounterEl = document.getElementById("slide-counter");
const slideContainerEl = document.getElementById("slide-container");
const exerciseContainerEl = document.getElementById("exercise-container");
const exerciseDescriptionEl = document.getElementById("exercise-description");
const codeEditorContainer = document.getElementById("code-editor-container");
const feedbackEl = document.getElementById("feedback");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const checkBtn = document.getElementById("check-btn");
const progressBarEl = document.getElementById("progress-bar");
const menuToggleBtn = document.getElementById("menu-toggle-btn");
const chapterSidebar = document.getElementById("chapter-sidebar");
const menuOverlay = document.getElementById("menu-overlay");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIconLight = document.getElementById("theme-icon-light");
const themeIconDark = document.getElementById("theme-icon-dark");
const completionModal = document.getElementById("completion-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const resetProgressBtn = document.getElementById("reset-progress-btn");

// State
let currentChapterIndex = 0;
let currentLessonIndex = 0;
let currentSlideIndex = 0;
let completionStatus = {}; // { 'c0-l0': true, 'c0-l1': false }
let monacoEditor;

// --- Reset Progress Modal ---
let resetModalEl;
let resetModalConfirmBtn;
let resetModalCancelBtn;

function createResetModal() {
  if (document.getElementById("reset-modal")) return;
  resetModalEl = document.createElement("div");
  resetModalEl.id = "reset-modal";
  resetModalEl.className =
    "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4";
  resetModalEl.innerHTML = `
    <div class="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl text-center max-w-md w-full">
      <h2 class="text-2xl font-bold text-red-500 mb-4">進捗をリセットしますか？</h2>
      <p class="mb-6 text-gray-700 dark:text-gray-200">この操作は元に戻せません。<br>本当にリセットしますか？</p>
      <div class="flex justify-center gap-4">
        <button id="reset-modal-confirm" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">リセット</button>
        <button id="reset-modal-cancel" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(resetModalEl);
  resetModalConfirmBtn = document.getElementById("reset-modal-confirm");
  resetModalCancelBtn = document.getElementById("reset-modal-cancel");
  resetModalConfirmBtn.onclick = () => {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    currentChapterIndex = 0;
    currentLessonIndex = 0;
    currentSlideIndex = 0;
    completionStatus = {};
    feedbackEl.textContent = "";
    render();
    toggleMenu(false);
    closeResetModal();
  };
  resetModalCancelBtn.onclick = closeResetModal;
}

function closeResetModal() {
  if (resetModalEl) {
    resetModalEl.remove();
    resetModalEl = null;
  }
}

resetProgressBtn.addEventListener("click", () => {
  createResetModal();
});

const PROGRESS_STORAGE_KEY = "es6-tutorial-progress";

// --- Data Utility Functions ---
function getLesson(chapterIndex, lessonIndex) {
  return courseData[chapterIndex]?.lessons[lessonIndex];
}

function isLessonCompleted(chapterIndex, lessonIndex) {
  return completionStatus[`c${chapterIndex}-l${lessonIndex}`] === true;
}

function isLessonUnlocked(chapterIndex, lessonIndex) {
  if (chapterIndex === 0 && lessonIndex === 0) return true;

  const { prevChapter, prevLesson } = getPreviousLessonIndices(
    chapterIndex,
    lessonIndex
  );
  return isLessonCompleted(prevChapter, prevLesson);
}

function getNextLessonIndices(chapterIndex, lessonIndex) {
  const chapter = courseData[chapterIndex];
  if (lessonIndex < chapter.lessons.length - 1) {
    return { nextChapter: chapterIndex, nextLesson: lessonIndex + 1 };
  }
  if (chapterIndex < courseData.length - 1) {
    return { nextChapter: chapterIndex + 1, nextLesson: 0 };
  }
  return { nextChapter: null, nextLesson: null }; // End of course
}

function getPreviousLessonIndices(chapterIndex, lessonIndex) {
  if (lessonIndex > 0) {
    return { prevChapter: chapterIndex, prevLesson: lessonIndex - 1 };
  }
  if (chapterIndex > 0) {
    const prevChapter = courseData[chapterIndex - 1];
    return {
      prevChapter: chapterIndex - 1,
      prevLesson: prevChapter.lessons.length - 1,
    };
  }
  return { prevChapter: 0, prevLesson: 0 }; // Beginning of course
}

// --- Progress Management ---
function saveProgress() {
  const progress = {
    currentChapterIndex,
    currentLessonIndex,
    currentSlideIndex,
    completionStatus,
  };
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function loadProgress() {
  const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    currentChapterIndex = progress.currentChapterIndex || 0;
    currentLessonIndex = progress.currentLessonIndex || 0;
    currentSlideIndex = progress.currentSlideIndex || 0;
    completionStatus = progress.completionStatus || {};
  }
}

// --- Core Application Logic ---
function render() {
  const lesson = getLesson(currentChapterIndex, currentLessonIndex);
  if (!lesson) return; // Should not happen

  updateChapterList();

  const isExerciseView = currentSlideIndex >= lesson.slides.length;

  if (isExerciseView && lesson.exercise) {
    slideContainerEl.classList.add("hidden");
    exerciseContainerEl.classList.remove("hidden");
    exerciseDescriptionEl.innerHTML = lesson.exercise.description;

    if (
      monacoEditor &&
      monacoEditor.getValue().trim() === "" &&
      lesson.exercise.starterCode
    ) {
      monacoEditor.setValue(lesson.exercise.starterCode);
    }
    slideTitleEl.textContent = lesson.title;
  } else {
    slideContainerEl.classList.remove("hidden");
    exerciseContainerEl.classList.add("hidden");

    const slide = lesson.slides[currentSlideIndex];
    if (slide) {
      slideTitleEl.textContent = `${lesson.title} (${currentSlideIndex + 1}/${
        lesson.slides.length
      })`;
      slideContentEl.innerHTML = slide.content;
    } else {
      slideTitleEl.textContent = lesson.title;
      slideContentEl.innerHTML = "";
    }
  }

  updateNavigation();
  updateProgressBar();
  saveProgress();
}

function updateChapterList() {
  chapterListEl.innerHTML = "";
  courseData.forEach((chapter, chapterIdx) => {
    const chapterHeader = document.createElement("h3");
    chapterHeader.textContent = chapter.chapterTitle;
    chapterHeader.className =
      "text-lg font-bold text-gray-800 dark:text-gray-200 px-3 pt-4 pb-2";
    chapterListEl.appendChild(chapterHeader);

    const lessonList = document.createElement("ul");
    chapter.lessons.forEach((lesson, lessonIdx) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const isCompleted = isLessonCompleted(chapterIdx, lessonIdx);
      const isCurrent =
        chapterIdx === currentChapterIndex && lessonIdx === currentLessonIndex;
      const isUnlocked = isLessonUnlocked(chapterIdx, lessonIdx);

      button.innerHTML = `
                <span class="flex-grow">${lesson.title}</span>
                ${
                  isCompleted
                    ? '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
                    : ""
                }
            `;
      button.className =
        "w-full text-left p-3 rounded-md transition duration-200 flex items-center justify-between";

      if (isCurrent) {
        button.classList.add("bg-blue-500", "text-white", "font-bold");
      } else if (isUnlocked) {
        button.classList.add("hover:bg-gray-100", "dark:hover:bg-slate-700");
        button.onclick = () => {
          currentChapterIndex = chapterIdx;
          currentLessonIndex = lessonIdx;
          currentSlideIndex = 0;
          feedbackEl.textContent = "";
          render();
          toggleMenu(false);
        };
      } else {
        button.classList.add(
          "text-gray-400",
          "dark:text-gray-500",
          "cursor-not-allowed"
        );
        button.disabled = true;
      }
      li.appendChild(button);
      lessonList.appendChild(li);
    });
    chapterListEl.appendChild(lessonList);
  });
}

function updateNavigation() {
  const lesson = getLesson(currentChapterIndex, currentLessonIndex);
  const isExerciseView = currentSlideIndex >= lesson.slides.length;

  prevBtn.disabled =
    currentChapterIndex === 0 &&
    currentLessonIndex === 0 &&
    currentSlideIndex === 0;
  prevBtn.classList.toggle("opacity-50", prevBtn.disabled);
  prevBtn.classList.toggle("cursor-not-allowed", prevBtn.disabled);

  nextBtn.classList.remove("bg-green-500", "hover:bg-green-600");
  nextBtn.classList.add("bg-blue-500", "hover:bg-blue-600");

  const { nextChapter, nextLesson } = getNextLessonIndices(
    currentChapterIndex,
    currentLessonIndex
  );
  const isLastLesson = nextChapter === null;

  if (isExerciseView) {
    if (isLastLesson) {
      nextBtn.textContent = "講座完了";
      if (isLessonCompleted(currentChapterIndex, currentLessonIndex)) {
        nextBtn.disabled = false;
        nextBtn.classList.remove(
          "opacity-50",
          "cursor-not-allowed",
          "bg-blue-500",
          "hover:bg-blue-600"
        );
        nextBtn.classList.add("bg-green-500", "hover:bg-green-600");
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.add("opacity-50", "cursor-not-allowed");
      }
    } else {
      nextBtn.textContent = "次のレッスンへ ＞";
      nextBtn.disabled = !isLessonCompleted(
        currentChapterIndex,
        currentLessonIndex
      );
      nextBtn.classList.toggle("opacity-50", nextBtn.disabled);
      nextBtn.classList.toggle("cursor-not-allowed", nextBtn.disabled);
    }
  } else {
    nextBtn.textContent = "次へ ＞";
    nextBtn.disabled = false;
    nextBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }

  if (!isExerciseView && lesson.slides.length > 0) {
    slideCounterEl.textContent = `${currentSlideIndex + 1} / ${
      lesson.slides.length
    }`;
    slideCounterEl.classList.remove("hidden");
  } else {
    slideCounterEl.classList.add("hidden");
  }

  checkBtn.disabled =
    !isExerciseView ||
    !lesson.exercise ||
    isLessonCompleted(currentChapterIndex, currentLessonIndex);
}

function updateProgressBar() {
  let totalLessons = 0;
  let completedLessons = 0;
  courseData.forEach((chapter, chapterIdx) => {
    chapter.lessons.forEach((lesson, lessonIdx) => {
      if (lesson.exercise) {
        // Only count lessons with exercises towards progress
        totalLessons++;
        if (isLessonCompleted(chapterIdx, lessonIdx)) {
          completedLessons++;
        }
      }
    });
  });

  const progress =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  progressBarEl.style.width = `${progress}%`;
  if (progress > 0) {
    progressBarEl.textContent = `${Math.round(progress)}%`;
  } else {
    progressBarEl.textContent = "";
  }
}

function handleNext() {
  const lesson = getLesson(currentChapterIndex, currentLessonIndex);
  const isLastLesson =
    getNextLessonIndices(currentChapterIndex, currentLessonIndex)
      .nextChapter === null;

  if (
    isLastLesson &&
    isLessonCompleted(currentChapterIndex, currentLessonIndex)
  ) {
    showCompletionModal();
    return;
  }

  feedbackEl.textContent = "";

  if (currentSlideIndex < lesson.slides.length - 1) {
    currentSlideIndex++;
  } else if (currentSlideIndex === lesson.slides.length - 1) {
    if (lesson.exercise) {
      currentSlideIndex++; // Move to exercise view
    } else {
      // No exercise, complete lesson and move to next
      completionStatus[`c${currentChapterIndex}-l${currentLessonIndex}`] = true;
      const { nextChapter, nextLesson } = getNextLessonIndices(
        currentChapterIndex,
        currentLessonIndex
      );
      if (nextChapter !== null) {
        currentChapterIndex = nextChapter;
        currentLessonIndex = nextLesson;
        currentSlideIndex = 0;
      }
    }
  } else {
    // On exercise view
    if (isLessonCompleted(currentChapterIndex, currentLessonIndex)) {
      const { nextChapter, nextLesson } = getNextLessonIndices(
        currentChapterIndex,
        currentLessonIndex
      );
      if (nextChapter !== null) {
        currentChapterIndex = nextChapter;
        currentLessonIndex = nextLesson;
        currentSlideIndex = 0;
        if (monacoEditor)
          monacoEditor.setValue(
            getLesson(currentChapterIndex, currentLessonIndex)?.exercise
              ?.starterCode || ""
          );
      }
    }
  }
  render();
}

function handlePrev() {
  feedbackEl.textContent = "";
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
  } else {
    const { prevChapter, prevLesson } = getPreviousLessonIndices(
      currentChapterIndex,
      currentLessonIndex
    );
    const targetLesson = getLesson(prevChapter, prevLesson);
    currentChapterIndex = prevChapter;
    currentLessonIndex = prevLesson;
    currentSlideIndex = targetLesson.slides.length; // Go to exercise view of previous lesson
  }
  render();
}

function handleCheckAnswer() {
  const lesson = getLesson(currentChapterIndex, currentLessonIndex);
  if (!lesson.exercise || !monacoEditor) return;

  const userCode = monacoEditor.getValue();
  const result = lesson.exercise.testFunction(userCode);

  if (result.success) {
    feedbackEl.textContent = result.message;
    feedbackEl.className =
      "text-right font-medium text-green-500 dark:text-green-400";
    completionStatus[`c${currentChapterIndex}-l${currentLessonIndex}`] = true;
  } else {
    feedbackEl.textContent = result.message;
    feedbackEl.className =
      "text-right font-medium text-red-500 dark:text-red-400";
  }
  render();
}

function toggleMenu(forceState) {
  const shouldBeOpen =
    forceState === undefined
      ? chapterSidebar.classList.contains("-translate-x-full")
      : forceState;
  if (shouldBeOpen) {
    chapterSidebar.classList.remove("-translate-x-full");
    menuOverlay.classList.remove("hidden");
  } else {
    chapterSidebar.classList.add("-translate-x-full");
    menuOverlay.classList.add("hidden");
  }
}

function setupTheme() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateTheme(isDark);
  };

  const updateTheme = (isDark) => {
    themeIconLight.classList.toggle("hidden", isDark);
    themeIconDark.classList.toggle("hidden", !isDark);
    if (window.monaco) {
      monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
    }
  };

  themeToggleBtn.addEventListener("click", toggleTheme);
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (savedTheme === null && prefersDark);

  if (isDark) {
    document.documentElement.classList.add("dark");
  }
  updateTheme(isDark);
  return isDark;
}

function showCompletionModal() {
  completionModal.classList.remove("hidden");
  completionModal.classList.add("flex");
  setTimeout(() => {
    completionModal
      .querySelector("#modal-content")
      .classList.remove("scale-95");
  }, 10);
  confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
}

function hideCompletionModal() {
  const modalContent = completionModal.querySelector("#modal-content");
  modalContent.classList.add("scale-95");
  setTimeout(() => {
    completionModal.classList.add("hidden");
    completionModal.classList.remove("flex");
  }, 300);
}

// --- Initial Setup ---
function init() {
  loadProgress();
  const isInitialDark = setupTheme();

  require.config({
    paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs" },
  });
  require(["vs/editor/editor.main"], function () {
    monacoEditor = monaco.editor.create(
      document.getElementById("code-editor-container"),
      {
        value: "",
        language: "javascript",
        theme: isInitialDark ? "vs-dark" : "vs",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
      }
    );

    nextBtn.addEventListener("click", handleNext);
    prevBtn.addEventListener("click", handlePrev);
    checkBtn.addEventListener("click", handleCheckAnswer);
    menuToggleBtn.addEventListener("click", () => toggleMenu());
    menuOverlay.addEventListener("click", () => toggleMenu(false));
    closeModalBtn.addEventListener("click", hideCompletionModal);

    // Initial render
    render();
  });
}

// Start the application
init();
