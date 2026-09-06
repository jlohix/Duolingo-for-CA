/* ============================================
   Question Bank Manager 2 — Application Logic
   With Multi-Photo Solution Auto-Extractor, Interactive Step Refinement & KaTeX Support
   ============================================ */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jlohix/Duoling-for-CA/main/PYP-qn-images/';

// State
let questions = [];
let pendingImages = []; // { name, dataUrl, file }
let localImageStore = {}; // imageName -> dataUrl
let geminiApiKey = '';
let solutionImageFiles = []; // Array of { base64, mime, fileName, dataUrl }
let extractedBatchQuestions = [];

// DOM Elements
const form = document.getElementById('question-form');
const editIndexInput = document.getElementById('edit-index');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnSubmitText = document.getElementById('btn-submit-text');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const btnClearForm = document.getElementById('btn-clear-form');
const btnDownloadCSV = document.getElementById('btn-download-csv');
const btnImportCSV = document.getElementById('btn-import-csv');
const csvImportInput = document.getElementById('csv-import-input');
const searchInput = document.getElementById('search-input');
const filterTopic = document.getElementById('filter-topic');
const emptyState = document.getElementById('empty-state');
const questionsTable = document.getElementById('questions-table');
const questionsTbody = document.getElementById('questions-tbody');
const toastContainer = document.getElementById('toast-container');

// API Key Elements
const btnApiKey = document.getElementById('btn-api-key');
const apiKeyStatusText = document.getElementById('api-key-status-text');
const modalApiKey = document.getElementById('modal-api-key');
const inputApiKey = document.getElementById('input-api-key');
const btnCloseApiModal = document.getElementById('btn-close-api-modal');
const btnSaveApiKey = document.getElementById('btn-save-api-key');
const btnRemoveApiKey = document.getElementById('btn-remove-api-key');

// AI Generator & 3-Phase Elements
const presetThevenin = document.getElementById('preset-thevenin');
const presetNodal = document.getElementById('preset-nodal');
const presetOpamp = document.getElementById('preset-opamp');

const btnProposeSteps = document.getElementById('btn-propose-steps');
const btnExtractSolutionPhotos = document.getElementById('btn-extract-solution-photos');
const inputRefinePrompt = document.getElementById('input-refine-prompt');
const btnRefineSteps = document.getElementById('btn-refine-steps');

const aiProblemContext = document.getElementById('ai-problem-context');
const aiStepsPrompt = document.getElementById('ai-steps-prompt');
const aiWalkthroughSelect = document.getElementById('ai-walkthrough-select');
const aiRandomizeOptions = document.getElementById('ai-randomize-options');
const btnRunMultipartAi = document.getElementById('btn-run-multipart-ai');

// Multi-Photo Vision Elements
const aiDropzone = document.getElementById('ai-dropzone');
const aiImageInput = document.getElementById('ai-image-input');
const aiUploadPlaceholder = document.getElementById('ai-upload-placeholder');
const aiPreviewBox = document.getElementById('ai-preview-box');
const multiImageGrid = document.getElementById('multi-image-grid');
const aiFileName = document.getElementById('ai-file-name');
const btnClearAiImage = document.getElementById('btn-clear-ai-image');

// Batch Modal Elements
const modalBatchAi = document.getElementById('modal-batch-ai');
const btnCloseBatchModal = document.getElementById('btn-close-batch-modal');
const btnCancelBatch = document.getElementById('btn-cancel-batch');
const btnImportAllBatch = document.getElementById('btn-import-all-batch');
const batchList = document.getElementById('batch-list');
const batchCount = document.getElementById('batch-count');

// Image Form Elements
const imageUploadArea = document.getElementById('image-upload-area');
const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const btnRemoveImage = document.getElementById('btn-remove-image');
const imageNameInput = document.getElementById('q-image-name');
const githubUrlPreview = document.getElementById('github-url-preview');
const githubUrlText = document.getElementById('github-url-text');
const btnCopyUrl = document.getElementById('btn-copy-url');

// KaTeX Explanation Elements
const qExplanation = document.getElementById('q-explanation');
const katexPreviewContent = document.getElementById('katex-preview-content');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statWithImages = document.getElementById('stat-with-images');
const statTopics = document.getElementById('stat-topics');
const statDifficulty = document.getElementById('stat-difficulty');

// Download Modal
const imageDownloadModal = document.getElementById('image-download-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const modalOverlay = document.getElementById('modal-overlay');
const btnDownloadImages = document.getElementById('btn-download-images');
const pendingImagesList = document.getElementById('pending-images-list');

// CSV Export Modal Elements
const modalCsvExport = document.getElementById('modal-csv-export');
const btnCloseCsvExportModal = document.getElementById('btn-close-csv-export-modal');
const csvExportTextarea = document.getElementById('csv-export-textarea');
const btnCopyCsvText = document.getElementById('btn-copy-csv-text');
const btnForceDownloadCsv = document.getElementById('btn-force-download-csv');

// Current image upload state
let currentImageData = null;
let currentImageFile = null;

// ============================================
// Initialization
// ============================================

function init() {
  loadFromStorage();
  updateApiKeyStatusUI();
  renderTable();
  updateStats();
  autoFillId();
  bindEvents();
}

function bindEvents() {
  form.addEventListener('submit', handleFormSubmit);
  btnClearForm.addEventListener('click', resetForm);
  btnCancelEdit.addEventListener('click', cancelEdit);
  btnDownloadCSV.addEventListener('click', downloadCSV);
  btnImportCSV.addEventListener('click', () => csvImportInput.click());
  csvImportInput.addEventListener('change', handleCSVImport);
  searchInput.addEventListener('input', renderTable);
  filterTopic.addEventListener('change', renderTable);

  const btnClearAllQs = document.getElementById('btn-clear-all-qs');
  if (btnClearAllQs) btnClearAllQs.addEventListener('click', clearAllQuestions);

  const btnDeleteSelected = document.getElementById('btn-delete-selected');
  if (btnDeleteSelected) btnDeleteSelected.addEventListener('click', deleteSelectedQuestions);

  const selectAllQsCheckbox = document.getElementById('select-all-qs');
  if (selectAllQsCheckbox) {
    selectAllQsCheckbox.addEventListener('change', (e) => toggleSelectAllQuestions(e.target.checked));
  }

  // CSV Export Modal
  btnCloseCsvExportModal.addEventListener('click', () => modalCsvExport.style.display = 'none');
  modalCsvExport.addEventListener('click', (e) => {
    if (e.target === modalCsvExport) modalCsvExport.style.display = 'none';
  });
  btnCopyCsvText.addEventListener('click', copyCsvTextToClipboard);
  btnForceDownloadCsv.addEventListener('click', triggerDataUriDownload);
  
  const csvFilenameInput = document.getElementById('csv-filename-input');
  if (csvFilenameInput) {
    csvFilenameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerDataUriDownload();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalCsvExport.style.display = 'none';
      modalApiKey.style.display = 'none';
      modalBatchAi.style.display = 'none';
      if (imageDownloadModal) imageDownloadModal.style.display = 'none';
    }
  });


  // API Key & Settings Modal
  btnApiKey.addEventListener('click', () => {
    inputApiKey.value = geminiApiKey || '';
    const githubInput = document.getElementById('input-github-base-url');
    if (githubInput) githubInput.value = getGithubBaseUrl();
    modalApiKey.style.display = 'flex';
  });
  btnCloseApiModal.addEventListener('click', () => modalApiKey.style.display = 'none');
  btnSaveApiKey.addEventListener('click', saveApiKey);
  btnRemoveApiKey.addEventListener('click', removeApiKey);

  // Presets
  presetThevenin.addEventListener('click', loadPresetThevenin);
  presetNodal.addEventListener('click', loadPresetNodal);
  presetOpamp.addEventListener('click', loadPresetOpamp);

  // 3-Phase Action Buttons
  btnProposeSteps.addEventListener('click', proposeStepsFromImage);
  btnExtractSolutionPhotos.addEventListener('click', extractFromSolutionPhotos);
  btnRefineSteps.addEventListener('click', refineStepsWithAi);
  btnRunMultipartAi.addEventListener('click', runGeminiMultiStepGeneration);

  // AI Vision Dropzone & Multi-Photo Selection
  aiDropzone.addEventListener('click', (e) => {
    if (!e.target.classList.contains('multi-thumb-remove') && e.target !== btnClearAiImage) {
      aiImageInput.click();
    }
  });
  aiImageInput.addEventListener('change', handleAiImageSelect);
  btnClearAiImage.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllSolutionPhotos();
  });

  // AI Drag & Drop
  aiDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    aiDropzone.classList.add('drag-over');
  });
  aiDropzone.addEventListener('dragleave', () => aiDropzone.classList.remove('drag-over'));
  aiDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    aiDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      processAiImageFiles(Array.from(e.dataTransfer.files));
    }
  });

  // Batch Modal
  btnCloseBatchModal.addEventListener('click', () => modalBatchAi.style.display = 'none');
  btnCancelBatch.addEventListener('click', () => modalBatchAi.style.display = 'none');
  btnImportAllBatch.addEventListener('click', importAllBatchQuestions);

  // Live KaTeX Field Previews
  qExplanation.addEventListener('input', renderKaTeXExplanationPreview);

  const qQuestionInput = document.getElementById('q-question');
  if (qQuestionInput) qQuestionInput.addEventListener('input', renderKaTeXQuestionPreview);

  ['q-optionA', 'q-optionB', 'q-optionC', 'q-optionD'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderKaTeXOptionsPreview);
  });

  // Image Upload Form
  imageUploadArea.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', handleImageSelect);
  btnRemoveImage.addEventListener('click', (e) => { e.stopPropagation(); removeImage(); });
  imageNameInput.addEventListener('input', updateGithubUrlPreview);
  btnCopyUrl.addEventListener('click', copyGithubUrl);

  // Download Modal
  btnCloseModal.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  btnDownloadImages.addEventListener('click', downloadAllImages);
}

