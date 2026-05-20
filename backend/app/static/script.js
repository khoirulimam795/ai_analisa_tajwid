import * as THREE from 'three';

// ========== THREE.JS BINTANG ==========
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030b17);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Bintang utama
const starCount = 4500;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
    const radius = 40 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    starPositions[i * 3 + 2] = radius * Math.cos(phi) - 10;

    const colorType = Math.random();
    if (colorType < 0.7) {
        starColors[i * 3] = 0.85 + Math.random() * 0.15;
        starColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        starColors[i * 3 + 2] = 1.0;
    } else if (colorType < 0.9) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        starColors[i * 3 + 2] = 0.7 + Math.random() * 0.25;
    } else {
        starColors[i * 3] = 0.7 + Math.random() * 0.3;
        starColors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        starColors[i * 3 + 2] = 1.0;
    }
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Bintang jauh
const starCountFar = 3500;
const starGeoFar = new THREE.BufferGeometry();
const posFar = new Float32Array(starCountFar * 3);
for (let i = 0; i < starCountFar; i++) {
    const r = 90 + Math.random() * 100;
    const theta2 = Math.random() * Math.PI * 2;
    const phi2 = Math.acos(2 * Math.random() - 1);
    posFar[i * 3] = r * Math.sin(phi2) * Math.cos(theta2);
    posFar[i * 3 + 1] = r * Math.sin(phi2) * Math.sin(theta2) * 0.5;
    posFar[i * 3 + 2] = r * Math.cos(phi2) - 20;
}
starGeoFar.setAttribute('position', new THREE.BufferAttribute(posFar, 3));
const starMatFar = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.09, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
const starsFar = new THREE.Points(starGeoFar, starMatFar);
scene.add(starsFar);

