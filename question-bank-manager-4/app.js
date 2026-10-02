/* ============================================
   Question Bank Manager 4 — Application Logic
   Features: Bulk Question Field & Link Editing,
   Main Question Stem Support, RFC-4180 Multiline CSV Parser,
   Auto Drag Path Link Generator, Full KaTeX Options Support,
   & Gemini AI Multi-Part Generator
   ============================================ */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jlohix/Duolingo-for-CA/main/question-bank/';

// State
let questions = [];
let pendingImages = []; // { name, dataUrl, file, relPath }
let localImageStore = {}; // imageName -> dataUrl
let geminiApiKey = '';
let solutionImageFiles = []; // Array of { base64, mime, fileName, dataUrl, relPath }
let extractedBatchQuestions = [];
let batchCardEditModes = {};
let selectedQuestionIds = new Set();
let lastDeletedQuestion = null;
let lastDeletedIndex = -1;

// Bulk Edit State
let bulkImageData = null;
let bulkImageFile = null;

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

// Toolbar Buttons
const btnBulkEdit = document.getElementById('btn-bulk-edit');
const bulkEditCount = document.getElementById('bulk-edit-count');
const btnDeselectAll = document.getElementById('btn-deselect-all');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const selectedCountEl = document.getElementById('selected-count');

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

// KaTeX Elements
const qMainQuestion = document.getElementById('q-main-question');
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

// Bulk Edit Modal Elements
const modalBulkEdit = document.getElementById('modal-bulk-edit');
const btnCloseBulkModal = document.getElementById('btn-close-bulk-modal');
const btnCancelBulk = document.getElementById('btn-cancel-bulk');
const btnApplyBulk = document.getElementById('btn-apply-bulk');
const bulkSelectedInfo = document.getElementById('bulk-selected-info');
const bulkEditModalCount = document.getElementById('bulk-edit-modal-count');

// Bulk Checkboxes & Inputs
const bulkChkImage = document.getElementById('bulk-chk-image');
const bulkInputsImage = document.getElementById('bulk-inputs-image');
const bulkMidFolder = document.getElementById('bulk-mid-folder');
const bulkImageName = document.getElementById('bulk-image-name');
const bulkImageUploadArea = document.getElementById('bulk-image-upload-area');
const bulkImageInput = document.getElementById('bulk-image-input');

const bulkChkMainQuestion = document.getElementById('bulk-chk-main-question');
const bulkInputsMainQuestion = document.getElementById('bulk-inputs-main-question');
const bulkMainQuestion = document.getElementById('bulk-main-question');

const bulkChkTopic = document.getElementById('bulk-chk-topic');
const bulkInputsTopic = document.getElementById('bulk-inputs-topic');
const bulkTopicid = document.getElementById('bulk-topicid');

const bulkChkWalkthrough = document.getElementById('bulk-chk-walkthrough');
const bulkInputsWalkthrough = document.getElementById('bulk-inputs-walkthrough');
const bulkWalkthroughTag = document.getElementById('bulk-walkthrough-tag');

const bulkChkDifficulty = document.getElementById('bulk-chk-difficulty');
const bulkInputsDifficulty = document.getElementById('bulk-inputs-difficulty');
const bulkDifficulty = document.getElementById('bulk-difficulty');

const bulkChkAnswer = document.getElementById('bulk-chk-answer');
const bulkInputsAnswer = document.getElementById('bulk-inputs-answer');
const bulkAnswer = document.getElementById('bulk-answer');

// Current image upload state
let currentImageData = null;
let currentImageFile = null;
let currentImageRelPath = '';

// ============================================
// Auto KaTeX Delimiter Helper
// ============================================

/**
 * Ensures string containing LaTeX math formulas or symbols is wrapped in $...$ delimiters
 * so KaTeX renderMathInElement will always render it.
 */