// ============================================
// Multi-Photo Gallery Handlers
// ============================================

function handleAiImageSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    processAiImageFiles(Array.from(e.target.files));
  }
}

function processAiImageFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    showToast('error', 'Please select image files');
    return;
  }

  let loadedCount = 0;
  imageFiles.forEach(file => {
    if (file.size > 15 * 1024 * 1024) {
      showToast('error', `Skipped ${file.name} (over 15MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;
      compressImageForAi(rawDataUrl, 1200, 0.85, (compressedDataUrl, mime, base64) => {
        solutionImageFiles.push({
          base64,
          mime,
          fileName: file.name.replace(/[^a-zA-Z0-9_\.]/g, '_'),
          dataUrl: compressedDataUrl
        });

        loadedCount++;
        if (loadedCount === imageFiles.length) {
          renderMultiImageGallery();
          showToast('success', `Loaded ${solutionImageFiles.length} solution photo(s)!`);
        }
      });
    };
    reader.readAsDataURL(file);
  });
}

function renderMultiImageGallery() {
  const aiImageNameInput = document.getElementById('ai-image-name-input');
  if (solutionImageFiles.length === 0) {
    aiUploadPlaceholder.style.display = 'flex';
    aiPreviewBox.style.display = 'none';
    multiImageGrid.innerHTML = '';
    aiFileName.textContent = '0 photos loaded';
    return;
  }

  aiUploadPlaceholder.style.display = 'none';
  aiPreviewBox.style.display = 'block';
  multiImageGrid.innerHTML = '';

  if (aiImageNameInput && !aiImageNameInput.value.trim() && solutionImageFiles[0]) {
    aiImageNameInput.value = solutionImageFiles[0].fileName;
  }

  solutionImageFiles.forEach((imgObj, idx) => {
    const card = document.createElement('div');
    card.className = 'multi-thumb-card';
    card.innerHTML = `
      <img src="${imgObj.dataUrl}" alt="Solution Photo ${idx + 1}">
      <button type="button" class="multi-thumb-remove" title="Remove photo" onclick="removeSolutionPhoto(${idx})">&times;</button>
      <input type="text" class="multi-thumb-input" value="${escapeHtml(imgObj.fileName)}" onchange="updateSolutionPhotoName(${idx}, this.value)" title="Edit image filename for GitHub" style="width:100%; font-size:0.7rem; font-family:var(--font-mono); padding:2px 4px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.6); color:var(--text-primary); margin-top:4px;">
    `;
    multiImageGrid.appendChild(card);
  });

  aiFileName.textContent = `${solutionImageFiles.length} solution photo(s) ready`;
}

window.updateSolutionPhotoName = function(index, newName) {
  const cleanName = newName.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  if (index >= 0 && index < solutionImageFiles.length && cleanName) {
    solutionImageFiles[index].fileName = cleanName;
    if (index === 0) {
      const aiImageNameInput = document.getElementById('ai-image-name-input');
      if (aiImageNameInput) aiImageNameInput.value = cleanName;
    }
    showToast('success', `GitHub image filename updated: ${cleanName}`);
  }
};

window.removeSolutionPhoto = function(index) {
  if (index >= 0 && index < solutionImageFiles.length) {
    solutionImageFiles.splice(index, 1);
    renderMultiImageGallery();
    showToast('success', 'Photo removed');
  }
};

function clearAllSolutionPhotos() {
  solutionImageFiles = [];
  aiImageInput.value = '';
  renderMultiImageGallery();
  showToast('success', 'Cleared all photos');
}

function compressImageForAi(dataUrl, maxDimension, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const mime = 'image/jpeg';
    const compressedDataUrl = canvas.toDataURL(mime, quality);
    const base64 = compressedDataUrl.split(',')[1];
    callback(compressedDataUrl, mime, base64);
  };
  img.src = dataUrl;
}

// ============================================
// Presets
// ============================================

function loadPresetThevenin() {
  aiProblemContext.value = 'A linear circuit has a 12V independent DC voltage source in series with a 4Ω resistor, connected in parallel with a 6Ω resistor and a 2A current source across open-circuit terminals a-b.';
  aiStepsPrompt.value = `How do you start building the circuit for finding Rth?\nFind Rth\nConstruct Mesh analysis\nFind Vth`;
  aiWalkthroughSelect.value = 'walk-lab-thevenin';
  document.getElementById('q-topicid').value = '2';
  showToast('success', 'Loaded Thevenin step preset!');
}

function loadPresetNodal() {
  aiProblemContext.value = 'A DC circuit contains three essential nodes connected by resistors R1=2Ω, R2=4Ω, R3=8Ω with a 10V independent voltage source and a 3A current source.';
  aiStepsPrompt.value = `Identify essential nodes and select ground reference\nFormulate KCL equations for node voltages V1 and V2\nSolve matrix equations for node voltages\nFind current flowing through resistor R3`;
  aiWalkthroughSelect.value = 'walk-lab-nodal';
  document.getElementById('q-topicid').value = '1';
  showToast('success', 'Loaded Nodal analysis step preset!');
}

function loadPresetOpamp() {
  aiProblemContext.value = 'An inverting operational amplifier circuit has an input resistor Rin = 10kΩ, a feedback resistor Rf = 50kΩ, and an input voltage Vin = 2V with saturation limits ±15V.';
  aiStepsPrompt.value = `State ideal op-amp virtual short assumptions (V+ = V-, I+ = I- = 0)\nApply KCL at the inverting input node\nFind the closed-loop voltage gain Vo/Vin and calculate output voltage Vo`;
  aiWalkthroughSelect.value = 'inverting';
  document.getElementById('q-topicid').value = '2';
  showToast('success', 'Loaded Op-Amp step preset!');
}

// ============================================
// Storage & API Key
// ============================================

let selectedGeminiModel = 'auto';
let availableGeminiModels = [];

const selectGeminiModel = document.getElementById('select-gemini-model');

function saveToStorage() {
  try {
    localStorage.setItem('qb2_questions', JSON.stringify(questions));
    localStorage.setItem('qb2_local_images', JSON.stringify(localImageStore));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem('qb2_questions');
    if (stored) questions = JSON.parse(stored);

    const storedImages = localStorage.getItem('qb2_local_images');
    if (storedImages) localImageStore = JSON.parse(storedImages);

    const key = localStorage.getItem('qb_gemini_key');
    if (key) geminiApiKey = key;

    const savedModel = localStorage.getItem('qb_gemini_model');
    if (savedModel) selectedGeminiModel = savedModel;
  } catch (e) {
    console.warn('Storage load failed:', e);
  }
}

async function fetchAvailableGeminiModels(apiKey) {
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.models) return [];

    const validModels = data.models
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    availableGeminiModels = validModels;

    selectGeminiModel.innerHTML = '<option value="auto">✨ Auto-Detect Best Available Model</option>';
    validModels.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      if (m === selectedGeminiModel) opt.selected = true;
      selectGeminiModel.appendChild(opt);
    });

    return validModels;
  } catch (e) {
    console.warn('Failed to fetch Gemini models list:', e);
    return [];
  }
}

function getGithubBaseUrl() {
  let url = localStorage.getItem('qb_github_base_url') || GITHUB_RAW_BASE;
  if (url && !url.endsWith('/')) url += '/';
  return url;
}

function resolveImageUrl(inputStr) {
  if (!inputStr) return '';
  const trimmed = inputStr.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return getGithubBaseUrl() + trimmed;
}

async function saveApiKey() {
  const key = inputApiKey.value.trim();
  const githubInput = document.getElementById('input-github-base-url');
  
  if (githubInput && githubInput.value.trim()) {
    let customBase = githubInput.value.trim();
    if (!customBase.endsWith('/')) customBase += '/';
    localStorage.setItem('qb_github_base_url', customBase);
  }

  if (key) {
    geminiApiKey = key;
    localStorage.setItem('qb_gemini_key', geminiApiKey);
  }
  
  selectedGeminiModel = selectGeminiModel.value;
  localStorage.setItem('qb_gemini_model', selectedGeminiModel);

  updateApiKeyStatusUI();
  
  if (geminiApiKey) {
    const models = await fetchAvailableGeminiModels(geminiApiKey);
    if (models.length > 0) {
      showToast('success', `Settings saved! Found ${models.length} active models.`);
    } else {
      showToast('success', 'Settings saved!');
    }
  } else {
    showToast('success', 'Settings saved!');
  }
  
  modalApiKey.style.display = 'none';
}

function removeApiKey() {
  geminiApiKey = '';
  localStorage.removeItem('qb_gemini_key');
  localStorage.removeItem('qb_gemini_model');
  inputApiKey.value = '';
  updateApiKeyStatusUI();
  modalApiKey.style.display = 'none';
  showToast('success', 'Gemini API Key removed');
}

function updateApiKeyStatusUI() {
  if (geminiApiKey) {
    apiKeyStatusText.textContent = 'API Key Saved ✓';
    btnApiKey.style.borderColor = 'var(--accent-success)';
  } else {
    apiKeyStatusText.textContent = 'Set API Key';
    btnApiKey.style.borderColor = 'var(--border-glass)';
  }
}

// ============================================
// Option Randomization Algorithm
// ============================================

function shuffleAndRandomizeOptions(q) {
  const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'];
  const originalAnswerKey = q.answer || 'optionA';
  const correctAnswerText = q[originalAnswerKey] || q.optionA;

  const optionsList = [
    { text: q.optionA || '' },
    { text: q.optionB || '' },
    { text: q.optionC || '' },
    { text: q.optionD || '' }
  ];

  // Fisher-Yates Shuffle
  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
  }

  q.optionA = optionsList[0].text;
  q.optionB = optionsList[1].text;
  q.optionC = optionsList[2].text;
  q.optionD = optionsList[3].text;

  const newCorrectIndex = optionsList.findIndex(o => o.text === correctAnswerText);
  if (newCorrectIndex >= 0) {
    q.answer = optionKeys[newCorrectIndex];
  } else {
    q.answer = 'optionA';
  }

  return q;
}

// ============================================
// PHASE 1: AI Propose Steps from Image / Context
// ============================================

async function proposeStepsFromImage() {
  if (!geminiApiKey) {
    showToast('error', 'Please click "Set API Key" in header first!');
    modalApiKey.style.display = 'flex';
    return;
  }

  btnProposeSteps.disabled = true;
  btnProposeSteps.innerHTML = `
    <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
    Analyzing Circuit...
  `;

  try {
    const contextText = aiProblemContext.value.trim();

    const systemPrompt = `
You are an expert Circuit Analysis professor.
Inspect the provided circuit image(s) or problem description:
Context: "${contextText || 'Circuit Analysis Diagram'}"

Task: Propose a logical 3-to-5 step sequence of learning questions to guide a student step-by-step through solving this problem.
Example step questions for a Thevenin problem:
How do you start building the circuit for finding Rth?
Find Rth
Construct Mesh analysis
Find Vth

Return ONLY the proposed step questions as plain text, ONE question per line. Do NOT include numbers, bullet points, or markdown formatting.
    `;

    const parts = [{ text: systemPrompt }];
    solutionImageFiles.forEach(img => {
      parts.push({
        inline_data: { mime_type: img.mime, data: img.base64 }
      });
    });

    const requestBody = { contents: [{ parts }] };

    const response = await callGeminiApi(requestBody);
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleanSteps = responseText
      .split('\n')
      .map(s => s.replace(/^[\d\.\*\-\s]+/, '').trim())
      .filter(Boolean)
      .join('\n');

    if (!cleanSteps) throw new Error('AI did not return step proposals');

    aiStepsPrompt.value = cleanSteps;
    showToast('success', 'AI proposed steps! Review or refine below.');

  } catch (err) {
    console.error(err);
    showToast('error', 'Step proposal error: ' + err.message);
  } finally {
    btnProposeSteps.disabled = false;
    btnProposeSteps.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      Propose Steps First
    `;
  }
}

// ============================================
// Multi-Photo Solution Exact Extract
// ============================================

async function extractFromSolutionPhotos() {
  if (!geminiApiKey) {
    showToast('error', 'Please click "Set API Key" in header first!');
    modalApiKey.style.display = 'flex';
    return;
  }

  if (solutionImageFiles.length === 0) {
    showToast('error', 'Please upload at least 1 solution photo first!');
    return;
  }

  btnExtractSolutionPhotos.disabled = true;
  btnExtractSolutionPhotos.innerHTML = `
    <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
    Extracting Steps & Solutions...
  `;

  try {
    const contextText = aiProblemContext.value.trim();
    const walkthroughTag = aiWalkthroughSelect.value;
    const randomizeChecked = aiRandomizeOptions.checked;

    const systemPrompt = `
You are an expert Circuit Analysis professor.
Inspect the provided solution photos containing a complete multi-step problem solution.

Task:
1. Analyze all uploaded solution photos from start to finish.
2. Automatically split the circuit problem into logical step-by-step sub-questions (e.g. Step 1: circuit setup for Rth, Step 2: Rth calculation, Step 3: Mesh/Nodal analysis, Step 4: Vth calculation).
3. For EACH step:
   - Create a clear Multiple Choice Question (MCQ).
   - Extract the EXACT correct numerical answer, formulas, and equations directly from the user's solution photos for that step.
   - Generate 3 realistic distractor options (wrong choices).
   - Provide the step-by-step LaTeX math explanation derived directly from the uploaded solution photos.

Return ONLY a valid raw JSON array of objects:
[
  {
    "stepNumber": 1,
    "stepTitle": "Step 1 Title",
    "question": "Question text with $LaTeX$",
    "optionA": "Correct option extracted from solution photo with $LaTeX$",
    "optionB": "Distractor option B",
    "optionC": "Distractor option C",
    "optionD": "Distractor option D",
    "answer": "optionA",
    "explanation": "Step-by-step solution extracted from photos with $LaTeX$",
    "difficulty": 1
  }
]
    `;

    const parts = [{ text: systemPrompt }];
    solutionImageFiles.forEach(img => {
      parts.push({
        inline_data: { mime_type: img.mime, data: img.base64 }
      });
    });

    const requestBody = {
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const data = await callGeminiApi(requestBody);

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedSteps = JSON.parse(cleanJson);

    if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
      throw new Error('AI did not return valid step questions from photos');
    }

    const currentTopic = document.getElementById('q-topicid').value.trim() || '2';
    const selectedDifficulty = document.getElementById('ai-difficulty-select') 
      ? document.getElementById('ai-difficulty-select').value 
      : (document.getElementById('q-difficulty').value || '2');
    const baseIdNum = getNextBaseId();

    const aiImageNameInput = document.getElementById('ai-image-name-input');
    const customImageName = aiImageNameInput ? aiImageNameInput.value.trim() : '';
    const targetImageFileName = customImageName || (solutionImageFiles.length > 0 ? solutionImageFiles[0].fileName : '');
    const generatedImageUrl = targetImageFileName ? GITHUB_RAW_BASE + targetImageFileName : '';

    if (targetImageFileName && solutionImageFiles.length > 0) {
      localImageStore[targetImageFileName] = solutionImageFiles[0].dataUrl;
      const existing = pendingImages.findIndex(img => img.name === targetImageFileName);
      if (existing >= 0) {
        pendingImages[existing] = { name: targetImageFileName, dataUrl: solutionImageFiles[0].dataUrl, file: solutionImageFiles[0] };
      } else {
        pendingImages.push({ name: targetImageFileName, dataUrl: solutionImageFiles[0].dataUrl, file: solutionImageFiles[0] });
      }
    }

    const stepsTextList = [];

    const formattedQuestions = parsedSteps.map((q, idx) => {
      stepsTextList.push(q.question);

      let item = {
        id: `${baseIdNum}-${idx + 1}`,
        topicid: currentTopic,
        question: q.question || '',
        optionA: q.optionA || '',
        optionB: q.optionB || '',
        optionC: q.optionC || '',
        optionD: q.optionD || '',
        answer: q.answer || 'optionA',
        image: generatedImageUrl,
        explanation: q.explanation || '',
        difficulty: String(selectedDifficulty),
        walkthrough_tag: walkthroughTag
      };

      if (randomizeChecked) {
        item = shuffleAndRandomizeOptions(item);
      }

      return item;
    });

    aiStepsPrompt.value = stepsTextList.join('\n');
    showToast('success', `Extracted ${formattedQuestions.length} step questions & exact answers from photos!`);
    openBatchModal(formattedQuestions);

  } catch (err) {
    console.error(err);
    showToast('error', 'Solution extraction error: ' + err.message);
  } finally {
    btnExtractSolutionPhotos.disabled = false;
    btnExtractSolutionPhotos.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      Auto-Extract from Photos
    `;
  }
}

// ============================================
// PHASE 2: AI Refine Proposed Steps
// ============================================

async function refineStepsWithAi() {
  if (!geminiApiKey) {
    showToast('error', 'Please set your Gemini API Key first!');
    modalApiKey.style.display = 'flex';
    return;
  }

  const currentSteps = aiStepsPrompt.value.trim();
  const refineFeedback = inputRefinePrompt.value.trim();

  if (!currentSteps) {
    showToast('error', 'No current steps to refine! Propose steps or pick a preset first.');
    return;
  }

  if (!refineFeedback) {
    showToast('error', 'Please type how you want to refine the steps (e.g. "Change step 3 to Nodal Analysis")');
    return;
  }

  btnRefineSteps.disabled = true;
  btnRefineSteps.innerHTML = `<span>Refining...</span>`;

  try {
    const systemPrompt = `
You are an expert Circuit Analysis professor.
Here is the current step-by-step question list:
${currentSteps}

The user requested the following change:
"${refineFeedback}"

Task: Update the step-by-step question list to incorporate the user's requested changes.
Return ONLY the updated list of step questions as plain text, ONE question per line. Do NOT include numbers, bullets, or markdown tags.
    `;

    const requestBody = { contents: [{ parts: [{ text: systemPrompt }] }] };

    const response = await callGeminiApi(requestBody);
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const updatedSteps = responseText
      .split('\n')
      .map(s => s.replace(/^[\d\.\*\-\s]+/, '').trim())
      .filter(Boolean)
      .join('\n');

    if (!updatedSteps) throw new Error('AI refinement failed');

    aiStepsPrompt.value = updatedSteps;
    inputRefinePrompt.value = '';
    showToast('success', 'Steps refined with AI!');

  } catch (err) {
    console.error(err);
    showToast('error', 'Refinement error: ' + err.message);
  } finally {
    btnRefineSteps.disabled = false;
    btnRefineSteps.innerHTML = `<span>🪄 Refine with AI</span>`;
  }
}

// ============================================
// PHASE 3: Confirm Steps & Generate Full MCQs
// ============================================

async function runGeminiMultiStepGeneration() {
  if (!geminiApiKey) {
    showToast('error', 'Please click "Set API Key" in header first!');
    modalApiKey.style.display = 'flex';
    return;
  }

  const contextText = aiProblemContext.value.trim();
  const rawSteps = aiStepsPrompt.value.trim();

  if (!rawSteps) {
    showToast('error', 'Please enter or propose step questions first!');
    return;
  }

  const stepsList = rawSteps.split('\n').map(s => s.trim()).filter(Boolean);
  if (stepsList.length === 0) {
    showToast('error', 'Please enter at least 1 step prompt');
    return;
  }

  const walkthroughTag = aiWalkthroughSelect.value;
  const randomizeChecked = aiRandomizeOptions.checked;

  btnRunMultipartAi.disabled = true;
  btnRunMultipartAi.innerHTML = `
    <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
    Generating ${stepsList.length} Step Questions with Gemini AI...
  `;

  try {
    const stepsFormatted = stepsList.map((step, idx) => `Step ${idx + 1}: "${step}"`).join('\n');

    const systemPrompt = `
You are an expert Circuit Analysis professor creating a multi-part sequential quiz set.

Circuit Problem Context:
"${contextText || 'Standard Circuit Analysis Problem'}"

Confirmed Step Prompts to Generate:
${stepsFormatted}

Your task:
For EACH of the ${stepsList.length} steps listed above, create a clear, high-quality Multiple Choice Question (MCQ) with 4 options (A, B, C, D) and a step-by-step LaTeX solution. If solution photos are provided, extract exact answers from the photos!

Return ONLY a valid raw JSON array of objects. Format:
[
  {
    "stepNumber": 1,
    "stepTitle": "Short title of step 1",
    "question": "Question text for step 1... (use single dollar $...$ for LaTeX math)",
    "optionA": "Choice A with $LaTeX$",
    "optionB": "Choice B with $LaTeX$",
    "optionC": "Choice C with $LaTeX$",
    "optionD": "Choice D with $LaTeX$",
    "answer": "optionA",
    "explanation": "Step-by-step explanation with $LaTeX$ math equations...",
    "difficulty": 1
  }
]
    `;

    const parts = [{ text: systemPrompt }];
    solutionImageFiles.forEach(img => {
      parts.push({
        inline_data: { mime_type: img.mime, data: img.base64 }
      });
    });

    const requestBody = {
      contents: [{ parts }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const data = await callGeminiApi(requestBody);

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedSteps = JSON.parse(cleanJson);

    if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
      throw new Error('AI did not return valid step questions');
    }

    const currentTopic = document.getElementById('q-topicid').value.trim() || '2';
    const selectedDifficulty = document.getElementById('ai-difficulty-select') 
      ? document.getElementById('ai-difficulty-select').value 
      : (document.getElementById('q-difficulty').value || '2');
    const baseIdNum = getNextBaseId();

    const aiImageNameInput = document.getElementById('ai-image-name-input');
    const customImageName = aiImageNameInput ? aiImageNameInput.value.trim() : '';
    const targetImageFileName = customImageName || (solutionImageFiles.length > 0 ? solutionImageFiles[0].fileName : '');
    const generatedImageUrl = targetImageFileName ? GITHUB_RAW_BASE + targetImageFileName : '';

    if (targetImageFileName && solutionImageFiles.length > 0) {
      localImageStore[targetImageFileName] = solutionImageFiles[0].dataUrl;
      const existing = pendingImages.findIndex(img => img.name === targetImageFileName);
      if (existing >= 0) {
        pendingImages[existing] = { name: targetImageFileName, dataUrl: solutionImageFiles[0].dataUrl, file: solutionImageFiles[0] };
      } else {
        pendingImages.push({ name: targetImageFileName, dataUrl: solutionImageFiles[0].dataUrl, file: solutionImageFiles[0] });
      }
    }

    const formattedQuestions = parsedSteps.map((q, idx) => {
      let item = {
        id: `${baseIdNum}-${idx + 1}`,
        topicid: currentTopic,
        question: q.question || '',
        optionA: q.optionA || '',
        optionB: q.optionB || '',
        optionC: q.optionC || '',
        optionD: q.optionD || '',
        answer: q.answer || 'optionA',
        image: generatedImageUrl,
        explanation: q.explanation || '',
        difficulty: String(selectedDifficulty),
        walkthrough_tag: walkthroughTag
      };

      if (randomizeChecked) {
        item = shuffleAndRandomizeOptions(item);
      }

      return item;
    });

    showToast('success', `Generated ${formattedQuestions.length} multi-part step questions!`);
    openBatchModal(formattedQuestions);

  } catch (err) {
    console.error(err);
    showToast('error', 'AI Generation error: ' + err.message);
  } finally {
    btnRunMultipartAi.disabled = false;
    btnRunMultipartAi.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      Confirm Steps & Generate Full MCQ Questions
    `;
  }
}

async function callGeminiApi(requestBody) {
  if (localStorage.getItem('qb_fast_working_model') === 'gemini-2.0-flash-exp') {
    localStorage.removeItem('qb_fast_working_model');
  }

  if (availableGeminiModels.length === 0 && geminiApiKey) {
    await fetchAvailableGeminiModels(geminiApiKey);
  }

  let modelsToTry = availableGeminiModels.length > 0 
    ? [...availableGeminiModels] 
    : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  modelsToTry = modelsToTry.filter(m => m !== 'gemini-2.0-flash-exp');

  const cachedWorkingModel = localStorage.getItem('qb_fast_working_model');
  if (cachedWorkingModel && cachedWorkingModel !== 'gemini-2.0-flash-exp' && modelsToTry.includes(cachedWorkingModel)) {
    modelsToTry = [cachedWorkingModel, ...modelsToTry.filter(m => m !== cachedWorkingModel)];
  }

  let data = null;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Connecting to Gemini API (${modelName})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const resData = await response.json();
      if (response.ok) {
        data = resData;
        localStorage.setItem('qb_fast_working_model', modelName);
        break;
      } else {
        lastError = resData.error?.message || `HTTP ${response.status}`;
        console.warn(`Model ${modelName} returned error:`, lastError);
        if (cachedWorkingModel === modelName) {
          localStorage.removeItem('qb_fast_working_model');
        }
      }
    } catch (err) {
      lastError = err.name === 'AbortError' ? 'Request timed out after 15s' : err.message;
      console.warn(`Model ${modelName} failed:`, lastError);
    }
  }

  if (!data) throw new Error(`${lastError}`);
  return data;
}

