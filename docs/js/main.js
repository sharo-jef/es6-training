
// --- APPLICATION LOGIC ---

// DOM Elements
const chapterListEl = document.getElementById('chapter-list');
const slideTitleEl = document.getElementById('slide-title');
const slideContentEl = document.getElementById('slide-content');
const slideCounterEl = document.getElementById('slide-counter');
const slideContainerEl = document.getElementById('slide-container');
const exerciseContainerEl = document.getElementById('exercise-container');
const exerciseDescriptionEl = document.getElementById('exercise-description');
const codeEditorContainer = document.getElementById('code-editor-container');
const feedbackEl = document.getElementById('feedback');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const checkBtn = document.getElementById('check-btn');
const progressBarEl = document.getElementById('progress-bar');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const chapterSidebar = document.getElementById('chapter-sidebar');
const menuOverlay = document.getElementById('menu-overlay');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIconLight = document.getElementById('theme-icon-light');
const themeIconDark = document.getElementById('theme-icon-dark');
const completionModal = document.getElementById('completion-modal');
const closeModalBtn = document.getElementById('close-modal-btn');


// State
let currentChapterIndex = 0;
let currentSlideIndex = 0;
let unlockedChapterIndex = 0;
let monacoEditor;

// Functions
function render() {
    updateChapterList();
    const chapter = courseData[currentChapterIndex];
    
    const isExerciseView = currentSlideIndex >= chapter.slides.length;

    if (isExerciseView && chapter.exercise) {
        slideContainerEl.classList.add('hidden');
        exerciseContainerEl.classList.remove('hidden');
        
        exerciseDescriptionEl.innerHTML = chapter.exercise.description;
        
        if (monacoEditor && monacoEditor.getValue().trim() === '' && chapter.exercise.starterCode) {
            monacoEditor.setValue(chapter.exercise.starterCode);
        }

        slideTitleEl.textContent = chapter.title;
    } else {
        slideContainerEl.classList.remove('hidden');
        exerciseContainerEl.classList.add('hidden');

        const slide = chapter.slides[currentSlideIndex];
        if (slide) {
             slideTitleEl.textContent = `${chapter.title} (${currentSlideIndex + 1}/${chapter.slides.length})`;
             slideContentEl.innerHTML = slide.content;
        } else {
            // Fallback for chapters without slides (shouldn't happen with current data)
             slideTitleEl.textContent = chapter.title;
             slideContentEl.innerHTML = "";
        }
    }

    updateNavigation();
    updateProgressBar();
}

function updateChapterList() {
    chapterListEl.innerHTML = '';
    courseData.forEach((chapter, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = chapter.title;
        button.className = 'w-full text-left p-3 rounded-md transition duration-200';
        
        if (index === currentChapterIndex) {
            button.classList.add('bg-blue-500', 'text-white', 'font-bold');
        } else if (index <= unlockedChapterIndex) {
            button.classList.add('hover:bg-gray-100', 'dark:hover:bg-slate-700');
            button.onclick = () => {
                currentChapterIndex = index;
                currentSlideIndex = 0;
                feedbackEl.textContent = ''; 
                render();
                toggleMenu(false); // Force close menu
            };
        } else {
            button.classList.add('disabled-chapter');
            button.disabled = true;
        }
        
        li.appendChild(button);
        chapterListEl.appendChild(li);
    });
}

