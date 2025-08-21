// Global variables
let selectedFiles = [];
const API_BASE_URL = 'http://localhost:8000';

// ECG class descriptions
const ECG_CLASSES = {
    'NORM': {
        name: 'Normal ECG',
        description: 'Normal cardiac rhythm and electrical activity',
        type: 'normal',
        icon: 'fas fa-heart'
    },
    'CD': {
        name: 'Conduction Disturbance',
        description: 'Abnormal electrical conduction in the heart',
        type: 'abnormal',
        icon: 'fas fa-exclamation-triangle'
    },
    'HYP': {
        name: 'Hypertrophy',
        description: 'Enlarged heart muscle',
        type: 'abnormal',
        icon: 'fas fa-arrow-up'
    },
    'MI': {
        name: 'Myocardial Infarction',
        description: 'Heart attack - damaged heart muscle',
        type: 'critical',
        icon: 'fas fa-heart-broken'
    },
    'STTC': {
        name: 'ST/T Change',
        description: 'Abnormal ST segment or T wave changes',
        type: 'abnormal',
        icon: 'fas fa-wave-square'
    },
    'LVH': {
        name: 'Left Ventricular Hypertrophy',
        description: 'Enlarged left ventricle',
        type: 'abnormal',
        icon: 'fas fa-expand'
    },
    'LAFB': {
        name: 'Left Anterior Fascicular Block',
        description: 'Blocked electrical pathway in left ventricle',
        type: 'abnormal',
        icon: 'fas fa-project-diagram'
    },
    'ISC_': {
        name: 'Ischemic',
        description: 'Reduced blood flow to heart muscle',
        type: 'abnormal',
        icon: 'fas fa-bolt'
    },
    'IRBBB': {
        name: 'Incomplete Right Bundle Branch Block',
        description: 'Partial blockage in right bundle branch',
        type: 'abnormal',
        icon: 'fas fa-ban'
    },
    'IVCD': {
        name: 'Intraventricular Conduction Disturbance',
        description: 'Abnormal conduction within ventricles',
        type: 'abnormal',
        icon: 'fas fa-random'
    }
};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('ecgFile');
const filePreview = document.getElementById('filePreview');
const fileList = document.getElementById('fileList');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsSection = document.getElementById('resultsSection');
const resultContent = document.getElementById('resultContent');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults);
        document.body.addEventListener(eventName, preventDefaults);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        return;
    }
    
    // Validate files
    const validation = validateFiles(selectedFiles);
    if (!validation.valid) {
        showNotification(validation.message, 'error');
        return;
    }
    
    displayFilePreview();
    updateUploadState();
}

function validateFiles(files) {
    const allowedExtensions = ['.dat', '.hea'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (files.length === 0) {
        return { valid: false, message: 'Please select files to upload.' };
    }
    
    // Check if we have both .dat and .hea files
    const extensions = files.map(file => {
        const name = file.name.toLowerCase();
        return name.substring(name.lastIndexOf('.'));
    });
    
    const hasRequiredFiles = allowedExtensions.every(ext => 
        extensions.includes(ext)
    );
    
    if (!hasRequiredFiles) {
        return { 
            valid: false, 
            message: 'Please upload both .dat and .hea files for the same ECG record.' 
        };
    }
    
    // Check file sizes
    for (let file of files) {
        if (file.size > maxSize) {
            return { 
                valid: false, 
                message: `File "${file.name}" is too large. Maximum size is 10MB.` 
            };
        }
    }
    
    return { valid: true };
}

function displayFilePreview() {
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });
    
    filePreview.style.display = 'block';
}

function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item fade-in';
    
    const extension = file.name.toLowerCase().split('.').pop();
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon ${extension}">
                <i class="fas fa-file-${extension === 'dat' ? 'chart-line' : 'list'}"></i>
            </div>
            <div class="file-details">
                <h5>${file.name}</h5>
                <span>${fileSize}</span>
            </div>
        </div>
        <button class="btn btn-secondary" onclick="removeFile(${index})" style="padding: 0.5rem;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return fileItem;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    
    if (selectedFiles.length === 0) {
        filePreview.style.display = 'none';
        updateUploadState();
    } else {
        displayFilePreview();
    }
}