function getNextBaseId() {
  if (questions.length === 0) return 201;
  const numIds = questions.map(q => {
    const mainPart = String(q.id).split('-')[0];
    return parseInt(mainPart) || 0;
  });
  const maxId = Math.max(...numIds, 200);
  return maxId + 1;
}

// ============================================
// Multi-Part Batch Modal
// ============================================

function openBatchModal(qs) {
  extractedBatchQuestions = qs;
  batchCount.textContent = qs.length;
  batchList.innerHTML = '';

  qs.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'batch-card';

    const answerLetter = (q.answer || 'optionA').replace('option', '');
    const walkthroughChip = q.walkthrough_tag ? `<span class="walkthrough-tag-badge">${escapeHtml(q.walkthrough_tag)}</span>` : '';

    card.innerHTML = `
      <div class="batch-card-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="batch-card-title">Step / Part ${idx + 1} (ID: ${q.id || idx+1})</span>
          ${walkthroughChip}
        </div>
        <span class="answer-chip answer-${answerLetter}">Ans: ${answerLetter}</span>
      </div>
      <div style="font-size:0.88rem; font-weight:600; margin-bottom:6px;">${escapeHtml(q.question)}</div>
      <div class="batch-options-grid">
        <div><strong>A:</strong> ${escapeHtml(q.optionA)}</div>
        <div><strong>B:</strong> ${escapeHtml(q.optionB)}</div>
        <div><strong>C:</strong> ${escapeHtml(q.optionC)}</div>
        <div><strong>D:</strong> ${escapeHtml(q.optionD)}</div>
      </div>
      <div style="font-size:0.8rem; color:var(--text-secondary); background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;" class="batch-katex-expl">
        <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
      </div>
    `;

    batchList.appendChild(card);
  });

  modalBatchAi.style.display = 'flex';

  setTimeout(() => {
    if (window.renderMathInElement) {
      renderMathInElement(batchList, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ]
      });
    }
  }, 100);
}