function ensureMathDelimiters(str) {
  if (!str) return '';
  let s = String(str).trim();
  if (!s) return '';
  
  if (s.includes('$') || s.includes('\\(') || s.includes('\\[')) {
    return s;
  }
  
  const hasLatexPattern = /\\(frac|sqrt|cdot|times|int|sum|prod|partial|infty|approx|le|ge|neq|pm|mp|angle|Omega|omega|mu|alpha|beta|gamma|delta|epsilon|lambda|tau|phi|pi|theta|cap|cup|in|subset|mathbf|mathrm|text|left|right|begin|end|over|under|quad|qquad)|[\^_{}]/i.test(s);
  
  if (hasLatexPattern) {
    return `$${s}$`;
  }
  
  return s;
}

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

  if (btnDeleteSelected) btnDeleteSelected.addEventListener('click', deleteSelectedQuestions);
  if (btnBulkEdit) btnBulkEdit.addEventListener('click', openBulkEditModal);
  if (btnDeselectAll) btnDeselectAll.addEventListener('click', deselectAllQuestions);

  const selectAllQsCheckbox = document.getElementById('select-all-qs');
  if (selectAllQsCheckbox) {
    selectAllQsCheckbox.addEventListener('change', (e) => toggleSelectAllQuestions(e.target.checked));
  }

  // Bulk Edit Modal events
  if (btnCloseBulkModal) btnCloseBulkModal.addEventListener('click', () => modalBulkEdit.style.display = 'none');
  if (btnCancelBulk) btnCancelBulk.addEventListener('click', () => modalBulkEdit.style.display = 'none');
  if (btnApplyBulk) btnApplyBulk.addEventListener('click', applyBulkEditChanges);

  // Bulk Checkbox Toggles
  bindBulkCheckboxToggle(bulkChkImage, bulkInputsImage);
  bindBulkCheckboxToggle(bulkChkMainQuestion, bulkInputsMainQuestion);
  bindBulkCheckboxToggle(bulkChkTopic, bulkInputsTopic);
  bindBulkCheckboxToggle(bulkChkWalkthrough, bulkInputsWalkthrough);
  bindBulkCheckboxToggle(bulkChkDifficulty, bulkInputsDifficulty);
  bindBulkCheckboxToggle(bulkChkAnswer, bulkInputsAnswer);

  // Bulk Image Upload & Drag Drop
  if (bulkImageUploadArea) {
    bulkImageUploadArea.addEventListener('click', () => bulkImageInput.click());
    bulkImageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      bulkImageUploadArea.classList.add('drag-over');
    });
    bulkImageUploadArea.addEventListener('dragleave', () => bulkImageUploadArea.classList.remove('drag-over'));
    bulkImageUploadArea.addEventListener('drop', async (e) => {
      e.preventDefault();
      bulkImageUploadArea.classList.remove('drag-over');
      const itemsWithPaths = await getDroppedFilesWithPaths(e.dataTransfer);
      if (itemsWithPaths.length > 0) {
        const imgItem = itemsWithPaths.find(item => item.file.type.startsWith('image/')) || itemsWithPaths[0];
        processBulkImageFile(imgItem.file, imgItem.path);
      }
    });
  }
  if (bulkImageInput) {
    bulkImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const relPath = cleanDraggedRelativePath(file.webkitRelativePath || file.name);
        processBulkImageFile(file, relPath);
      }
    });
  }
  if (bulkMidFolder && bulkImageName) {
    bulkMidFolder.addEventListener('input', () => {
      const mid = bulkMidFolder.value.trim().replace(/\/+$/, '');
      let currentImg = bulkImageName.value.trim();
      if (currentImg.includes('/')) {
        currentImg = currentImg.split('/').pop();
      }
      if (mid && currentImg) {
        bulkImageName.value = `${mid}/${currentImg}`;
      } else if (currentImg) {
        bulkImageName.value = currentImg;
      }
    });
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
      if (modalBulkEdit) modalBulkEdit.style.display = 'none';
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
    if (!e.target.classList.contains('multi-thumb-remove') && e.target !== btnClearAiImage && !e.target.classList.contains('multi-thumb-input')) {
      aiImageInput.click();
    }
  });
  aiImageInput.addEventListener('change', handleAiImageSelect);
  btnClearAiImage.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAllSolutionPhotos();
  });

  // AI Drag & Drop with Path Extraction
  aiDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    aiDropzone.classList.add('drag-over');
  });
  aiDropzone.addEventListener('dragleave', () => aiDropzone.classList.remove('drag-over'));
  aiDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    aiDropzone.classList.remove('drag-over');
    const itemsWithPaths = await getDroppedFilesWithPaths(e.dataTransfer);
    if (itemsWithPaths.length > 0) {
      processAiImageFilesWithPaths(itemsWithPaths);
    }
  });

  // Batch Modal & AI Assistant
  btnCloseBatchModal.addEventListener('click', () => modalBatchAi.style.display = 'none');
  btnCancelBatch.addEventListener('click', () => modalBatchAi.style.display = 'none');
  btnImportAllBatch.addEventListener('click', importAllBatchQuestions);

  const btnBatchAiRefine = document.getElementById('btn-batch-ai-refine');
  if (btnBatchAiRefine) btnBatchAiRefine.addEventListener('click', refineBatchWithAi);

  const btnToggleAllBatchEdit = document.getElementById('btn-toggle-all-batch-edit');
  if (btnToggleAllBatchEdit) btnToggleAllBatchEdit.addEventListener('click', window.toggleAllBatchEdit);

  const actReshuffle = document.getElementById('batch-act-reshuffle');
  if (actReshuffle) {
    actReshuffle.addEventListener('click', () => {
      extractedBatchQuestions = extractedBatchQuestions.map(q => shuffleAndRandomizeOptions(q));
      openBatchModal(extractedBatchQuestions);
      showToast('success', 'Reshuffled all options!');
    });
  }

  const actFixMath = document.getElementById('batch-act-fixmath');
  if (actFixMath) {
    actFixMath.addEventListener('click', () => {
      extractedBatchQuestions.forEach(q => {
        q.optionA = ensureMathDelimiters(q.optionA);
        q.optionB = ensureMathDelimiters(q.optionB);
        q.optionC = ensureMathDelimiters(q.optionC);
        q.optionD = ensureMathDelimiters(q.optionD);
        q.question = ensureMathDelimiters(q.question);
        q.main_question = ensureMathDelimiters(q.main_question);
        q.explanation = ensureMathDelimiters(q.explanation);
      });
      openBatchModal(extractedBatchQuestions);
      showToast('success', 'Auto-wrapped all math expressions in $');
    });
  }

  const actAddStep = document.getElementById('batch-act-addstep');
  if (actAddStep) {
    actAddStep.addEventListener('click', () => {
      const nextIdx = extractedBatchQuestions.length + 1;
      const baseId = getNextBaseId();
      const newCard = {
        id: `${baseId}-${nextIdx}`,
        topicid: '2',
        main_question: extractedBatchQuestions[0]?.main_question || '',
        question: 'New sub-question text...',
        optionA: 'Option A',
        optionB: 'Option B',
        optionC: 'Option C',
        optionD: 'Option D',
        answer: 'optionA',
        image: extractedBatchQuestions[0]?.image || '',
        explanation: 'Step-by-step solution...',
        difficulty: '2',
        walkthrough_tag: extractedBatchQuestions[0]?.walkthrough_tag || ''
      };
      extractedBatchQuestions.push(newCard);
      batchCardEditModes[extractedBatchQuestions.length - 1] = true;
      openBatchModal(extractedBatchQuestions);
      showToast('success', 'Added new blank step card!');
    });
  }

  // Live KaTeX Field Previews
  if (qMainQuestion) qMainQuestion.addEventListener('input', renderKaTeXMainQuestionPreview);
  qExplanation.addEventListener('input', renderKaTeXExplanationPreview);

  const qQuestionInput = document.getElementById('q-question');
  if (qQuestionInput) qQuestionInput.addEventListener('input', renderKaTeXQuestionPreview);

  ['q-optionA', 'q-optionB', 'q-optionC', 'q-optionD'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderKaTeXOptionsPreview);
  });

  // Image Upload Form Drag & Drop
  imageUploadArea.addEventListener('click', (e) => {
    if (e.target !== btnRemoveImage) imageInput.click();
  });
  imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.classList.add('drag-over');
  });
  imageUploadArea.addEventListener('dragleave', () => imageUploadArea.classList.remove('drag-over'));
  imageUploadArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    imageUploadArea.classList.remove('drag-over');
    const itemsWithPaths = await getDroppedFilesWithPaths(e.dataTransfer);
    if (itemsWithPaths.length > 0) {
      const imgItem = itemsWithPaths.find(item => item.file.type.startsWith('image/')) || itemsWithPaths[0];
      processImageFile(imgItem.file, imgItem.path);
    }
  });
  imageInput.addEventListener('change', handleImageSelect);
  btnRemoveImage.addEventListener('click', (e) => { e.stopPropagation(); removeImage(); });
  imageNameInput.addEventListener('input', updateGithubUrlPreview);
  const qMidFolderInput = document.getElementById('q-mid-folder');
  if (qMidFolderInput) {
    qMidFolderInput.addEventListener('input', () => {
      const mid = qMidFolderInput.value.trim().replace(/\/+$/, '');
      let currentImg = imageNameInput.value.trim();
      if (currentImg.includes('/')) {
        currentImg = currentImg.split('/').pop();
      }
      if (mid && currentImg) {
        imageNameInput.value = `${mid}/${currentImg}`;
      } else if (currentImg) {
        imageNameInput.value = currentImg;
      }
      updateGithubUrlPreview();
    });
  }
  btnCopyUrl.addEventListener('click', copyGithubUrl);

  // Download Modal
  btnCloseModal.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  btnDownloadImages.addEventListener('click', downloadAllImages);
}