function updateNavigation() {
    const chapter = courseData[currentChapterIndex];
    const isExerciseView = currentSlideIndex >= chapter.slides.length;
    
    prevBtn.disabled = (currentChapterIndex === 0 && currentSlideIndex === 0);
    prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
    prevBtn.classList.toggle('cursor-not-allowed', prevBtn.disabled);
    
    // Reset next button styles before applying new ones
    nextBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'cursor-default');
    nextBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');


    if(isExerciseView) {
        if (currentChapterIndex === courseData.length -1) {
            nextBtn.textContent = '講座完了';
            if (unlockedChapterIndex > currentChapterIndex) { // Final test passed
                nextBtn.disabled = false;
                nextBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-blue-500', 'hover:bg-blue-600');
                nextBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            } else { // Final test not yet passed
                nextBtn.disabled = true;
                nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
             nextBtn.textContent = '次の章へ ＞';
             nextBtn.disabled = currentChapterIndex >= unlockedChapterIndex;
             nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
             nextBtn.classList.toggle('cursor-not-allowed', nextBtn.disabled);
        }
    } else {
        nextBtn.textContent = '次へ ＞';
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (!isExerciseView && chapter.slides.length > 0) {
        slideCounterEl.textContent = `${currentSlideIndex + 1} / ${chapter.slides.length}`;
        slideCounterEl.classList.remove('hidden');
    } else {
        slideCounterEl.classList.add('hidden');
    }
    
    checkBtn.disabled = currentChapterIndex !== unlockedChapterIndex;
    if(isExerciseView && !chapter.exercise) {
        checkBtn.disabled = true;
    }
}

function updateProgressBar() {
    // Exclude title slide from progress calculation
    const totalChapters = courseData.length -1;
    const completedChapters = unlockedChapterIndex -1;
    const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
    
    progressBarEl.style.width = `${progress}%`;
    if (progress > 5) { 
        progressBarEl.textContent = `${Math.round(progress)}%`;
    } else {
        progressBarEl.textContent = '';
    }
}


function handleNext() {
    if (currentChapterIndex === courseData.length - 1 && unlockedChapterIndex > currentChapterIndex) {
        showCompletionModal();
        return;
    }

    feedbackEl.textContent = ''; 
    const chapter = courseData[currentChapterIndex];

    if (currentSlideIndex < chapter.slides.length - 1) {
        currentSlideIndex++;
    } else if (currentSlideIndex === chapter.slides.length - 1) {
        if (chapter.exercise) {
            currentSlideIndex++;
        } else {
            if (currentChapterIndex < courseData.length - 1) {
                currentChapterIndex++;
                currentSlideIndex = 0;
                if (unlockedChapterIndex < currentChapterIndex) {
                    unlockedChapterIndex = currentChapterIndex;
                }
            }
        }
    } else { 
        if (currentChapterIndex < courseData.length - 1 && currentChapterIndex < unlockedChapterIndex) {
            currentChapterIndex++;
            currentSlideIndex = 0;
            if (monacoEditor) monacoEditor.setValue('');
        }
    }
    render();
}

function handlePrev() {
    feedbackEl.textContent = ''; 
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
    } else {
        if (currentChapterIndex > 0) {
            currentChapterIndex--;
            const prevChapter = courseData[currentChapterIndex];
            if (prevChapter.exercise) {
                currentSlideIndex = prevChapter.slides.length;
            } else {
                currentSlideIndex = prevChapter.slides.length - 1;
            }
        }
    }
    render();
}

function handleCheckAnswer() {
    const chapter = courseData[currentChapterIndex];
    if (!chapter.exercise || !monacoEditor) return;
    
    const userCode = monacoEditor.getValue();
    const result = chapter.exercise.testFunction(userCode);

    if (result.success) {
        feedbackEl.textContent = result.message;
        feedbackEl.className = 'text-right font-medium text-green-500 dark:text-green-400';
        if (currentChapterIndex === unlockedChapterIndex) {
           unlockedChapterIndex++;
        }
    } else {
        feedbackEl.textContent = result.message;
        feedbackEl.className = 'text-right font-medium text-red-500 dark:text-red-400';
    }
    render();
}

function toggleMenu(forceState) {
    const shouldBeOpen = forceState === undefined ? chapterSidebar.classList.contains('-translate-x-full') : forceState;
    
    if (shouldBeOpen) {
        chapterSidebar.classList.remove('-translate-x-full');
        menuOverlay.classList.remove('hidden');
    } else {
        chapterSidebar.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
    }
}

function setupTheme() {
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateTheme(isDark);
    };

    const updateTheme = (isDark) => {
        if (isDark) {
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        } else {
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        }
        if (window.monaco) {
             monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
        }
    };
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

    if (isDark) {
        document.documentElement.classList.add('dark');
    }
    updateTheme(isDark);
    return isDark;
}

function showCompletionModal() {
    completionModal.classList.remove('hidden');
    completionModal.classList.add('flex');
    
    setTimeout(() => {
        completionModal.querySelector('#modal-content').classList.remove('scale-95');
    }, 10);

    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });
}

function hideCompletionModal() {
    const modalContent = completionModal.querySelector('#modal-content');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
       completionModal.classList.add('hidden');
       completionModal.classList.remove('flex');
    }, 300); 
}


// Initial Setup
function init() {
    const isInitialDark = setupTheme();
    // After creating the title slide, we should unlock the first real chapter.
    unlockedChapterIndex = 1;

    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
        monacoEditor = monaco.editor.create(document.getElementById('code-editor-container'), {
            value: '',
            language: 'javascript',
            theme: isInitialDark ? 'vs-dark' : 'vs',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
        });

        nextBtn.addEventListener('click', handleNext);
        prevBtn.addEventListener('click', handlePrev);
        checkBtn.addEventListener('click', handleCheckAnswer);
        menuToggleBtn.addEventListener('click', () => toggleMenu());
        menuOverlay.addEventListener('click', () => toggleMenu(false));
        closeModalBtn.addEventListener('click', hideCompletionModal);
        
        render();
    });
}

// Start the application
init();