function importAllBatchQuestions() {
  if (extractedBatchQuestions.length === 0) return;

  extractedBatchQuestions.forEach(q => {
    questions.push({
      id: String(q.id || autoFillId()),
      topicid: String(q.topicid || document.getElementById('q-topicid').value.trim() || '1'),
      question: q.question || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      answer: q.answer || 'optionA',
      image: q.image || '',
      explanation: q.explanation || '',
      difficulty: String(q.difficulty || 1),
      walkthrough_tag: q.walkthrough_tag || aiWalkthroughSelect.value || ''
    });
  });

  saveToStorage();
  renderTable();
  updateStats();
  autoFillId();
  modalBatchAi.style.display = 'none';

  showToast('success', `Added ${extractedBatchQuestions.length} sub-questions to spreadsheet!`);
}

// ============================================
// KaTeX Math Renderer & Live Previews
// ============================================

function renderKaTeX(element) {
  if (!element || !window.renderMathInElement) return;
  try {
    renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\begin{equation}', right: '\\end{equation}', display: true },
        { left: '\\begin{align}', right: '\\end{align}', display: true },
        { left: '\\begin{matrix}', right: '\\end{matrix}', display: true },
        { left: '\\begin{cases}', right: '\\end{cases}', display: true }
      ],
      throwOnError: false,
      errorColor: '#ff4b4b'
    });
  } catch (e) {
    console.warn('KaTeX render warning:', e);
  }
}