function bindBulkCheckboxToggle(chkEl, containerEl) {
  if (!chkEl || !containerEl) return;
  chkEl.addEventListener('change', () => {
    containerEl.style.display = chkEl.checked ? 'block' : 'none';
  });
}

function processBulkImageFile(file, relPath) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', 'Image must be under 5MB');
    return;
  }
  const targetPath = relPath || file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    bulkImageData = e.target.result;
    bulkImageFile = file;

    if (!bulkImageName.value.trim() || bulkImageName.value === file.name) {
      bulkImageName.value = targetPath;
    }
    bulkChkImage.checked = true;
    bulkInputsImage.style.display = 'block';
    showToast('success', `Bulk image path set: ${targetPath}`);
  };
  reader.readAsDataURL(file);
}

// ============================================
// Bulk Edit Modal Functions
// ============================================

function openBulkEditModal() {
  if (selectedQuestionIds.size === 0) {
    showToast('error', 'Please select at least 1 question to bulk edit');
    return;
  }

  const selectedArray = Array.from(selectedQuestionIds);
  bulkEditModalCount.textContent = selectedArray.length;
  
  const displayIds = selectedArray.slice(0, 8).join(', ') + (selectedArray.length > 8 ? `... and ${selectedArray.length - 8} more` : '');
  bulkSelectedInfo.innerHTML = `<strong>Editing ${selectedArray.length} questions:</strong> <code>${escapeHtml(displayIds)}</code>`;

  // Reset checkboxes and containers
  [bulkChkImage, bulkChkMainQuestion, bulkChkTopic, bulkChkWalkthrough, bulkChkDifficulty, bulkChkAnswer].forEach(chk => {
    if (chk) chk.checked = false;
  });

  [bulkInputsImage, bulkInputsMainQuestion, bulkInputsTopic, bulkInputsWalkthrough, bulkInputsDifficulty, bulkInputsAnswer].forEach(inputBox => {
    if (inputBox) inputBox.style.display = 'none';
  });

  bulkImageData = null;
  bulkImageFile = null;
  bulkImageName.value = '';
  bulkMidFolder.value = '';
  bulkMainQuestion.value = '';
  bulkTopicid.value = '';
  bulkWalkthroughTag.value = '';
  bulkDifficulty.value = '2';
  bulkAnswer.value = 'optionA';

  modalBulkEdit.style.display = 'flex';
}

function applyBulkEditChanges() {
  if (selectedQuestionIds.size === 0) return;

  const updateImage = bulkChkImage && bulkChkImage.checked;
  const updateMainQ = bulkChkMainQuestion && bulkChkMainQuestion.checked;
  const updateTopic = bulkChkTopic && bulkChkTopic.checked;
  const updateWalkthrough = bulkChkWalkthrough && bulkChkWalkthrough.checked;
  const updateDiff = bulkChkDifficulty && bulkChkDifficulty.checked;
  const updateAns = bulkChkAnswer && bulkChkAnswer.checked;

  if (!updateImage && !updateMainQ && !updateTopic && !updateWalkthrough && !updateDiff && !updateAns) {
    showToast('error', 'Please check at least one field to bulk edit!');
    return;
  }

  let updatedCount = 0;
  const newRawImagePath = updateImage ? bulkImageName.value.trim() : '';
  const resolvedImageUrl = newRawImagePath ? resolveImageUrl(newRawImagePath) : '';

  if (updateImage && newRawImagePath && bulkImageData && bulkImageFile) {
    const fileNameOnly = newRawImagePath.replace(/^[/\\]+/, '');
    localImageStore[fileNameOnly] = bulkImageData;
    const existing = pendingImages.findIndex(img => img.name === fileNameOnly);
    if (existing >= 0) {
      pendingImages[existing] = { name: fileNameOnly, dataUrl: bulkImageData, file: bulkImageFile };
    } else {
      pendingImages.push({ name: fileNameOnly, dataUrl: bulkImageData, file: bulkImageFile });
    }
  }

  questions.forEach(q => {
    if (selectedQuestionIds.has(q.id)) {
      if (updateImage) q.image = resolvedImageUrl;
      if (updateMainQ) q.main_question = ensureMathDelimiters(bulkMainQuestion.value.trim());
      if (updateTopic) q.topicid = bulkTopicid.value.trim();
      if (updateWalkthrough) q.walkthrough_tag = bulkWalkthroughTag.value.trim();
      if (updateDiff) q.difficulty = bulkDifficulty.value;
      if (updateAns) q.answer = bulkAnswer.value;
      updatedCount++;
    }
  });

  saveToStorage();
  renderTable();
  updateStats();
  modalBulkEdit.style.display = 'none';

  showToast('success', `Successfully bulk updated ${updatedCount} question(s)!`);
}

// ============================================
// Drag & Drop Traversal for Section Paths
// ============================================

function cleanDraggedRelativePath(rawPath) {
  if (!rawPath) return '';
  let clean = rawPath.replace(/\\/g, '/');
  
  const qbIdx = clean.toLowerCase().indexOf('question-bank/');
  if (qbIdx !== -1) {
    clean = clean.substring(qbIdx + 'question-bank/'.length);
  } else {
    const parts = clean.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const parentDir = parts[parts.length - 2].toLowerCase();
      const ignoreSystemDirs = ['users', 'desktop', 'downloads', 'documents', 'tmp', 'temp', 'volumes', 'file:', 'http:', 'https:'];
      if (!ignoreSystemDirs.includes(parentDir)) {
        clean = parts.slice(-2).join('/');
      } else {
        clean = parts[parts.length - 1];
      }
    } else {
      clean = clean.replace(/^[/\\]+/, '');
    }
  }

  clean = clean.replace(/^(Duolingo-for-CA|PYP-qn-images)[/\\]+/i, '');
  return clean;
}