// Bintang berkedip
const twinkleCount = 1800;
const twinkleGeo = new THREE.BufferGeometry();
const twinklePos = new Float32Array(twinkleCount * 3);
for (let i = 0; i < twinkleCount; i++) {
    twinklePos[i * 3] = (Math.random() - 0.5) * 180;
    twinklePos[i * 3 + 1] = (Math.random() - 0.5) * 70;
    twinklePos[i * 3 + 2] = (Math.random() - 0.5) * 100 - 40;
}
twinkleGeo.setAttribute('position', new THREE.BufferAttribute(twinklePos, 3));
const twinkleMat = new THREE.PointsMaterial({ color: 0xffdd99, size: 0.12, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
const twinkleStars = new THREE.Points(twinkleGeo, twinkleMat);
scene.add(twinkleStars);

// Nebula
const nebulaCount = 1200;
const nebulaGeo = new THREE.BufferGeometry();
const nebulaPos = new Float32Array(nebulaCount * 3);
for (let i = 0; i < nebulaCount; i++) {
    nebulaPos[i * 3] = (Math.random() - 0.5) * 120;
    nebulaPos[i * 3 + 1] = (Math.random() - 0.5) * 40 + 5;
    nebulaPos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 30;
}
nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
const nebulaMat = new THREE.PointsMaterial({ color: 0x6688aa, size: 0.07, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
const nebulaCloud = new THREE.Points(nebulaGeo, nebulaMat);
scene.add(nebulaCloud);

let time = 0;
function animateStars() {
    requestAnimationFrame(animateStars);
    time += 0.003;

    stars.rotation.y += 0.0002;
    stars.rotation.x = Math.sin(time * 0.1) * 0.05;
    starsFar.rotation.y -= 0.00015;
    starsFar.rotation.x += 0.0001;
    twinkleStars.rotation.y += 0.00025;
    nebulaCloud.rotation.y += 0.00008;

    twinkleMat.opacity = 0.55 + Math.sin(time * 1.8) * 0.15;
    starMaterial.opacity = 0.75 + Math.sin(time * 0.7) * 0.1;

    renderer.render(scene, camera);
}
animateStars();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== FITUR TOGGLE TEMA ==========
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        scene.background.setHex(0x030b17);
        themeIcon.className = 'fas fa-sun';
        themeText.innerText = 'Mode Terang';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        scene.background.setHex(0xf4f7fc);
        themeIcon.className = 'fas fa-moon';
        themeText.innerText = 'Mode Gelap';
    }
});

// ========== KONFIGURASI BACKEND ==========
const API_BASE = 'http://localhost:8000';
let currentSurahId = 1;
let surahList = [];

// ========== LOAD DAFTAR SURAT DARI BACKEND ==========
async function loadSurahs() {
    const select = document.getElementById('surahSelect');
    select.innerHTML = '<option value="">Memuat...</option>';

    try {
        const response = await fetch(`${API_BASE}/surahs`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        surahList = data.surahs || [];

        select.innerHTML = '';
        surahList.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.name} (${surah.total_verses || '?'} ayat)`;
            select.appendChild(option);
        });

        if (surahList.length > 0) {
            currentSurahId = surahList[0].number;
            select.value = currentSurahId;
            loadAyat(currentSurahId);
        }
    } catch (error) {
        console.error('Gagal load surah:', error);
        select.innerHTML = '<option value="">Gagal memuat surat</option>';
        document.getElementById('surahTextDisplay').innerHTML = '<p class="loading">❌ Gagal terhubung ke backend. Pastikan server berjalan di port 8000</p>';
    }
}

// ========== LOAD AYAT DARI BACKEND ==========
async function loadAyat(surahNumber) {
    const container = document.getElementById('surahTextDisplay');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-pulse"></i> Memuat ayat...</div>';

    try {
        const response = await fetch(`${API_BASE}/ayat/${surahNumber}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const ayats = data.ayats || [];

        if (ayats.length === 0) {
            container.innerHTML = '<p>Tidak ada data ayat untuk surat ini.</p>';
            return;
        }

        container.innerHTML = '';
        ayats.forEach(ayat => {
            const ayatCard = document.createElement('div');
            ayatCard.className = 'ayat-item-card';
            ayatCard.innerHTML = `
                        <div class="ayat-header">
                            <span class="ayat-number">${ayat.nomor}</span>
                        </div>
                        <p class="arabic-text">${ayat.teks_arab}</p>
                        <p class="latin-text">${ayat.transliterasi || ''}</p>
                    `;
            container.appendChild(ayatCard);
        });
    } catch (error) {
        console.error('Gagal load ayat:', error);
        container.innerHTML = '<p class="loading">❌ Gagal memuat ayat. Pastikan endpoint /ayat/{surah_number} tersedia di backend.</p>';
    }
}

// ========== EVENT SURAT BERUBAH ==========
const surahSelect = document.getElementById('surahSelect');
surahSelect.addEventListener('change', (e) => {
    currentSurahId = parseInt(e.target.value);
    if (currentSurahId) {
        loadAyat(currentSurahId);
        document.getElementById('correctionResult').innerHTML = '<p><i class="fas fa-microphone"></i> Surat berubah, silakan rekam/upload bacaan untuk koreksi tajwid.</p>';
        document.getElementById('accuracyScore').innerHTML = '';
    }
});

// ========== REKAM DAN ANALISIS ==========
let mediaRecorderObj = null;
let audioChunks = [];
let isRecordingActive = false;
let recordedBlob = null;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('audioFileInput');
const audioPlayback = document.getElementById('audioPlayback');
const recordingStatusSpan = document.getElementById('recordingStatus');
const correctionResultDiv = document.getElementById('correctionResult');
const accuracyScoreDiv = document.getElementById('accuracyScore');

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderObj = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorderObj.ondataavailable = event => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorderObj.onstop = () => {
            recordedBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(recordedBlob);
            audioPlayback.src = audioUrl;
            audioPlayback.style.display = 'block';
            recordingStatusSpan.innerHTML = '✅ Rekaman selesai! Mengirim ke AI...';
            sendToBackend(recordedBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderObj.start();
        isRecordingActive = true;
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordingStatusSpan.innerHTML = '🔴 Sedang merekam... bacalah surat dengan tartil';
    } catch (err) {
        recordingStatusSpan.innerHTML = '❌ Izin mikrofon diperlukan untuk merekam';
        console.error(err);
    }
}

function stopRecording() {
    if (mediaRecorderObj && isRecordingActive && mediaRecorderObj.state !== 'inactive') {
        mediaRecorderObj.stop();
        isRecordingActive = false;
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

async function sendToBackend(audioBlob) {
    correctionResultDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-pulse"></i> AI sedang menganalisis bacaan...</div>';
    accuracyScoreDiv.innerHTML = '';

    const formData = new FormData();
    formData.append('surah', currentSurahId);
    formData.append('file', audioBlob, 'recording.wav');

    try {
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        displayResult(result);

    } catch (error) {
        console.error('Analisis gagal:', error);
        correctionResultDiv.innerHTML = `
                    <div class="correction-item">
                        <i class="fas fa-exclamation-triangle"></i> 
                        <strong>Gagal terhubung ke AI backend</strong>
                    </div>
                    <div class="correction-item">Pastikan server backend berjalan di ${API_BASE}</div>
                    <div class="correction-item">Error: ${error.message}</div>
                `;
        accuracyScoreDiv.innerHTML = '';
    }
}

function displayResult(result) {
    const accuracy = result.accuracy || 0;
    const correct = result.correct || 0;
    const wrong = result.wrong || 0;
    const tajwidResults = result.tajwid_results || [];

    let feedbackHtml = `
                <div class="correction-item">
                    <i class="fas fa-chart-line"></i> 
                    <strong>Skor Kualitas Bacaan:</strong> ${accuracy}%
                </div>
                <div class="correction-item">
                    <i class="fas fa-check-circle"></i> 
                    <strong>✅ Tajwid Benar:</strong> ${correct} | 
                    <strong>❌ Tajwid Salah:</strong> ${wrong}
                </div>
            `;

    if (tajwidResults.length > 0) {
        feedbackHtml += `<div class="correction-item"><strong><i class="fas fa-list"></i> Detail Koreksi:</strong></div>`;
        tajwidResults.forEach(r => {
            const statusIcon = r.status === 'correct' ? '✅' : (r.status === 'warning' ? '⚠️' : '❌');
            feedbackHtml += `
                        <div class="correction-item">
                            ${statusIcon} <strong>${r.rule}</strong>: ${r.message}
                            ${r.score ? `<br><span class="text-sm">Skor: ${r.score}</span>` : ''}
                        </div>
                    `;
        });
    } else {
        feedbackHtml += `<div class="correction-item"><i class="fas fa-info-circle"></i> Tidak ada aturan tajwid yang terdeteksi.</div>`;
    }

    if (accuracy > 85) {
        feedbackHtml += `<div class="correction-item">🌟✨ Bacaan sangat baik! Pertahankan kualitas tilawah Anda.</div>`;
    } else if (accuracy > 70) {
        feedbackHtml += `<div class="correction-item">📖 Bacaan cukup baik. Perhatikan hukum mad dan idgham.</div>`;
    } else {
        feedbackHtml += `<div class="correction-item">💪 Tetap semangat! Coba ulangi pelan-pelan, fokus pada makhraj huruf.</div>`;
    }

    correctionResultDiv.innerHTML = feedbackHtml;
    accuracyScoreDiv.innerHTML = `✨ Akurasi Tajwid: ${accuracy}% ✨`;
    recordingStatusSpan.innerHTML = '✅ Analisis selesai';
}

// Event listeners
recordBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        recordedBlob = file;
        const audioUrl = URL.createObjectURL(file);
        audioPlayback.src = audioUrl;
        audioPlayback.style.display = 'block';
        recordingStatusSpan.innerHTML = '📁 File audio diupload! Mengirim ke AI...';
        sendToBackend(file);
    }
});

// Inisialisasi
loadSurahs();

console.log("✨ NurAI siap | Terintegrasi dengan backend FastAPI | Ribuan Bintang Menemani ✨");