function renderKaTeXExplanationPreview() {
  const text = qExplanation.value.trim();
  if (!text) {
    katexPreviewContent.innerHTML = '<span class="preview-empty">Type solution above with $...$ math to preview</span>';
    return;
  }
  katexPreviewContent.textContent = text;
  renderKaTeX(katexPreviewContent);
}

function renderKaTeXQuestionPreview() {
  const qEl = document.getElementById('q-question');
  const box = document.getElementById('preview-box-question');
  const content = document.getElementById('katex-preview-question');
  if (!qEl || !box || !content) return;

  const text = qEl.value.trim();
  if (!text || (!text.includes('$') && !text.includes('\\'))) {
    box.style.display = 'none';
    content.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  content.textContent = text;
  renderKaTeX(content);
}

function renderKaTeXOptionsPreview() {
  const optA = document.getElementById('q-optionA').value.trim();
  const optB = document.getElementById('q-optionB').value.trim();
  const optC = document.getElementById('q-optionC').value.trim();
  const optD = document.getElementById('q-optionD').value.trim();

  const box = document.getElementById('preview-box-options');
  const content = document.getElementById('katex-preview-options');
  if (!box || !content) return;

  const hasMath = [optA, optB, optC, optD].some(t => t.includes('$') || t.includes('\\'));
  if (!hasMath) {
    box.style.display = 'none';
    content.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  content.innerHTML = `
    <div><strong>A:</strong> <span>${escapeHtml(optA)}</span></div>
    <div><strong>B:</strong> <span>${escapeHtml(optB)}</span></div>
    <div><strong>C:</strong> <span>${escapeHtml(optC)}</span></div>
    <div><strong>D:</strong> <span>${escapeHtml(optD)}</span></div>
  `;
  renderKaTeX(content);
}

function renderAllFormMathPreviews() {
  renderKaTeXExplanationPreview();
  renderKaTeXQuestionPreview();
  renderKaTeXOptionsPreview();
}

// ============================================
// Form & CRUD Operations
// ============================================

function handleFormSubmit(e) {
  e.preventDefault();

  const editIndex = parseInt(editIndexInput.value);
  const isEditing = editIndex >= 0;

  const questionData = {
    id: document.getElementById('q-id').value.trim(),
    topicid: document.getElementById('q-topicid').value.trim(),
    question: document.getElementById('q-question').value.trim(),
    optionA: document.getElementById('q-optionA').value.trim(),
    optionB: document.getElementById('q-optionB').value.trim(),
    optionC: document.getElementById('q-optionC').value.trim(),
    optionD: document.getElementById('q-optionD').value.trim(),
    answer: document.getElementById('q-answer').value,
    image: '',
    explanation: document.getElementById('q-explanation').value.trim(),
    difficulty: document.getElementById('q-difficulty').value,
    walkthrough_tag: document.getElementById('q-walkthrough-tag').value.trim()
  };

  const rawImageInput = imageNameInput.value.trim();
  if (rawImageInput) {
    questionData.image = resolveImageUrl(rawImageInput);
    const fileNameOnly = rawImageInput.split('/').pop() || rawImageInput;
    if (currentImageData && currentImageFile) {
      localImageStore[fileNameOnly] = currentImageData;
      const existing = pendingImages.findIndex(img => img.name === fileNameOnly);
      if (existing >= 0) {
        pendingImages[existing] = { name: fileNameOnly, dataUrl: currentImageData, file: currentImageFile };
      } else {
        pendingImages.push({ name: fileNameOnly, dataUrl: currentImageData, file: currentImageFile });
      }
    }
  }

  const duplicateIndex = questions.findIndex((q, i) => q.id === questionData.id && i !== editIndex);
  if (duplicateIndex >= 0) {
    showToast('error', `Question ID ${questionData.id} already exists!`);
    return;
  }

  if (isEditing) {
    questions[editIndex] = questionData;
    showToast('success', `Question ${questionData.id} updated!`);
  } else {
    questions.push(questionData);
    showToast('success', `Question ${questionData.id} added!`);
  }

  saveToStorage();
  renderTable();
  updateStats();
  resetForm();
  autoFillId();
}

function resetForm() {
  form.reset();
  editIndexInput.value = '-1';
  formTitle.textContent = 'Add New Question';
  btnSubmitText.textContent = 'Add Question';
  btnCancelEdit.style.display = 'none';
  removeImage();
  githubUrlPreview.style.display = 'none';
  renderAllFormMathPreviews();
  autoFillId();
}

function cancelEdit() {
  resetForm();
  showToast('success', 'Edit cancelled');
}

function autoFillId() {
  const nextId = getNextAvailableId();
  document.getElementById('q-id').value = nextId;
  return nextId;
}

function getNextAvailableId() {
  if (questions.length === 0) return '201';
  const numIds = questions.map(q => parseInt(String(q.id).split('-')[0]) || 0);
  const maxId = Math.max(...numIds);
  return String(maxId + 1);
}

// ============================================
// Image Upload for Question Form
// ============================================

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (file) processImageFile(file);
}

function processImageFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', 'Image must be under 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    currentImageFile = file;

    imagePreview.src = currentImageData;
    uploadPlaceholder.style.display = 'none';
    imagePreviewContainer.style.display = 'block';

    if (!imageNameInput.value.trim()) {
      const ext = file.name.split('.').pop();
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      imageNameInput.value = baseName + '.' + ext;
    }
    updateGithubUrlPreview();
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  currentImageData = null;
  currentImageFile = null;
  imagePreview.src = '';
  uploadPlaceholder.style.display = 'flex';
  imagePreviewContainer.style.display = 'none';
  imageInput.value = '';
}