function getDroppedFilesWithPaths(dataTransfer) {
  return new Promise((resolve) => {
    const items = dataTransfer.items;
    if (!items) {
      const files = Array.from(dataTransfer.files).map(f => {
        const rawPath = f.path || f.webkitRelativePath || f.name;
        return {
          file: f,
          path: cleanDraggedRelativePath(rawPath)
        };
      });
      resolve(files);
      return;
    }

    const filesWithPaths = [];
    let pendingEntries = 0;

    function readEntry(entry, pathPrefix = '') {
      if (entry.isFile) {
        pendingEntries++;
        entry.file((file) => {
          let rawPath = '';
          if (pathPrefix) {
            rawPath = `${pathPrefix}/${file.name}`;
          } else if (file.path) {
            rawPath = file.path;
          } else if (entry.fullPath && entry.fullPath !== '/' + file.name) {
            rawPath = entry.fullPath;
          } else if (file.webkitRelativePath) {
            rawPath = file.webkitRelativePath;
          } else {
            rawPath = file.name;
          }

          let cleanedPath = cleanDraggedRelativePath(rawPath);

          const midFolderInput = document.getElementById('q-mid-folder');
          const defaultMid = midFolderInput ? midFolderInput.value.trim() : '';
          if (defaultMid && !cleanedPath.includes('/')) {
            cleanedPath = `${defaultMid.replace(/\/+$/, '')}/${cleanedPath}`;
          }

          filesWithPaths.push({ file, path: cleanedPath });
          pendingEntries--;
          if (pendingEntries === 0) resolve(filesWithPaths);
        }, () => {
          pendingEntries--;
          if (pendingEntries === 0) resolve(filesWithPaths);
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        pendingEntries++;
        dirReader.readEntries((entries) => {
          entries.forEach(child => {
            readEntry(child, pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name);
          });
          pendingEntries--;
          if (pendingEntries === 0) resolve(filesWithPaths);
        }, () => {
          pendingEntries--;
          if (pendingEntries === 0) resolve(filesWithPaths);
        });
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : (item.getAsEntry ? item.getAsEntry() : null);
      if (entry) {
        readEntry(entry);
      } else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          const rawPath = file.path || file.webkitRelativePath || file.name;
          filesWithPaths.push({ file, path: cleanDraggedRelativePath(rawPath) });
        }
      }
    }

    if (pendingEntries === 0) {
      resolve(filesWithPaths);
    }
  });
}

// ============================================
// Multi-Photo Gallery Handlers
// ============================================

function handleAiImageSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    const items = Array.from(e.target.files).map(f => ({
      file: f,
      path: cleanDraggedRelativePath(f.webkitRelativePath || f.name)
    }));
    processAiImageFilesWithPaths(items);
  }
}