function clearFiles() {
    selectedFiles = [];
    fileInput.value = '';
    filePreview.style.display = 'none';
    resultsSection.style.display = 'none';
    updateUploadState();
}

function updateUploadState() {
    const hasFiles = selectedFiles.length > 0;
    
    analyzeBtn.disabled = !hasFiles;
    clearBtn.style.display = hasFiles ? 'inline-flex' : 'none';
    
    // Update upload area content
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadTitle = document.getElementById('uploadTitle');
    const uploadSubtitle = document.getElementById('uploadSubtitle');
    
    if (hasFiles) {
        uploadIcon.className = 'fas fa-check-circle';
        uploadTitle.textContent = `${selectedFiles.length} file(s) selected`;
        uploadSubtitle.textContent = 'Ready for analysis';
    } else {
        uploadIcon.className = 'fas fa-file-medical';
        uploadTitle.textContent = 'Drag & Drop ECG Files';
        uploadSubtitle.textContent = 'or click to browse files';
    }
}

async function uploadFiles() {
    if (selectedFiles.length === 0) {
        showNotification('Please select files first.', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        
        showNotification('Analyzing ECG data...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/predict_file`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Analysis failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result);
            showNotification('ECG analysis completed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification(`Analysis failed: ${error.message}`, 'error');
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(loading) {
    const btnContent = analyzeBtn.querySelector('.btn-content');
    const loadingSpinner = analyzeBtn.querySelector('.loading-spinner');
    
    if (loading) {
        btnContent.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        analyzeBtn.disabled = true;
    } else {
        btnContent.style.display = 'flex';
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = selectedFiles.length === 0;
    }
}

function displayResults(result) {
    const classInfo = ECG_CLASSES[result.predicted_class] || {
        name: result.predicted_class,
        description: 'Unknown classification',
        type: 'abnormal',
        icon: 'fas fa-question'
    };
    
    const confidence = result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A';
    
    resultContent.innerHTML = `
        <div class="prediction-result ${classInfo.type} slide-up">
            <div class="result-icon ${classInfo.type}">
                <i class="${classInfo.icon}"></i>
            </div>
            <div class="result-label">${classInfo.name}</div>
            <div class="result-description">${classInfo.description}</div>
            <div class="confidence-score">
                <i class="fas fa-chart-bar"></i>
                <span>Confidence: ${confidence}%</span>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-item fade-in" style="animation-delay: 0.1s">
                <div class="stat-icon">
                    <i class="fas fa-list-ol"></i>
                </div>
                <div class="stat-value">${result.predicted_class_index}</div>
                <div class="stat-label">Class Index</div>
            </div>
            <div class="stat-item fade-in" style="animation-delay: 0.2s">
                <div class="stat-icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <div class="stat-value">${result.ecg_stats.num_leads}</div>
                <div class="stat-label">ECG Leads</div>
            </div>
            <div class="stat-item fade-in" style="animation-delay: 0.3s">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-value">${result.ecg_stats.signal_length}</div>
                <div class="stat-label">Signal Length</div>
            </div>
            <div class="stat-item fade-in" style="animation-delay: 0.4s">
                <div class="stat-icon">
                    <i class="fas fa-chart-area"></i>
                </div>
                <div class="stat-value">${result.ecg_stats.mean_amplitude.toFixed(3)}</div>
                <div class="stat-label">Mean Amplitude</div>
            </div>
            <div class="stat-item fade-in" style="animation-delay: 0.5s">
                <div class="stat-icon">
                    <i class="fas fa-signal"></i>
                </div>
                <div class="stat-value">${result.ecg_stats.std_amplitude.toFixed(3)}</div>
                <div class="stat-label">Std Amplitude</div>
            </div>
            <div class="stat-item fade-in" style="animation-delay: 0.6s">
                <div class="stat-icon">
                    <i class="fas fa-arrows-alt-v"></i>
                </div>
                <div class="stat-value">${(result.ecg_stats.max_amplitude - result.ecg_stats.min_amplitude).toFixed(3)}</div>
                <div class="stat-label">Amplitude Range</div>
            </div>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageElement = notification.querySelector('.notification-message');
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    icon.className = `notification-icon ${icons[type]}`;
    messageElement.textContent = message;
    
    // Reset classes and add type
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