function updateGithubUrlPreview() {
  const name = imageNameInput.value.trim();
  if (name) {
    githubUrlText.textContent = resolveImageUrl(name);
    githubUrlPreview.style.display = 'flex';
  } else {
    githubUrlPreview.style.display = 'none';
  }
}

function copyGithubUrl() {
  navigator.clipboard.writeText(githubUrlText.textContent).then(() => {
    showToast('success', 'URL copied to clipboard!');
  });
}

// ============================================
// Table Rendering & KaTeX
// ============================================

function renderTable() {
  const search = searchInput.value.toLowerCase().trim();
  const topicFilter = filterTopic.value;

  let filtered = questions.filter((q) => {
    if (topicFilter && String(q.topicid) !== String(topicFilter)) return false;
    if (search) {
      const searchable = `${q.id} ${q.question} ${q.optionA} ${q.optionB} ${q.optionC} ${q.optionD} ${q.explanation} ${q.walkthrough_tag || ''}`.toLowerCase();
      if (!searchable.includes(search)) return false;
    }
    return true;
  });

  const topics = [...new Set(questions.map(q => q.topicid).filter(Boolean))].sort();
  const currentTopicValue = filterTopic.value;
  filterTopic.innerHTML = '<option value="">All Topics</option>';
  topics.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = `Topic ${t}`;
    if (String(t) === String(currentTopicValue)) opt.selected = true;
    filterTopic.appendChild(opt);
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    questionsTable.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  questionsTable.style.display = 'table';
  questionsTbody.innerHTML = '';

  filtered.forEach((q) => {
    const originalIndex = questions.indexOf(q);
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', q.id);

    const isChecked = selectedQuestionIds.has(q.id) ? 'checked' : '';
    const answerLetter = q.answer ? q.answer.replace('option', '') : '—';
    const answerClass = `answer-${answerLetter}`;

    const walkthroughCell = q.walkthrough_tag 
      ? `<span class="walkthrough-tag-badge">${escapeHtml(q.walkthrough_tag)}</span>`
      : `<span class="td-no-image">—</span>`;

    const diffClass = `diff-${q.difficulty || 1}`;

    tr.innerHTML = `
      <td style="text-align: center;"><input type="checkbox" class="qs-checkbox" data-id="${q.id}" ${isChecked} onchange="toggleSelectQuestion('${q.id}', this.checked)"></td>
      <td class="td-id">${escapeHtml(q.id)}</td>
      <td class="td-topic">${escapeHtml(q.topicid)}</td>
      <td><div class="td-question">${escapeHtml(q.question)}</div></td>
      <td class="td-answer"><span class="answer-chip ${answerClass}">${answerLetter}</span></td>
      <td>${walkthroughCell}</td>
      <td><span class="difficulty-badge ${diffClass}">${escapeHtml(q.difficulty || '1')}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-icon" title="Edit" onclick="editQuestion(${originalIndex})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon" title="Delete" onclick="deleteQuestion(${originalIndex})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;
    questionsTbody.appendChild(tr);
  });

  updateSelectedCountUI();

  renderKaTeX(questionsTbody);
}

let selectedQuestionIds = new Set();
let lastDeletedQuestion = null;
let lastDeletedIndex = -1;

function toggleSelectAllQuestions(checked) {
  if (checked) {
    questions.forEach(q => selectedQuestionIds.add(q.id));
  } else {
    selectedQuestionIds.clear();
  }
  renderTable();
}

function toggleSelectQuestion(id, checked) {
  if (checked) {
    selectedQuestionIds.add(id);
  } else {
    selectedQuestionIds.delete(id);
  }
  updateSelectedCountUI();
}
window.toggleSelectQuestion = toggleSelectQuestion;

function updateSelectedCountUI() {
  const countEl = document.getElementById('selected-count');
  const btnDeleteSel = document.getElementById('btn-delete-selected');
  const selectAllCb = document.getElementById('select-all-qs');

  if (countEl) countEl.textContent = selectedQuestionIds.size;
  if (btnDeleteSel) btnDeleteSel.style.display = selectedQuestionIds.size > 0 ? 'inline-flex' : 'none';
  if (selectAllCb) selectAllCb.checked = questions.length > 0 && selectedQuestionIds.size === questions.length;
}

function editQuestion(index) {
  const q = questions[index];
  if (!q) return;

  editIndexInput.value = index;
  formTitle.textContent = `Edit Question ${q.id}`;
  btnSubmitText.textContent = 'Save Changes';
  btnCancelEdit.style.display = 'inline-flex';

  document.getElementById('q-id').value = q.id;
  document.getElementById('q-topicid').value = q.topicid;
  document.getElementById('q-question').value = q.question;
  document.getElementById('q-optionA').value = q.optionA;
  document.getElementById('q-optionB').value = q.optionB;
  document.getElementById('q-optionC').value = q.optionC;
  document.getElementById('q-optionD').value = q.optionD;
  document.getElementById('q-answer').value = q.answer;
  document.getElementById('q-explanation').value = q.explanation;
  document.getElementById('q-difficulty').value = q.difficulty;
  document.getElementById('q-walkthrough-tag').value = q.walkthrough_tag || '';

  if (q.image) {
    imageNameInput.value = q.image;
    updateGithubUrlPreview();

    const fileNameOnly = q.image.split('/').pop() || q.image;
    const localSrc = localImageStore[fileNameOnly] || localImageStore[q.image];
    imagePreview.src = localSrc || q.image;
    uploadPlaceholder.style.display = 'none';
    imagePreviewContainer.style.display = 'block';
  } else {
    removeImage();
    imageNameInput.value = '';
    githubUrlPreview.style.display = 'none';
  }

  renderAllFormMathPreviews();
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteQuestion(index) {
  if (index < 0 || index >= questions.length) return;

  const q = questions[index];
  lastDeletedQuestion = { ...q };
  lastDeletedIndex = index;

  if (selectedQuestionIds.has(q.id)) {
    selectedQuestionIds.delete(q.id);
  }

  questions.splice(index, 1);
  saveToStorage();
  renderTable();
  updateStats();
  autoFillId();

  showToastWithUndo(`Deleted Question ${q.id}`, () => {
    if (lastDeletedQuestion) {
      questions.splice(lastDeletedIndex, 0, lastDeletedQuestion);
      saveToStorage();
      renderTable();
      updateStats();
      autoFillId();
      showToast('success', `Restored Question ${lastDeletedQuestion.id}`);
      lastDeletedQuestion = null;
    }
  });
}

function deleteSelectedQuestions() {
  if (selectedQuestionIds.size === 0) return;
  const count = selectedQuestionIds.size;
  questions = questions.filter(q => !selectedQuestionIds.has(q.id));
  selectedQuestionIds.clear();

  saveToStorage();
  renderTable();
  updateStats();
  autoFillId();
  showToast('success', `Deleted ${count} question(s)!`);
}

function clearAllQuestions() {
  if (questions.length === 0) {
    showToast('error', 'Question bank is already empty');
    return;
  }
  const count = questions.length;
  questions = [];
  selectedQuestionIds.clear();

  saveToStorage();
  renderTable();
  updateStats();
  autoFillId();
  showToast('success', `Cleared all ${count} questions!`);
}

// ============================================
// CSV Import & Export
// ============================================

function handleCSVImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const csv = ev.target.result;
      const parsed = parseCSV(csv);

      if (parsed.length === 0) {
        showToast('error', 'No valid questions found in CSV');
        return;
      }

      const action = questions.length > 0
        ? confirm(`You have ${questions.length} existing questions.\n\nClick OK to REPLACE all with imported data.\nClick Cancel to APPEND imported data.`)
          ? 'replace'
          : 'append'
        : 'replace';

      if (action === 'replace') {
        questions = parsed;
      } else {
        questions = [...questions, ...parsed];
      }

      saveToStorage();
      renderTable();
      updateStats();
      autoFillId();
      showToast('success', `Imported ${parsed.length} questions!`);
    } catch (err) {
      showToast('error', 'Failed to parse CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
  csvImportInput.value = '';
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < 3) continue;

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim();
    });

    if (!obj.question) continue;

    results.push({
      id: obj.id || '',
      topicid: obj.topicid || '',
      question: obj.question || '',
      optionA: obj.optionA || '',
      optionB: obj.optionB || '',
      optionC: obj.optionC || '',
      optionD: obj.optionD || '',
      answer: obj.answer || '',
      image: obj.image || '',
      explanation: obj.explanation || '',
      difficulty: obj.difficulty || '1',
      walkthrough_tag: obj.walkthrough_tag || obj.walkthroughTag || ''
    });
  }

  return results;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else if (char === '\r') {
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function generateCSVString() {
  const headers = ['id', 'topicid', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'image', 'explanation', 'difficulty', 'walkthrough_tag'];
  let csv = headers.join(',') + '\r\n';

  questions.forEach(q => {
    const row = headers.map(h => {
      const val = String(q[h] || '');
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csv += row.join(',') + '\r\n';
  });
  return csv;
}

function downloadCSV() {
  const csv = generateCSVString();
  csvExportTextarea.value = csv;
  modalCsvExport.style.display = 'flex';

  const filenameInput = document.getElementById('csv-filename-input');
  if (filenameInput) {
    filenameInput.focus();
    filenameInput.select();
  }
}

function triggerDataUriDownload() {
  const csv = csvExportTextarea.value || generateCSVString();

  const filenameInput = document.getElementById('csv-filename-input');
  let filename = filenameInput ? filenameInput.value.trim() : 'QuestionBank.csv';
  if (!filename) filename = 'QuestionBank.csv';
  if (!filename.toLowerCase().endsWith('.csv')) filename += '.csv';

  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  // Native macOS File Save Picker for Chrome / Edge / Brave
  if (window.showSaveFilePicker) {
    window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: 'CSV File (*.csv)',
        accept: { 'text/csv': ['.csv'] }
      }]
    }).then(async (handle) => {
      const writable = await handle.createWritable();
      await writable.write(bom + csv);
      await writable.close();
      showToast('success', `${handle.name} saved successfully!`);
      if (pendingImages.length > 0) {
        setTimeout(() => showImageUploadModal(), 800);
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        fallbackBlobDownload(blob, filename);
      }
    });
    return;
  }

  fallbackBlobDownload(blob, filename);
}

function fallbackBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 10000);

  showToast('success', `${filename} downloaded!`);

  if (pendingImages.length > 0) {
    setTimeout(() => showImageUploadModal(), 800);
  }
}

function copyCsvTextToClipboard() {
  const text = csvExportTextarea.value || generateCSVString();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('success', 'CSV text copied to clipboard!');
    }).catch(() => {
      fallbackCopyCsvText();
    });
  } else {
    fallbackCopyCsvText();
  }
}

function fallbackCopyCsvText() {
  csvExportTextarea.select();
  document.execCommand('copy');
  showToast('success', 'CSV text copied to clipboard!');
}



// ============================================
// Pending Images Modal
// ============================================

function showImageUploadModal() {
  pendingImagesList.innerHTML = '';
  if (pendingImages.length === 0) {
    pendingImagesList.innerHTML = '<p style="color: var(--text-tertiary); font-size: 0.85rem;">No new images to upload.</p>';
  } else {
    pendingImages.forEach(img => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:6px;';
      div.innerHTML = `
        <img src="${img.dataUrl}" style="width:40px;height:30px;object-fit:cover;border-radius:4px;">
        <span style="font-size:0.85rem;color:var(--text-secondary);font-family:monospace;">${escapeHtml(img.name)}</span>
      `;
      pendingImagesList.appendChild(div);
    });
  }
  imageDownloadModal.style.display = 'flex';
}

function closeModal() {
  imageDownloadModal.style.display = 'none';
}

function downloadAllImages() {
  pendingImages.forEach(img => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = img.name;
    a.click();
  });
  showToast('success', `${pendingImages.length} image(s) downloaded!`);
  closeModal();
}

// ============================================
// Statistics
// ============================================

function updateStats() {
  statTotal.textContent = questions.length;
  statWithImages.textContent = questions.filter(q => q.image).length;
  const topics = new Set(questions.map(q => q.topicid).filter(Boolean));
  statTopics.textContent = topics.size;

  if (questions.length > 0) {
    const avgDiff = questions.reduce((sum, q) => sum + (parseInt(q.difficulty) || 0), 0) / questions.length;
    statDifficulty.textContent = avgDiff.toFixed(1);
  } else {
    statDifficulty.textContent = '1.0';
  }
}

function showToastWithUndo(message, undoCallback) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; min-width: 240px;';
  
  toast.innerHTML = `
    <span>✓ ${escapeHtml(message)}</span>
    <button type="button" style="background:rgba(0,242,254,0.18); color:#00f2fe; border:1px solid #00f2fe; border-radius:4px; font-weight:700; font-size:0.75rem; padding:3px 8px; cursor:pointer;" id="toast-undo-btn">Undo</button>
  `;
  
  const undoBtn = toast.querySelector('#toast-undo-btn');
  if (undoBtn && undoCallback) {
    undoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toast.remove();
      undoCallback();
    });
  }

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function showToast(type, message) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✓' : '✕';
  toast.innerHTML = `<span style="font-weight:bold;">${icon}</span><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