function processAiImageFilesWithPaths(itemsWithPaths) {
  const imageItems = itemsWithPaths.filter(item => item.file.type.startsWith('image/'));
  if (imageItems.length === 0) {
    showToast('error', 'Please select or drag image files');
    return;
  }

  let loadedCount = 0;
  imageItems.forEach(item => {
    const file = item.file;
    const relPath = item.path || file.name;

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
          fileName: relPath,
          dataUrl: compressedDataUrl,
          relPath: relPath
        });

        loadedCount++;
        if (loadedCount === imageItems.length) {
          renderMultiImageGallery();
          showToast('success', `Loaded ${solutionImageFiles.length} photo(s) with drag section paths!`);
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
      <input type="text" class="multi-thumb-input" value="${escapeHtml(imgObj.fileName)}" onchange="updateSolutionPhotoName(${idx}, this.value)" title="Edit image path for GitHub" style="width:100%; font-size:0.7rem; font-family:var(--font-mono); padding:2px 4px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.6); color:var(--text-primary); margin-top:4px;">
    `;
    multiImageGrid.appendChild(card);
  });

  aiFileName.textContent = `${solutionImageFiles.length} photo(s) ready`;
}

window.updateSolutionPhotoName = function(index, newName) {
  const cleanName = newName.trim().replace(/^[/\\]+/, '');
  if (index >= 0 && index < solutionImageFiles.length && cleanName) {
    solutionImageFiles[index].fileName = cleanName;
    solutionImageFiles[index].relPath = cleanName;
    if (index === 0) {
      const aiImageNameInput = document.getElementById('ai-image-name-input');
      if (aiImageNameInput) aiImageNameInput.value = cleanName;
    }
    showToast('success', `GitHub image path updated: ${cleanName}`);
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
    localStorage.setItem('qb4_questions', JSON.stringify(questions));
    localStorage.setItem('qb4_local_images', JSON.stringify(localImageStore));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem('qb4_questions') || localStorage.getItem('qb3_questions');
    if (stored) {
      questions = JSON.parse(stored);
      // Auto-wrap any unwrapped LaTeX formulas in existing questions
      questions.forEach(q => {
        q.optionA = ensureMathDelimiters(q.optionA);
        q.optionB = ensureMathDelimiters(q.optionB);
        q.optionC = ensureMathDelimiters(q.optionC);
        q.optionD = ensureMathDelimiters(q.optionD);
        q.question = ensureMathDelimiters(q.question);
        q.main_question = ensureMathDelimiters(q.main_question);
        q.explanation = ensureMathDelimiters(q.explanation);
      });
    }

    const storedImages = localStorage.getItem('qb4_local_images') || localStorage.getItem('qb3_local_images');
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

  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionsList[i], optionsList[j]] = [optionsList[j], optionsList[i]];
  }

  q.optionA = ensureMathDelimiters(optionsList[0].text);
  q.optionB = ensureMathDelimiters(optionsList[1].text);
  q.optionC = ensureMathDelimiters(optionsList[2].text);
  q.optionD = ensureMathDelimiters(optionsList[3].text);

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

CRITICAL REQUIREMENT FOR KATEX MATH:
For ALL math expressions, formulas, variables, equations, and options (optionA, optionB, optionC, optionD, question, main_question, explanation), you MUST ALWAYS wrap them in single dollar signs $...$ for LaTeX math formatting (e.g. "$\\frac{V(s)}{R} = 0$", "$10\\,\\Omega$", "$V(s) = 2.5/s$"). NEVER return unwrapped LaTeX commands like \\frac without $...$.

Task:
1. Analyze all uploaded solution photos from start to finish.
2. Automatically split the circuit problem into logical step-by-step sub-questions.
3. For EACH step:
   - Create a clear Multiple Choice Question (MCQ).
   - Extract the EXACT correct numerical answer, formulas, and equations directly from the solution photos.
   - Generate 3 realistic distractor options (wrong choices), ALL wrapped in $...$ if containing math/LaTeX.
   - Provide the step-by-step LaTeX math explanation derived directly from the solution photos.

Return ONLY a valid raw JSON array of objects:
[
  {
    "stepNumber": 1,
    "stepTitle": "Step 1 Title",
    "question": "Question text with $LaTeX$",
    "optionA": "$Correct option extracted with LaTeX$",
    "optionB": "$Distractor option B with LaTeX$",
    "optionC": "$Distractor option C with LaTeX$",
    "optionD": "$Distractor option D with LaTeX$",
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
    const generatedImageUrl = targetImageFileName ? resolveImageUrl(targetImageFileName) : '';

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
        main_question: ensureMathDelimiters(q.main_question || ''),
        question: ensureMathDelimiters(q.question || ''),
        optionA: ensureMathDelimiters(q.optionA || ''),
        optionB: ensureMathDelimiters(q.optionB || ''),
        optionC: ensureMathDelimiters(q.optionC || ''),
        optionD: ensureMathDelimiters(q.optionD || ''),
        answer: q.answer || 'optionA',
        image: generatedImageUrl,
        explanation: ensureMathDelimiters(q.explanation || ''),
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

CRITICAL REQUIREMENT FOR KATEX MATH:
For ALL math expressions, formulas, variables, equations, and options (optionA, optionB, optionC, optionD, question, main_question, explanation), you MUST ALWAYS wrap them in single dollar signs $...$ for LaTeX math formatting (e.g. "$\\frac{V(s)}{R} = 0$", "$10\\,\\Omega$", "$V(s) = 2.5/s$"). NEVER return unwrapped LaTeX commands like \\frac without $...$.

Your task:
For EACH of the ${stepsList.length} steps listed above, create a clear, high-quality Multiple Choice Question (MCQ) with 4 options (A, B, C, D) wrapped in $...$ math formatting and a step-by-step LaTeX solution. If solution photos are provided, extract exact answers from the photos!

Return ONLY a valid raw JSON array of objects. Format:
[
  {
    "stepNumber": 1,
    "stepTitle": "Short title of step 1",
    "question": "Question text for step 1... (use single dollar $...$ for LaTeX math)",
    "optionA": "$Choice A with LaTeX$",
    "optionB": "$Choice B with LaTeX$",
    "optionC": "$Choice C with LaTeX$",
    "optionD": "$Choice D with LaTeX$",
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
    const generatedImageUrl = targetImageFileName ? resolveImageUrl(targetImageFileName) : '';

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
        main_question: ensureMathDelimiters(q.main_question || ''),
        question: ensureMathDelimiters(q.question || ''),
        optionA: ensureMathDelimiters(q.optionA || ''),
        optionB: ensureMathDelimiters(q.optionB || ''),
        optionC: ensureMathDelimiters(q.optionC || ''),
        optionD: ensureMathDelimiters(q.optionD || ''),
        answer: q.answer || 'optionA',
        image: generatedImageUrl,
        explanation: ensureMathDelimiters(q.explanation || ''),
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
  batchCardEditModes = {};
  renderBatchModalCards();
  modalBatchAi.style.display = 'flex';
}

function renderBatchModalCards() {
  const batchListEl = document.getElementById('batch-list');
  if (!batchListEl) return;
  batchListEl.innerHTML = '';

  const countEl = document.getElementById('batch-count');
  const importCountEl = document.getElementById('batch-import-count');
  if (countEl) countEl.textContent = extractedBatchQuestions.length;
  if (importCountEl) importCountEl.textContent = extractedBatchQuestions.length;

  extractedBatchQuestions.forEach((q, idx) => {
    const isEditing = !!batchCardEditModes[idx];
    const card = document.createElement('div');
    card.className = `batch-card ${isEditing ? 'batch-card-editing' : ''}`;

    const answerLetter = (q.answer || 'optionA').replace('option', '');
    const walkthroughChip = q.walkthrough_tag ? `<span class="walkthrough-tag-badge">${escapeHtml(q.walkthrough_tag)}</span>` : '';

    if (isEditing) {
      card.innerHTML = `
        <div class="batch-card-header" style="background: rgba(99, 102, 241, 0.15); margin: -14px -14px 12px -14px; padding: 10px 14px; border-bottom: 1px solid rgba(99, 102, 241, 0.3);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="batch-card-title">✏️ Editing Step / Part ${idx + 1} (ID: ${q.id || idx+1})</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-xs btn-primary" onclick="toggleEditBatchCard(${idx})">💾 Done</button>
            <button type="button" class="btn-xs btn-danger" onclick="removeBatchCard(${idx})">🗑️ Delete</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:8px;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Main Question Stem (Shared)</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.main_question || '')}" oninput="updateBatchCardField(${idx}, 'main_question', this.value)" placeholder="e.g. For $t < 0$, switch is closed...">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Walkthrough Tag</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.walkthrough_tag || '')}" oninput="updateBatchCardField(${idx}, 'walkthrough_tag', this.value)" placeholder="e.g. Step 1: Initial Conditions">
          </div>
        </div>

        <div style="margin-bottom:8px;">
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Sub-Question Text</label>
          <textarea rows="2" style="width:100%; font-size:0.83rem; padding:6px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" oninput="updateBatchCardField(${idx}, 'question', this.value)" placeholder="Sub-question prompt...">${escapeHtml(q.question || '')}</textarea>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#818cf8; display:block; margin-bottom:2px;">Option A</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.optionA || '')}" oninput="updateBatchCardField(${idx}, 'optionA', this.value)">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#34d399; display:block; margin-bottom:2px;">Option B</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.optionB || '')}" oninput="updateBatchCardField(${idx}, 'optionB', this.value)">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#fbbf24; display:block; margin-bottom:2px;">Option C</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.optionC || '')}" oninput="updateBatchCardField(${idx}, 'optionC', this.value)">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#f87171; display:block; margin-bottom:2px;">Option D</label>
            <input type="text" style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" value="${escapeHtml(q.optionD || '')}" oninput="updateBatchCardField(${idx}, 'optionD', this.value)">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:10px; margin-bottom:8px;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Correct Answer</label>
            <select style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" onchange="updateBatchCardField(${idx}, 'answer', this.value)">
              <option value="optionA" ${q.answer === 'optionA' ? 'selected' : ''}>Option A</option>
              <option value="optionB" ${q.answer === 'optionB' ? 'selected' : ''}>Option B</option>
              <option value="optionC" ${q.answer === 'optionC' ? 'selected' : ''}>Option C</option>
              <option value="optionD" ${q.answer === 'optionD' ? 'selected' : ''}>Option D</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Difficulty Level</label>
            <select style="width:100%; font-size:0.8rem; padding:4px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" onchange="updateBatchCardField(${idx}, 'difficulty', this.value)">
              <option value="1" ${String(q.difficulty) === '1' ? 'selected' : ''}>1 — Easy</option>
              <option value="2" ${String(q.difficulty) === '2' ? 'selected' : ''}>2 — Medium</option>
              <option value="3" ${String(q.difficulty) === '3' ? 'selected' : ''}>3 — Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">Step Explanation ($...$ Math)</label>
          <textarea rows="2" style="width:100%; font-size:0.8rem; padding:6px 8px; border-radius:6px; border:1px solid var(--border-glass); background:rgba(0,0,0,0.4); color:var(--text-primary);" oninput="updateBatchCardField(${idx}, 'explanation', this.value)" placeholder="Step-by-step solution...">${escapeHtml(q.explanation || '')}</textarea>
        </div>
      `;
    } else {
      const mainQBlock = q.main_question ? `<div style="font-size:0.8rem; font-weight:700; color:#a5b4fc; margin-bottom:4px;">Main Q Stem: ${escapeHtml(ensureMathDelimiters(q.main_question))}</div>` : '';

      card.innerHTML = `
        <div class="batch-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="batch-card-title">Step / Part ${idx + 1} (ID: ${q.id || idx+1})</span>
            ${walkthroughChip}
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="answer-chip answer-${answerLetter}">Ans: ${answerLetter}</span>
            <button type="button" class="btn-xs btn-secondary" onclick="toggleEditBatchCard(${idx})" title="Edit sub-question inline">✏️ Edit Card</button>
            <button type="button" class="btn-xs btn-danger" onclick="removeBatchCard(${idx})" title="Remove sub-question">&times;</button>
          </div>
        </div>
        ${mainQBlock}
        <div style="font-size:0.88rem; font-weight:600; margin-bottom:6px;">${escapeHtml(ensureMathDelimiters(q.question))}</div>
        <div class="batch-options-grid">
          <div><strong class="opt-label opt-label-A">A:</strong> <span>${escapeHtml(ensureMathDelimiters(q.optionA))}</span></div>
          <div><strong class="opt-label opt-label-B">B:</strong> <span>${escapeHtml(ensureMathDelimiters(q.optionB))}</span></div>
          <div><strong class="opt-label opt-label-C">C:</strong> <span>${escapeHtml(ensureMathDelimiters(q.optionC))}</span></div>
          <div><strong class="opt-label opt-label-D">D:</strong> <span>${escapeHtml(ensureMathDelimiters(q.optionD))}</span></div>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; margin-top:8px;" class="batch-katex-expl">
          <strong>Explanation:</strong> ${escapeHtml(ensureMathDelimiters(q.explanation))}
        </div>
      `;
    }

    batchListEl.appendChild(card);
  });

  setTimeout(() => {
    renderKaTeX(batchListEl);
  }, 30);
}

function toggleEditBatchCard(idx) {
  batchCardEditModes[idx] = !batchCardEditModes[idx];
  renderBatchModalCards();
}

function updateBatchCardField(idx, field, val) {
  if (extractedBatchQuestions[idx]) {
    extractedBatchQuestions[idx][field] = val;
  }
}

function removeBatchCard(idx) {
  extractedBatchQuestions.splice(idx, 1);
  const newModes = {};
  Object.keys(batchCardEditModes).forEach(k => {
    const keyNum = parseInt(k);
    if (keyNum > idx) newModes[keyNum - 1] = batchCardEditModes[keyNum];
    else if (keyNum < idx) newModes[keyNum] = batchCardEditModes[keyNum];
  });
  batchCardEditModes = newModes;
  renderBatchModalCards();
  showToast('info', 'Removed sub-question step card');
}

function toggleAllBatchEdit() {
  const anyNonEditing = extractedBatchQuestions.some((_, idx) => !batchCardEditModes[idx]);
  extractedBatchQuestions.forEach((_, idx) => {
    batchCardEditModes[idx] = anyNonEditing;
  });
  const btnToggle = document.getElementById('btn-toggle-all-batch-edit');
  if (btnToggle) {
    btnToggle.textContent = anyNonEditing ? '👁️ Preview All Cards' : '✏️ Edit All Cards Inline';
  }
  renderBatchModalCards();
}

async function refineBatchWithAi() {
  const promptInput = document.getElementById('batch-ai-prompt');
  if (!promptInput) return;
  const userPrompt = promptInput.value.trim();

  if (!userPrompt) {
    showToast('error', 'Please enter instructions for the AI Batch Assistant (e.g. "Change Step 2 answer to C")');
    return;
  }

  const btnRefine = document.getElementById('btn-batch-ai-refine');
  if (btnRefine) {
    btnRefine.disabled = true;
    btnRefine.innerHTML = `<span>Refining sub-questions...</span>`;
  }

  try {
    if (geminiApiKey) {
      const currentBatchJSON = JSON.stringify(extractedBatchQuestions, null, 2);
      const systemPrompt = `
