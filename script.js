// State variables
let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let weeklyGoal = parseInt(localStorage.getItem('weeklyGoal')) || 0;

// --- VIEW NAVIGATION ---
const loginForm = document.getElementById('login-form');
const homeView = document.getElementById('home-view');
const appWrapper = document.getElementById('app-wrapper');
const navLinks = document.querySelectorAll('.nav-link[data-target]');
const pageSections = document.querySelectorAll('.page-section');
const logoutBtn = document.getElementById('logout-btn');

// --- MODAL LOGIC ---
const loginModal = document.getElementById('login-modal');
const navLoginBtn = document.getElementById('nav-login-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

if(navLoginBtn && loginModal) {
    navLoginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
}

if(closeModalBtn && loginModal) {
    closeModalBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
}

// Close modal if clicked outside of content
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
    }
});

// Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide Modal & Home View
        if (loginModal) loginModal.classList.remove('active');
        homeView.classList.remove('active');
        
        appWrapper.classList.remove('hidden');
        appWrapper.classList.add('active');
        // Default to dashboard
        navigateTo('dashboard-view');
    });
}

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        appWrapper.classList.remove('active');
        appWrapper.classList.add('hidden');
        homeView.classList.add('active');
    });
}

// Navigation logic
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        navigateTo(targetId);
    });
});

function navigateTo(targetId) {
    // Update nav links
    navLinks.forEach(link => {
        if(link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update sections
    pageSections.forEach(section => {
        if(section.id === targetId) {
            section.classList.remove('hidden');
            section.classList.add('active');
        } else {
            section.classList.remove('active');
            section.classList.add('hidden');
        }
    });
}

// --- QUICK CALCULATE LOGIC ---
const quickCalcForm = document.getElementById('quick-calc-form');
const calcStepsInput = document.getElementById('calc-steps');
const calcTimeInput = document.getElementById('calc-time');
const calcWeightInput = document.getElementById('calc-weight');

if(quickCalcForm) {
    quickCalcForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const steps = parseInt(calcStepsInput.value) || 0;
        const time = parseInt(calcTimeInput.value) || 0;
        const weight = parseFloat(calcWeightInput.value) || 70;
        
        // Simple formula for beginner project
        const calories = Math.round((weight * 0.035 * time) + (steps * 0.04));
        
        // Update UI Elements
        const caloriesVal = document.getElementById('calories-val');
        
        if(caloriesVal) {
            caloriesVal.textContent = calories + ' kcal';
            caloriesVal.style.color = 'var(--success-color)';
            caloriesVal.style.transform = 'scale(1.1)';
            setTimeout(() => {
                caloriesVal.style.color = 'var(--text-main)';
                caloriesVal.style.transform = 'scale(1)';
            }, 300);
        }
    });
}

// --- GOALS & LOGIC ---
// DOM Elements
const goalTargetInput = document.getElementById('goal-target');
const saveGoalBtn = document.getElementById('save-goal-btn');
const currentProgressEl = document.getElementById('current-progress');
const goalDisplayEl = document.getElementById('goal-display');
const progressBarFill = document.getElementById('progress-bar-fill');

const workoutForm = document.getElementById('workout-form');
const workoutDateInput = document.getElementById('workout-date');
const workoutTypeInput = document.getElementById('workout-type');
const workoutDurationInput = document.getElementById('workout-duration');
const workoutNotesInput = document.getElementById('workout-notes');

const workoutListEl = document.getElementById('workout-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Initialization
function init() {
    const today = new Date().toISOString().split('T')[0];
    if(workoutDateInput) workoutDateInput.value = today;

    updateGoalDisplay();
    renderWorkouts();
}

// Set Goal
if(saveGoalBtn) {
    saveGoalBtn.addEventListener('click', () => {
        const goal = parseInt(goalTargetInput.value);
        if (goal > 0) {
            weeklyGoal = goal;
            localStorage.setItem('weeklyGoal', weeklyGoal);
            updateGoalDisplay();
            goalTargetInput.value = '';
            alert('Weekly goal updated!');
        } else {
            alert('Please enter a valid number greater than 0.');
        }
    });
}

function getWorkoutsThisWeek() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 

    let count = 0;
    workouts.forEach(workout => {
        const parts = workout.date.split('-');
        const workoutDate = new Date(parts[0], parts[1] - 1, parts[2]);
        if (workoutDate >= startOfWeek && workoutDate <= today) {
            count++;
        }
    });
    return count;
}

function updateGoalDisplay() {
    if(!goalDisplayEl || !currentProgressEl || !progressBarFill) return;
    
    goalDisplayEl.textContent = weeklyGoal;
    
    if (weeklyGoal === 0) {
        currentProgressEl.textContent = '0';
        progressBarFill.style.width = '0%';
        return;
    }

    const currentCount = getWorkoutsThisWeek();
    currentProgressEl.textContent = currentCount;
    
    let percentage = (currentCount / weeklyGoal) * 100;
    if (percentage > 100) percentage = 100; 
    
    progressBarFill.style.width = `${percentage}%`;
    
    if (percentage === 100) {
        progressBarFill.style.background = 'linear-gradient(135deg, #05cd99 0%, #04b386 100%)'; 
    } else if (percentage > 50) {
        progressBarFill.style.background = 'linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%)'; 
    } else {
        progressBarFill.style.background = 'var(--primary-gradient)'; 
    }
}

// Log Workout
if(workoutForm) {
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newWorkout = {
            id: Date.now().toString(),
            date: workoutDateInput.value,
            type: workoutTypeInput.value,
            duration: parseInt(workoutDurationInput.value),
            notes: workoutNotesInput.value.trim()
        };

        workouts.push(newWorkout);
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        saveWorkouts();
        renderWorkouts();
        updateGoalDisplay();

        workoutTypeInput.value = '';
        workoutDurationInput.value = '';
        workoutNotesInput.value = '';
        
        alert('Workout logged successfully!');
    });
}

function renderWorkouts() {
    if(!workoutListEl) return;
    workoutListEl.innerHTML = '';
    
    if (workouts.length === 0) {
        workoutListEl.innerHTML = '<li class="empty-state">No workouts logged yet. Start moving! 🏃‍♂️</li>';
        return;
    }

    workouts.forEach(workout => {
        const li = document.createElement('li');
        li.className = 'workout-item';
        
        const parts = workout.date.split('-');
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const dateString = dateObj.toLocaleDateString();

        let notesHtml = '';
        if (workout.notes) {
            notesHtml = `<div class="notes">📝 ${workout.notes}</div>`;
        }

        li.innerHTML = `
            <div class="workout-info">
                <h3>${workout.type}</h3>
                <p><span>📅 ${dateString}</span> &bull; <span>⏱️ ${workout.duration} mins</span></p>
                ${notesHtml}
            </div>
            <button class="delete-workout" onclick="deleteWorkout('${workout.id}')" aria-label="Delete workout">✖</button>
        `;
        
        workoutListEl.appendChild(li);
    });
}

window.deleteWorkout = function(id) {
    if(confirm('Are you sure you want to delete this workout?')) {
        workouts = workouts.filter(workout => workout.id !== id);
        saveWorkouts();
        renderWorkouts();
        updateGoalDisplay();
    }
}

if(clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to delete ALL workout history? This cannot be undone.')) {
            workouts = [];
            saveWorkouts();
            renderWorkouts();
            updateGoalDisplay();
        }
    });
}

function saveWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Run init
init();