You are an expert Circuit Analysis professor assistant helping edit multi-part sub-question steps.

Current Sub-Questions (JSON):
${currentBatchJSON}

User Instruction for Batch Changes:
"${userPrompt}"

CRITICAL INSTRUCTIONS:
1. ONLY modify or add the specific sub-questions requested. Do NOT wipe or lose other answers or user edits!
2. Ensure LaTeX math formulas in optionA, optionB, optionC, optionD, question, main_question, explanation are always wrapped in $...$ delimiters.
3. Return ONLY a valid JSON array of objects representing the full set of updated sub-question cards.
      `;

      const parts = [{ text: systemPrompt }];
      if (solutionImageFiles && solutionImageFiles.length > 0) {
        solutionImageFiles.forEach(img => {
          parts.push({ inline_data: { mime_type: img.mime, data: img.base64 } });
        });
      }

      const requestBody = {
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const data = await callGeminiApi(requestBody);
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const updatedBatch = JSON.parse(cleanJson);

      if (Array.isArray(updatedBatch) && updatedBatch.length > 0) {
        extractedBatchQuestions = updatedBatch.map(q => ({
          ...q,
          main_question: ensureMathDelimiters(q.main_question),
          question: ensureMathDelimiters(q.question),
          optionA: ensureMathDelimiters(q.optionA),
          optionB: ensureMathDelimiters(q.optionB),
          optionC: ensureMathDelimiters(q.optionC),
          optionD: ensureMathDelimiters(q.optionD),
          explanation: ensureMathDelimiters(q.explanation)
        }));
        showToast('success', 'AI updated the sub-question batch!');
      } else {
        throw new Error('Invalid response from AI');
      }
    } else {
      let modified = false;
      const lowerP = userPrompt.toLowerCase();
      const ansMatch = lowerP.match(/(?:step|part|question|q)\s*(\d+).*?(?:answer|ans).*?\b([a-d])\b/i);
      if (ansMatch) {
        const stepNum = parseInt(ansMatch[1]) - 1;
        const targetOpt = 'option' + ansMatch[2].toUpperCase();
        if (extractedBatchQuestions[stepNum]) {
          extractedBatchQuestions[stepNum].answer = targetOpt;
          modified = true;
          showToast('success', `Updated Step ${stepNum + 1} answer to ${ansMatch[2].toUpperCase()}`);
        }
      }

      if (!modified) {
        showToast('warning', 'Please set your Gemini API key in header to run complex AI prompts! Local fallback applied.');
      }
    }

    promptInput.value = '';
    renderBatchModalCards();

  } catch (err) {
    console.error('Batch AI refinement error:', err);
    showToast('error', 'Batch refinement failed: ' + err.message);
  } finally {
    if (btnRefine) {
      btnRefine.disabled = false;
      btnRefine.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        Apply AI Refinement
      `;
    }
  }
}

// Window global bindings for inline onclick/oninput handlers
window.toggleEditBatchCard = toggleEditBatchCard;
window.updateBatchCardField = updateBatchCardField;
window.removeBatchCard = removeBatchCard;
window.toggleAllBatchEdit = toggleAllBatchEdit;

function importAllBatchQuestions() {
  if (extractedBatchQuestions.length === 0) return;

  extractedBatchQuestions.forEach(q => {
    questions.push({
      id: String(q.id || autoFillId()),
      topicid: String(q.topicid || document.getElementById('q-topicid').value.trim() || '1'),
      main_question: ensureMathDelimiters(q.main_question || ''),
      question: ensureMathDelimiters(q.question || ''),
      optionA: ensureMathDelimiters(q.optionA || ''),
      optionB: ensureMathDelimiters(q.optionB || ''),
      optionC: ensureMathDelimiters(q.optionC || ''),
      optionD: ensureMathDelimiters(q.optionD || ''),
      answer: q.answer || 'optionA',
      image: q.image || '',
      explanation: ensureMathDelimiters(q.explanation || ''),
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

function renderKaTeXMainQuestionPreview() {
  const el = document.getElementById('q-main-question');
  const box = document.getElementById('preview-box-main-question');
  const content = document.getElementById('katex-preview-main-question');
  if (!el || !box || !content) return;

  const text = el.value.trim();
  if (!text) {
    box.style.display = 'none';
    content.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  content.textContent = ensureMathDelimiters(text);
  renderKaTeX(content);
}

function renderKaTeXExplanationPreview() {
  const text = qExplanation.value.trim();
  if (!text) {
    katexPreviewContent.innerHTML = '<span class="preview-empty">Type solution above with $...$ math to preview</span>';
    return;
  }
  katexPreviewContent.textContent = ensureMathDelimiters(text);
  renderKaTeX(katexPreviewContent);
}

function renderKaTeXQuestionPreview() {
  const qEl = document.getElementById('q-question');
  const box = document.getElementById('preview-box-question');
  const content = document.getElementById('katex-preview-question');
  if (!qEl || !box || !content) return;

  const text = qEl.value.trim();
  if (!text) {
    box.style.display = 'none';
    content.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  content.textContent = ensureMathDelimiters(text);
  renderKaTeX(content);
}

function renderKaTeXOptionsPreview() {
  ['optionA', 'optionB', 'optionC', 'optionD'].forEach(optKey => {
    const el = document.getElementById(`q-${optKey}`);
    const singleBox = document.getElementById(`preview-${optKey}`);
    if (el && singleBox) {
      const val = el.value.trim();
      if (val && (val.includes('\\') || val.includes('$') || val.includes('^') || val.includes('_'))) {
        singleBox.style.display = 'block';
        singleBox.textContent = ensureMathDelimiters(val);
        renderKaTeX(singleBox);
      } else {
        singleBox.style.display = 'none';
        singleBox.innerHTML = '';
      }
    }
  });

  const optA = document.getElementById('q-optionA').value.trim();
  const optB = document.getElementById('q-optionB').value.trim();
  const optC = document.getElementById('q-optionC').value.trim();
  const optD = document.getElementById('q-optionD').value.trim();

  const box = document.getElementById('preview-box-options');
  const content = document.getElementById('katex-preview-options');
  if (!box || !content) return;

  const anyNotEmpty = [optA, optB, optC, optD].some(t => t.length > 0);
  const hasMath = [optA, optB, optC, optD].some(t => t.includes('$') || t.includes('\\') || t.includes('^') || t.includes('_'));

  if (!anyNotEmpty || !hasMath) {
    box.style.display = 'none';
    content.innerHTML = '';
    return;
  }

  box.style.display = 'block';
  content.innerHTML = `
    <div><strong class="opt-label opt-label-A">A:</strong> <span>${escapeHtml(ensureMathDelimiters(optA))}</span></div>
    <div><strong class="opt-label opt-label-B">B:</strong> <span>${escapeHtml(ensureMathDelimiters(optB))}</span></div>
    <div><strong class="opt-label opt-label-C">C:</strong> <span>${escapeHtml(ensureMathDelimiters(optC))}</span></div>
    <div><strong class="opt-label opt-label-D">D:</strong> <span>${escapeHtml(ensureMathDelimiters(optD))}</span></div>
  `;
  renderKaTeX(content);
}

function renderAllFormMathPreviews() {
  renderKaTeXMainQuestionPreview();
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
    main_question: document.getElementById('q-main-question') ? ensureMathDelimiters(document.getElementById('q-main-question').value.trim()) : '',
    question: ensureMathDelimiters(document.getElementById('q-question').value.trim()),
    optionA: ensureMathDelimiters(document.getElementById('q-optionA').value.trim()),
    optionB: ensureMathDelimiters(document.getElementById('q-optionB').value.trim()),
    optionC: ensureMathDelimiters(document.getElementById('q-optionC').value.trim()),
    optionD: ensureMathDelimiters(document.getElementById('q-optionD').value.trim()),
    answer: document.getElementById('q-answer').value,
    image: '',
    explanation: ensureMathDelimiters(document.getElementById('q-explanation').value.trim()),
    difficulty: document.getElementById('q-difficulty').value,
    walkthrough_tag: document.getElementById('q-walkthrough-tag').value.trim()
  };

  const rawImageInput = imageNameInput.value.trim();
  if (rawImageInput) {
    questionData.image = resolveImageUrl(rawImageInput);
    const fileNameOnly = rawImageInput.replace(/^[/\\]+/, '');
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
// Image Upload for Question Form with Drag Path
// ============================================

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (file) {
    const relPath = cleanDraggedRelativePath(file.webkitRelativePath || file.name);
    processImageFile(file, relPath);
  }
}

function processImageFile(file, relPath) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('error', 'Image must be under 5MB');
    return;
  }

  const targetPath = relPath || file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageData = e.target.result;
    currentImageFile = file;
    currentImageRelPath = targetPath;

    imagePreview.src = currentImageData;
    uploadPlaceholder.style.display = 'none';
    imagePreviewContainer.style.display = 'block';

    if (!imageNameInput.value.trim() || imageNameInput.value === file.name) {
      imageNameInput.value = targetPath;
    }
    updateGithubUrlPreview();
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  currentImageData = null;
  currentImageFile = null;
  currentImageRelPath = '';
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
      const searchable = `${q.id} ${q.main_question || ''} ${q.question} ${q.optionA} ${q.optionB} ${q.optionC} ${q.optionD} ${q.explanation} ${q.walkthrough_tag || ''}`.toLowerCase();
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

    const mainQBlock = q.main_question ? `<div class="td-main-question"><span class="main-q-badge">MAIN</span>${escapeHtml(ensureMathDelimiters(q.main_question))}</div>` : '';

    tr.innerHTML = `
      <td style="text-align: center;"><input type="checkbox" class="qs-checkbox" data-id="${q.id}" ${isChecked} onchange="toggleSelectQuestion('${q.id}', this.checked)"></td>
      <td class="td-id">${escapeHtml(q.id)}</td>
      <td class="td-topic">${escapeHtml(q.topicid)}</td>
      <td>
        ${mainQBlock}
        <div class="td-question">${escapeHtml(ensureMathDelimiters(q.question))}</div>
      </td>
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

function deselectAllQuestions() {
  if (selectedQuestionIds.size === 0) return;
  const count = selectedQuestionIds.size;
  selectedQuestionIds.clear();
  const selectAllCb = document.getElementById('select-all-qs');
  if (selectAllCb) selectAllCb.checked = false;
  renderTable();
  showToast('success', `Deselected all ${count} questions`);
}

function updateSelectedCountUI() {
  const count = selectedQuestionIds.size;
  if (selectedCountEl) selectedCountEl.textContent = count;
  if (bulkEditCount) bulkEditCount.textContent = count;

  if (btnDeleteSelected) btnDeleteSelected.style.display = count > 0 ? 'inline-flex' : 'none';
  if (btnBulkEdit) btnBulkEdit.style.display = count > 0 ? 'inline-flex' : 'none';
  if (btnDeselectAll) btnDeselectAll.style.display = count > 0 ? 'inline-flex' : 'none';

  const selectAllCb = document.getElementById('select-all-qs');
  if (selectAllCb) selectAllCb.checked = questions.length > 0 && count === questions.length;
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
  if (document.getElementById('q-main-question')) document.getElementById('q-main-question').value = q.main_question || '';
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

    const fileNameOnly = q.image.replace(/^https?:\/\/[^/]+\//, '');
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
  showToast('info', `Loaded Question ${q.id} into editor`);
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
// CSV Import & Export — RFC 4180 Parser
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
        ? confirm('You have ' + questions.length + ' existing questions.\n\nClick OK to REPLACE all with imported data.\nClick Cancel to APPEND imported data (IDs will be renumbered to continue from your existing data).')
          ? 'replace'
          : 'append'
        : 'replace';

      if (action === 'replace') {
        questions = parsed;
        showToast('success', `Imported ${parsed.length} questions cleanly!`);
      } else {
        // Find the current max base ID so imported IDs don't overlap or restart
        const maxExistingBase = questions.reduce((max, q) => {
          const base = parseInt(String(q.id).split('-')[0]) || 0;
          return Math.max(max, base);
        }, 0);

        // Group imported questions by their base ID to preserve sub-question groupings
        // e.g. 201-1, 201-2, 202-1 gets renumbered to maxBase+1, maxBase+2, etc.
        const importedBaseOrder = [];
        const importedBaseMap = {};
        parsed.forEach(q => {
          const oldBase = String(q.id).split('-')[0];
          if (!importedBaseMap.hasOwnProperty(oldBase)) {
            importedBaseMap[oldBase] = maxExistingBase + importedBaseOrder.length + 1;
            importedBaseOrder.push(oldBase);
          }
        });

        const renumbered = parsed.map(q => {
          const parts = String(q.id).split('-');
          const oldBase = parts[0];
          const suffix = parts.slice(1).join('-');
          const newBase = importedBaseMap[oldBase];
          return { ...q, id: suffix ? `${newBase}-${suffix}` : String(newBase) };
        });

        questions = [...questions, ...renumbered];
        showToast('success', `Appended ${parsed.length} questions — IDs renumbered starting from ${maxExistingBase + 1}`);
      }

      saveToStorage();
      renderTable();
      updateStats();
      autoFillId();
    } catch (err) {
      showToast('error', 'Failed to parse CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
  csvImportInput.value = '';
}

/**
 * RFC-4180 Compliant CSV Parser
 */
function parseCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in \r\n
      }
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal !== '' || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length < 3) continue;

    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] !== undefined ? values[idx] : '').trim();
    });

    if (!obj.question && !obj.id) continue;

    results.push({
      id: obj.id || '',
      topicid: obj.topicid || '',
      main_question: ensureMathDelimiters(obj.main_question || obj.mainQuestion || ''),
      question: ensureMathDelimiters(obj.question || ''),
      optionA: ensureMathDelimiters(obj.optionA || ''),
      optionB: ensureMathDelimiters(obj.optionB || ''),
      optionC: ensureMathDelimiters(obj.optionC || ''),
      optionD: ensureMathDelimiters(obj.optionD || ''),
      answer: obj.answer || '',
      image: obj.image || '',
      explanation: ensureMathDelimiters(obj.explanation || ''),
      difficulty: obj.difficulty || '1',
      walkthrough_tag: obj.walkthrough_tag || obj.walkthroughTag || ''
    });
  }

  return results;
}

function generateCSVString() {
  const headers = ['id', 'topicid', 'main_question', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'image', 'explanation', 'difficulty', 'walkthrough_tag'];
  let csv = headers.join(',') + '\r\n';

  questions.forEach(q => {
    const row = headers.map(h => {
      const val = String(q[h] !== undefined && q[h] !== null ? q[h] : '');
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r') || val.includes(':')) {
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
