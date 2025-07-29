// 全局状态钥匙这组
let currentRepo = '';
let currentPath = '';
let currentFiles = [];
let githubToken = '';
let fileToDelete = null;
let selectedFiles = new Set();
let contextMenuTarget = null;
let currentUser = null;
let buildTimer = null;
let buildStatus = null;
// 使用Map存储每个仓库的Pages状态
let pagesEnabledMap = new Map();

// 编辑器相关变量
let editor = null;
let currentEditingFile = null;
let monacoInitialized = false;

// 滚动相关变量
let scrollTimeout;
let lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
let isScrolling = false;
let lastScrollDirection = null;

// 文本文件扩展名列表
const textFileExtensions = ['txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less', 'json', 'xml', 'yml', 'yaml', 'md', 'ini', 'conf', 'cfg', 'env', 'gitignore', 'log', 'sh', 'bash', 'zsh', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'swift', 'kt', 'dart', 'lua', 'rb', 'pl', 'r', 'm', 'php'];

// Monaco Editor语言映射
const languageMapping = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'lua': 'lua',
    'rb': 'ruby',
    'pl': 'perl',
    'r': 'r',
    'm': 'matlab',
    'php': 'php'
};

// DOM 元素
const forkRepoBtn = document.getElementById('fork-repo-btn');
const forkRepoDialog = document.getElementById('fork-repo-dialog');
const forkRepoUrl = document.getElementById('fork-repo-url');
const forkRepoConfirm = document.getElementById('fork-repo-confirm');
const forkRepoCancel = document.getElementById('fork-repo-cancel');
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const authBtn = document.getElementById('auth-btn');
const authBtnText = document.getElementById('auth-btn-text');
const authSpinner = document.getElementById('auth-spinner');
const githubTokenInput = document.getElementById('github-token');
const tokenError = document.getElementById('token-error');
const backBtn = document.getElementById('back-btn');
const refreshBtn = document.getElementById('refresh-btn');
const currentPathElement = document.getElementById('current-path');
const fileListElement = document.getElementById('file-list');
const loadingElement = document.getElementById('loading');
const emptyStateElement = document.getElementById('empty-state');
const toolbar = document.getElementById('toolbar');
const uploadBtn = document.getElementById('upload-btn');
const newFolderBtn = document.getElementById('new-folder-btn');
const newRepoBtn = document.getElementById('new-repo-btn');
const selectBtn = document.getElementById('select-btn');
const toastElement = document.getElementById('toast');
const confirmDialog = document.getElementById('confirm-dialog');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
const newFolderDialog = document.getElementById('new-folder-dialog');
const newFolderName = document.getElementById('new-folder-name');
const newFolderCreate = document.getElementById('new-folder-create');
const newFolderCancel = document.getElementById('new-folder-cancel');
const newRepoDialog = document.getElementById('new-repo-dialog');
const newRepoName = document.getElementById('new-repo-name');
const newRepoDesc = document.getElementById('new-repo-desc');
const newRepoPrivate = document.getElementById('new-repo-private');
const newRepoCreate = document.getElementById('new-repo-create');
const newRepoCancel = document.getElementById('new-repo-cancel');
const uploadDialog = document.getElementById('upload-dialog');
const fileInput = document.getElementById('file-input');
const uploadFile = document.getElementById('upload-file');
const uploadCancel = document.getElementById('upload-cancel');
const contextMenu = document.getElementById('context-menu');
const contextOpen = document.getElementById('context-open');
const contextDownload = document.getElementById('context-download');
const contextRename = document.getElementById('context-rename');
const contextCopyLink = document.getElementById('context-copy-link');
const contextCopyProxyLink = document.getElementById('context-copy-proxy-link');
const contextDelete = document.getElementById('context-delete');
const contextEnablePages = document.getElementById('context-enable-pages');
const contextBuildApp = document.getElementById('context-build-app');
const contextDownloadSource = document.getElementById('context-download-source');
const batchToolbar = document.getElementById('batch-toolbar');
const selectedCount = document.getElementById('selected-count');
const batchDownloadBtn = document.getElementById('batch-download-btn');
const batchDeleteBtn = document.getElementById('batch-delete-btn');
const batchCancelBtn = document.getElementById('batch-cancel-btn');
const userMenuBtn = document.getElementById('user-menu-btn');
const userMenuContent = document.getElementById('user-menu-content');
const usernameElement = document.getElementById('username');
const logoutBtn = document.getElementById('logout-btn');
const staticSiteBtn = document.getElementById('static-site-btn');
const staticSiteDialog = document.getElementById('static-site-dialog');
const pagesBranch = document.getElementById('pages-branch');
const pagesFolder = document.getElementById('pages-folder');
const pagesStatus = document.getElementById('pages-status');
const pagesUrl = document.getElementById('pages-url');
const staticSiteEnable = document.getElementById('static-site-enable');
const staticSiteCancel = document.getElementById('static-site-cancel');
const buildStatusEl = document.getElementById('build-status');
const buildIcon = document.getElementById('build-icon');
const buildMessage = document.getElementById('build-message');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const closeBuildStatus = document.getElementById('close-build-status');
const editorSaveBtn = document.getElementById('editor-save-btn');
const editorCloseBtn = document.getElementById('editor-close-btn');
const editorFilename = document.getElementById('editor-filename');
const editorFileSize = document.getElementById('editor-file-size');
const editorLanguage = document.getElementById('editor-language');

// 移动设备工具栏元素
const mobileSaveBtn = document.getElementById('mobile-save-btn');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const mobileUndoBtn = document.getElementById('mobile-undo-btn');
const mobileRedoBtn = document.getElementById('mobile-redo-btn');
const mobileSearchBtn = document.getElementById('mobile-search-btn');

// 文件类型图标映射
const fileTypeIcons = {
    // 工作流文件
    yml: 'fas fa-gears workflow-icon',
    yaml: 'fas fa-gears workflow-icon',
    // 压缩文件
    zip: 'fas fa-file-archive archive-icon',
    rar: 'fas fa-file-archive archive-icon',
    '7z': 'fas fa-file-archive archive-icon',
    tar: 'fas fa-file-archive archive-icon',
    gz: 'fas fa-file-archive archive-icon',
    bz2: 'fas fa-file-archive archive-icon',
    xz: 'fas fa-file-archive archive-icon',
    lz: 'fas fa-file-archive archive-icon',
    dmg: 'fas fa-file-archive archive-icon',
    iso: 'fas fa-file-archive archive-icon',
    
    // 可执行文件
    exe: 'fas fa-file-code exe-icon',
    msi: 'fas fa-file-code exe-icon',
    app: 'fas fa-file-code exe-icon',
    apk: 'fas fa-file-code exe-icon',
    deb: 'fas fa-file-code exe-icon',
    rpm: 'fas fa-file-code exe-icon',
    bat: 'fas fa-file-code exe-icon',
    cmd: 'fas fa-file-code exe-icon',
    
    // 图片
    png: 'fas fa-file-image image-icon',
    jpg: 'fas fa-file-image image-icon',
    jpeg: 'fas fa-file-image image-icon',
    gif: 'fas fa-file-image image-icon',
    svg: 'fas fa-file-image image-icon',
    webp: 'fas fa-file-image image-icon',
    ico: 'fas fa-file-image image-icon',
    bmp: 'fas fa-file-image image-icon',
    tiff: 'fas fa-file-image image-icon',
    psd: 'fas fa-file-image image-icon',
    ai: 'fas fa-file-image image-icon',
    
    // 代码文件
    css: 'fas fa-file-code code-icon',
    scss: 'fas fa-file-code code-icon',
    less: 'fas fa-file-code code-icon',
    js: 'fas fa-file-code code-icon',
    jsx: 'fas fa-file-code code-icon',
    ts: 'fas fa-file-code code-icon',
    tsx: 'fas fa-file-code code-icon',
    json: 'fas fa-file-code code-icon',
    html: 'fas fa-file-code code-icon',
    htm: 'fas fa-file-code code-icon',
    xml: 'fas fa-file-code code-icon',
    yml: 'fas fa-file-code code-icon',
    yaml: 'fas fa-file-code code-icon',
    php: 'fas fa-file-code code-icon',
    py: 'fas fa-file-code code-icon',
    java: 'fas fa-file-code code-icon',
    c: 'fas fa-file-code code-icon',
    cpp: 'fas fa-file-code code-icon',
    h: 'fas fa-file-code code-icon',
    hpp: 'fas fa-file-code code-icon',
    cs: 'fas fa-file-code code-icon',
    go: 'fas fa-file-code code-icon',
    rs: 'fas fa-file-code code-icon',
    sh: 'fas fa-file-code code-icon',
    bash: 'fas fa-file-code code-icon',
    zsh: 'fas fa-file-code code-icon',
    swift: 'fas fa-file-code code-icon',
    kt: 'fas fa-file-code code-icon',
    dart: 'fas fa-file-code code-icon',
    lua: 'fas fa-file-code code-icon',
    rb: 'fas fa-file-code code-icon',
    pl: 'fas fa-file-code code-icon',
    r: 'fas fa-file-code code-icon',
    m: 'fas fa-file-code code-icon',
    
    // 文本文件
    txt: 'fas fa-file-alt text-icon',
    md: 'fas fa-file-alt text-icon',
    markdown: 'fas fa-file-alt text-icon',
    log: 'fas fa-file-alt text-icon',
    rtf: 'fas fa-file-alt text-icon',
    
    // 文档
    pdf: 'fas fa-file-pdf text-red-500',
    doc: 'fas fa-file-word text-blue-600',
    docx: 'fas fa-file-word text-blue-600',
    xls: 'fas fa-file-excel text-green-600',
    xlsx: 'fas fa-file-excel text-green-600',
    ppt: 'fas fa-file-powerpoint text-orange-600',
    pptx: 'fas fa-file-powerpoint text-orange-600',
    csv: 'fas fa-file-csv text-green-600',
    odt: 'fas fa-file-word text-blue-600',
    ods: 'fas fa-file-excel text-green-600',
    odp: 'fas fa-file-powerpoint text-orange-600',
    
    // 数据库
    sql: 'fas fa-database text-blue-500',
    db: 'fas fa-database text-blue-500',
    sqlite: 'fas fa-database text-blue-500',
    mdb: 'fas fa-database text-blue-500',
    
    // 配置
    ini: 'fas fa-cog text-gray-500',
    cfg: 'fas fa-cog text-gray-500',
    conf: 'fas fa-cog text-gray-500',
    gitignore: 'fas fa-code-branch text-gray-500',
    env: 'fas fa-key text-yellow-500',
    
    // 字体
    ttf: 'fas fa-font text-purple-500',
    otf: 'fas fa-font text-purple-500',
    woff: 'fas fa-font text-purple-500',
    woff2: 'fas fa-font text-purple-500',
    
    // 视频
    mp4: 'fas fa-file-video text-red-400',
    mov: 'fas fa-file-video text-red-400',
    avi: 'fas fa-file-video text-red-400',
    mkv: 'fas fa-file-video text-red-400',
    flv: 'fas fa-file-video text-red-400',
    wmv: 'fas fa-file-video text-red-400',
    
    // 音频
    mp3: 'fas fa-file-audio text-blue-400',
    wav: 'fas fa-file-audio text-blue-400',
    ogg: 'fas fa-file-audio text-blue-400',
    flac: 'fas fa-file-audio text-blue-400',
    aac: 'fas fa-file-audio text-blue-400',
    
    // 其他
    lock: 'fas fa-lock text-gray-500',
    license: 'fas fa-file-signature text-gray-500',
    dockerfile: 'fab fa-docker text-blue-400',
    makefile: 'fas fa-file-code code-icon',
    procfile: 'fas fa-file-code code-icon',
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查本地存储中是否有 token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
        githubToken = savedToken;
        githubTokenInput.value = '********';
        verifyToken();
    }

    // 用户菜单事件
    userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenuContent.classList.toggle('show');
    });
    
    // 点击其他地方隐藏用户菜单
    document.addEventListener('click', () => {
        userMenuContent.classList.remove('show');
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', () => {
        logout();
    });
    
    // 确认对话框事件监听
    confirmYes.addEventListener('click', () => {
        if (fileToDelete) {
            if (Array.isArray(fileToDelete)) {
                deleteFiles(fileToDelete);
            } else if (fileToDelete.type === 'repo') {
                deleteRepository(fileToDelete);
            } else {
                deleteFile(fileToDelete);
            }
        }
        hideConfirmDialog();
    });
    
    confirmNo.addEventListener('click', () => {
        hideConfirmDialog();
    });
    
    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            hideConfirmDialog();
        }
    });
    
    // 新建文件夹对话框事件监听
    newFolderBtn.addEventListener('click', () => {
        showNewFolderDialog();
    });
    
    newFolderCreate.addEventListener('click', () => {
        const folderName = newFolderName.value.trim();
        if (folderName) {
            createFolder(folderName);
            hideNewFolderDialog();
        } else {
            showToast('请输入文件夹名称');
        }
    });
    
    newFolderCancel.addEventListener('click', () => {
        hideNewFolderDialog();
    });
    
    newFolderDialog.addEventListener('click', (e) => {
        if (e.target === newFolderDialog) {
            hideNewFolderDialog();
        }
    });
    
    // 新建仓库对话框事件监听
    newRepoBtn.addEventListener('click', () => {
        showNewRepoDialog();
    });
    
    newRepoCreate.addEventListener('click', () => {
        const repoName = newRepoName.value.trim();
        if (repoName) {
            createRepository(repoName, newRepoDesc.value.trim(), newRepoPrivate.checked);
            hideNewRepoDialog();
        } else {
            showToast('请输入仓库名称');
        }
    });
    
    newRepoCancel.addEventListener('click', () => {
        hideNewRepoDialog();
    });
    
    newRepoDialog.addEventListener('click', (e) => {
        if (e.target === newRepoDialog) {
            hideNewRepoDialog();
        }
    });
    
    // 上传文件对话框事件监听
    uploadBtn.addEventListener('click', () => {
        showUploadDialog();
    });
    
    uploadFile.addEventListener('click', () => {
        if (fileInput.files.length > 0) {
            uploadSelectedFile();
            hideUploadDialog();
        } else {
            showToast('请选择要上传的文件');
        }
    });
    
    uploadCancel.addEventListener('click', () => {
        hideUploadDialog();
    });
    
    uploadDialog.addEventListener('click', (e) => {
        if (e.target === uploadDialog) {
            hideUploadDialog();
        }
    });
    
    // 选择模式按钮
    selectBtn.addEventListener('click', () => {
        toggleSelectMode();
    });
    
    // 批量操作按钮
    batchDownloadBtn.addEventListener('click', () => {
        downloadSelectedFiles();
    });
    
    batchDeleteBtn.addEventListener('click', () => {
        if (selectedFiles.size > 0) {
            showConfirmDialog(
                '确认删除',
                `您确定要删除选中的 ${selectedFiles.size} 个文件吗？此操作不可撤销。`,
                Array.from(selectedFiles)
            );
        }
    });
    
    batchCancelBtn.addEventListener('click', () => {
        exitSelectMode();
    });
    
    // 上下文菜单事件
    contextOpen.addEventListener('click', () => {
        if (contextMenuTarget) {
            openContextItem(contextMenuTarget);
        }
        hideContextMenu();
    });
    
    contextDownload.addEventListener('click', () => {
        if (contextMenuTarget) {
            downloadFile(contextMenuTarget);
        }
        hideContextMenu();
    });
    
    contextRename.addEventListener('click', () => {
        if (contextMenuTarget) {
            renameFile(contextMenuTarget);
        }
        hideContextMenu();
    });
    
    // 复制功能
    contextCopyLink.addEventListener('click', (e) => {
    e.stopPropagation();
    if (contextMenuTarget && contextMenuTarget.type === 'file') {
        // 使用原始下载URL
        copyToClipboard(contextMenuTarget.download_url, 'Raw 链接已复制');
    }
    hideContextMenu();
});

contextCopyProxyLink.addEventListener('click', (e) => {
    e.stopPropagation();
    if (contextMenuTarget && contextMenuTarget.type === 'file') {
        const [owner, repoName] = currentRepo.split('/');
        const filePath = currentPath ? 
            `${currentPath}/${contextMenuTarget.name}` : 
            contextMenuTarget.name;
        
        // 使用更可靠的CDN URL格式
        const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
        const jsdelivrLink = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@HEAD/${encodedPath}`;
        
        copyToClipboard(jsdelivrLink, 'CDN 链接已复制');
    }
    hideContextMenu();
});

// 增强复制功能，添加兼容性处理
function copyToClipboard(text, successMessage) {
    // 创建隐藏的textarea元素
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        // 尝试使用现代API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMessage);
            });
        } else {
            // 使用兼容性方法
            document.execCommand('copy');
            showToast(successMessage);
        }
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败: ' + err.message);
    } finally {
        // 清理
        document.body.removeChild(textArea);
    }
}
    
    contextDelete.addEventListener('click', () => {
        if (contextMenuTarget) {
            if (contextMenuTarget.type === 'repo') {
                showConfirmDialog(
                    '确认删除仓库',
                    `您确定要删除仓库 "${contextMenuTarget.name}" 吗？此操作不可撤销且会删除所有仓库内容。`,
                    contextMenuTarget
                );
            } else {
                showConfirmDialog(
                    '确认删除',
                    `您确定要删除 "${contextMenuTarget.name}" 吗？此操作不可撤销。`,
                    contextMenuTarget
                );
            }
        }
        hideContextMenu();
    });
    
    // 启用网站菜单项点击 - 重构后的逻辑
    contextEnablePages.addEventListener('click', async () => {
    if (!contextMenuTarget) return;
    
    // 立即更新按钮状态
    const menuItem = contextEnablePages;
    const originalHTML = menuItem.innerHTML;
    menuItem.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>处理中...</span>';
    
    const targetRepo = getTargetRepo(contextMenuTarget);
    const isEnabled = pagesEnabledMap.get(targetRepo) || false;
    
    try {
        if (isEnabled) {
            await disableGitHubPages(targetRepo);
        } else {
            // 显示对话框前先检查当前状态
            await checkPagesStatus(targetRepo);
            showStaticSiteDialog(contextMenuTarget);
        }
    } catch (error) {
        console.error('操作失败:', error);
        showToast(`操作失败: ${error.message}`);
    } finally {
        // 恢复按钮状态
        menuItem.innerHTML = originalHTML;
        hideContextMenu();
    }
});
    
    // 运行工作流菜单项点击
    contextBuildApp.addEventListener('click', () => {
        if (contextMenuTarget) {
            buildApp(contextMenuTarget);
        }
        hideContextMenu();
    });

    // 下载源码菜单项点击
    contextDownloadSource.addEventListener('click', () => {
        if (contextMenuTarget) {
            downloadRepositorySource(contextMenuTarget);
        }
        hideContextMenu();
    });
    
    // 点击菜单外部隐藏上下文菜单
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });
    
    // 静态网站按钮事件
    staticSiteBtn.addEventListener('click', () => {
        showStaticSiteDialog();
    });
    
    // 静态网站对话框事件
    staticSiteEnable.addEventListener('click', () => {
        enableGitHubPages();
    });
    
    staticSiteCancel.addEventListener('click', () => {
        hideStaticSiteDialog();
    });
    
    staticSiteDialog.addEventListener('click', (e) => {
        if (e.target === staticSiteDialog) {
            hideStaticSiteDialog();
        }
    });
    
    // 关闭构建状态提示
    closeBuildStatus.addEventListener('click', () => {
        buildStatusEl.classList.add('hidden');
        clearInterval(buildTimer);
        buildStatus = null;
    });
    
    // 复刻仓库按钮事件
    forkRepoBtn.addEventListener('click', () => {
        showForkRepoDialog();
    });

    // 复刻仓库对话框事件
    forkRepoConfirm.addEventListener('click', () => {
        const repoUrl = forkRepoUrl.value.trim();
        if (repoUrl) {
            forkRepository(repoUrl);
        } else {
            showToast('请输入GitHub仓库URL');
        }
    });

    forkRepoCancel.addEventListener('click', () => {
        hideForkRepoDialog();
    });

    forkRepoDialog.addEventListener('click', (e) => {
        if (e.target === forkRepoDialog) {
            hideForkRepoDialog();
        }
    });

    // 滚动事件监听
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                isTicking = false;
            });
            isTicking = true;
        }
    });

    // 初始显示工具栏
    showToolbar();

    // 编辑器相关事件监听
    editorSaveBtn.addEventListener('click', saveFileChanges);
    editorCloseBtn.addEventListener('click', closeEditor);

    // 移动设备工具栏事件
    mobileSaveBtn?.addEventListener('click', saveFileChanges);
    mobileCloseBtn?.addEventListener('click', closeEditor);
    mobileUndoBtn?.addEventListener('click', () => {
        if (editor) editor.getModel().undo();
    });
    mobileRedoBtn?.addEventListener('click', () => {
        if (editor) editor.getModel().redo();
    });
    mobileSearchBtn?.addEventListener('click', () => {
        if (editor) {
            editor.focus();
            editor.trigger('', 'actions.find');
        }
    });

    // 动态加载Monaco Editor
    const monacoScript = document.createElement('script');
    monacoScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs/loader.min.js';
    monacoScript.onload = function() {
        // 确保require对象存在
        window.require = window.require || {};
        window.require.config = window.require.config || function(config) {
            if (config.paths) {
                this.paths = config.paths;
            }
        };
        // 配置Monaco路径
        window.require.config({
            paths: { 
                'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs' 
            }
        });
    };
    document.head.appendChild(monacoScript);
});

// 初始化编辑器
function initEditor() {
    if (monacoInitialized) return;
    
    // 确保require已配置
    if (window.require && window.require.config) {
        window.require.config({
            paths: { 
                'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/min/vs' 
            }
        });
    }
    
    try {
        // 使用全局require函数
        window.require(['vs/editor/editor.main'], function() {
            try {
                const editorOptions = {
                    value: '',
                    language: 'text',
                    theme: 'vs',
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    wrappingIndent: 'indent'
                };

                // 移动设备特定配置
                if (window.innerWidth <= 768) {
                    editorOptions.minimap = { enabled: false };
                    editorOptions.fontSize = 10;
                    editorOptions.lineHeight = 16;
                }

                editor = monaco.editor.create(document.getElementById('editor'), editorOptions);
                
                monacoInitialized = true;
                
                // 添加键盘快捷键 (Ctrl+S / Cmd+S)
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
                    saveFileChanges();
                });

                // 添加虚拟键盘检测
                if (window.innerWidth <= 768) {
                    window.addEventListener('resize', handleMobileKeyboard);
                }
            } catch (createError) {
                console.error('创建Monaco编辑器实例失败:', createError);
            }
        });
    } catch (error) {
        console.error('加载Monaco编辑器失败:', error);
    }
}

// 处理移动设备键盘弹出
function handleMobileKeyboard() {
    if (!editor) return;
    
    const editorContainer = document.getElementById('editor-container');
    const editorElement = document.getElementById('editor');
    
    if (window.innerHeight < window.outerHeight * 0.9) {
        // 键盘弹出时
        editorContainer.style.position = 'absolute';
        editorContainer.style.top = '0';
        editorContainer.style.height = (window.innerHeight - 100) + 'px';
        editorElement.style.height = (window.innerHeight - 150) + 'px';
    } else {
        // 键盘收起时
        editorContainer.style.position = 'fixed';
        editorContainer.style.height = '100%';
        editorElement.style.height = '';
    }
    
    editor.layout();
}

// 设置编辑器内容
function setEditorContent(content, fileExt) {
    editor.setValue(content);
    
    // 设置编辑器语言
    const language = languageMapping[fileExt] || 'text';
    monaco.editor.setModelLanguage(editor.getModel(), language);
    
    // 更新UI
    editorFilename.textContent = currentEditingFile.name;
    editorFileSize.textContent = formatFileSize(currentEditingFile.size);
    editorLanguage.textContent = language.toUpperCase();
    
    // 显示编辑器
    document.getElementById('editor-container').style.display = 'flex';
    document.getElementById('editor-container').classList.remove("hidden")
    
    // 设置焦点
    setTimeout(() => editor.focus(), 100);
}

// 打开文件编辑器
async function openFileInEditor(fileInfo) {
    // 检查文件大小 (<1MB)
    if (fileInfo.size > 1024 * 1024) {
        showToast('文件过大，请在浏览器中查看');
        window.open(fileInfo.download_url, '_blank');
        return;
    }
    
    // 检查文件类型
    const fileExt = fileInfo.name.split('.').pop().toLowerCase();
    if (!textFileExtensions.includes(fileExt)) {
        showToast('不支持编辑此文件类型');
        window.open(fileInfo.download_url, '_blank');
        return;
    }
    
    try {
        showToast('正在加载文件内容...');
        currentEditingFile = fileInfo;                       
        // 获取文件原始内容
        const response = await fetch(fileInfo.download_url);
        if (!response.ok) throw new Error('获取文件内容失败');
        
        const content = await response.text();
        
        // 初始化编辑器（如果尚未初始化）
        if (!monacoInitialized) {
            try {
                initEditor();
            } catch (e) {
                console.error('Monaco初始化失败:', e);
                // 初始化失败，则直接打开文件
                showToast('编辑器加载失败，将在新标签页打开文件');
                window.open(fileInfo.download_url, '_blank');
                return;
            }
        }
        
        // 如果editor实例不存在，则尝试创建（可能因为异步加载还未完成）
        if (!editor) {
            // 等待一段时间，如果还没有则打开文件
            let waitCount = 0;
            const waitInterval = setInterval(() => {
                if (editor) {
                    clearInterval(waitInterval);
                    setEditorContent(content, fileExt);
                } else if (waitCount >= 10) { // 10次，每次100ms，共1秒
                    clearInterval(waitInterval);
                    showToast('编辑器加载超时，将在新标签页打开文件');
                    window.open(fileInfo.download_url, '_blank');
                }
                waitCount++;
            }, 100);
        } else {
            setEditorContent(content, fileExt);
        }
    } catch (error) {
        console.error('打开编辑器失败:', error);
        showToast('加载文件失败: ' + error.message);
    }
}

// 保存文件修改
async function saveFileChanges() {
    if (!editor || !currentEditingFile) return;
    
    try {
        const newContent = editor.getValue();
        
        // 获取文件SHA
        const shaResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${currentEditingFile.name}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!shaResponse.ok) {
            throw new Error('获取文件信息失败');
        }
        
        const shaData = await shaResponse.json();
        const sha = shaData.sha;
        
        // 更新文件
        const updateResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${currentEditingFile.name}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `更新 ${currentEditingFile.name}`,
                    content: btoa(unescape(encodeURIComponent(newContent))),
                    sha: sha
                })
            }
        );
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || '保存文件失败');
        }
        
        showToast('文件保存成功');
        closeEditor();
        
        // 刷新文件列表
        loadRepositoryContents(currentRepo, currentPath);
        
    } catch (error) {
        console.error('保存文件失败:', error);
        showToast('保存失败: ' + error.message);
    }
}

// 关闭编辑器
function closeEditor() {
    document.getElementById('editor-container').style.display = 'none';
    currentEditingFile = null;
}

// 滚动事件处理
function handleScroll() {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = currentScrollPosition - lastScrollPosition;
    
    // 如果滚动距离小于阈值，忽略微小滚动
    if (Math.abs(scrollDelta) < 10) {
        return;
    }
    
    // 判断滚动方向
    const scrollingDown = scrollDelta > 0;
    
    // 更新最后滚动位置
    lastScrollPosition = currentScrollPosition;
    
    // 清除之前的定时器
    clearTimeout(scrollTimeout);
    
    // 如果方向改变，立即更新UI
    if (lastScrollDirection !== scrollingDown) {
        updateToolbarVisibility(scrollingDown);
    }
    
    // 设置新的定时器
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        showToolbar();
    }, 3000);
    
    // 只有在状态改变或初次滚动时才处理
    if (!isScrolling || lastScrollDirection !== scrollingDown) {
        isScrolling = true;
        lastScrollDirection = scrollingDown;
        updateToolbarVisibility(scrollingDown);
    }
}

// 更新工具栏可见性
function updateToolbarVisibility(scrollingDown) {
    if (scrollingDown) {
        hideToolbar();
    } else {
        showToolbar();
    }
}

// 显示工具栏
function showToolbar() {
    toolbar.classList.remove('hidden');
}

// 隐藏工具栏
function hideToolbar() {
    toolbar.classList.add('hidden');
}

// 显示复刻仓库对话框
function showForkRepoDialog() {
    forkRepoUrl.value = '';
    forkRepoDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('fork-repo-content').classList.add('scale-100');
    document.getElementById('fork-repo-content').classList.remove('scale-90');
}

// 隐藏复刻仓库对话框
function hideForkRepoDialog() {
    forkRepoDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('fork-repo-content').classList.add('scale-90');
    document.getElementById('fork-repo-content').classList.remove('scale-100');
}

// 显示确认对话框
function showConfirmDialog(title, message, fileInfo) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    fileToDelete = fileInfo;
    confirmDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('confirm-content').classList.add('scale-100');
    document.getElementById('confirm-content').classList.remove('scale-90');
}

// 隐藏确认对话框
function hideConfirmDialog() {
    confirmDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('confirm-content').classList.add('scale-90');
    document.getElementById('confirm-content').classList.remove('scale-100');
    fileToDelete = null;
}

// 显示新建文件夹对话框
function showNewFolderDialog() {
    newFolderName.value = '';
    newFolderDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('new-folder-content').classList.add('scale-100');
    document.getElementById('new-folder-content').classList.remove('scale-90');
    newFolderName.focus();
}

// 隐藏新建文件夹对话框
function hideNewFolderDialog() {
    newFolderDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('new-folder-content').classList.add('scale-90');
    document.getElementById('new-folder-content').classList.remove('scale-100');
}

// 显示新建仓库对话框
function showNewRepoDialog() {
    newRepoName.value = '';
    newRepoDesc.value = '';
    newRepoPrivate.checked = false;
    newRepoDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('new-repo-content').classList.add('scale-100');
    document.getElementById('new-repo-content').classList.remove('scale-90');
    newRepoName.focus();
}

// 隐藏新建仓库对话框
function hideNewRepoDialog() {
    newRepoDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('new-repo-content').classList.add('scale-90');
    document.getElementById('new-repo-content').classList.remove('scale-100');
}

// 显示上传文件对话框
function showUploadDialog() {
    fileInput.value = '';
    uploadDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('upload-content').classList.add('scale-100');
    document.getElementById('upload-content').classList.remove('scale-90');
}

// 隐藏上传文件对话框
function hideUploadDialog() {
    uploadDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('upload-content').classList.add('scale-90');
    document.getElementById('upload-content').classList.remove('scale-100');
}

// 获取目标仓库名称
function getTargetRepo(fileInfo) {
    if (fileInfo.type === 'repo') {
        return fileInfo.path;
    }
    // 对于目录，使用当前仓库
    return currentRepo;
}

// 显示上下文菜单
function showContextMenu(e, fileInfo) {
    // 创建或获取遮罩层
    const mask = document.createElement('div');
    mask.id = 'context-menu-mask';
    mask.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        z-index: 999;
    `;
    document.body.appendChild(mask);
    
    // 设置上下文菜单目标
    contextMenuTarget = fileInfo;

    // 根据文件类型显示/隐藏菜单项
    contextOpen.style.display = fileInfo.type === 'dir' || fileInfo.type === 'repo' ? 'flex' : 'none';
    contextDownload.style.display = fileInfo.type === 'file' ? 'flex' : 'none';
    contextRename.style.display = fileInfo.type === 'file' || fileInfo.type === 'dir' ? 'flex' : 'none';
    contextCopyLink.style.display = fileInfo.type === 'file' ? 'flex' : 'none';
    contextCopyProxyLink.style.display = fileInfo.type === 'file' ? 'flex' : 'none';
    contextDelete.style.display = 'flex';
    contextDownloadSource.style.display = fileInfo.type === 'repo' ? 'flex' : 'none';
    
    // 重构：智能显示Pages相关菜单项
    const isRepo = fileInfo.type === 'repo';
    const isRootDir = fileInfo.type === 'dir' && currentPath === ''; // 当前在根目录
    const isDocsDir = fileInfo.type === 'dir' && fileInfo.name.toLowerCase() === 'docs'; // 当前在docs目录
    
    // 仅对仓库/根目录/docs目录显示按钮
    const showPagesOption = isRepo || isRootDir || isDocsDir;
    contextEnablePages.style.display = showPagesOption ? 'flex' : 'none';
    
    if (showPagesOption) {
        const targetRepo = getTargetRepo(fileInfo);
        
        // +++ 关键修改: 每次显示菜单时强制刷新状态 +++
        checkPagesStatus(targetRepo).then(isEnabled => {
            // 确保菜单仍显示时才更新
            if (contextMenu.classList.contains('visible')) {
                updateContextMenuButton(isEnabled);
            }
        });
        
        // 先使用缓存状态显示
        const cachedEnabled = pagesEnabledMap.get(targetRepo) || false;
        updateContextMenuButton(cachedEnabled);
    }
    
    contextBuildApp.style.display = fileInfo.type === 'repo' ? 'flex' : 'none';
    
    // 上下文菜单定位
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const triggerX = e.clientX;
    const triggerY = e.clientY;
    const spaceRight = viewportWidth - triggerX;
    const spaceLeft = triggerX;
    const spaceBelow = viewportHeight - triggerY;
    const spaceAbove = triggerY;
    
    // 默认位置（右下）
    let posX = triggerX;
    let posY = triggerY + 5;
    
    // 检查可用空间并调整位置
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        posY = triggerY - menuHeight - 5;
    } else if (spaceBelow < menuHeight) {
        posY = viewportHeight - menuHeight - 10;
    }
    
    if (spaceRight < menuWidth && spaceLeft > menuWidth) {
        posX = triggerX - menuWidth - 5;
    } else if (spaceRight < menuWidth) {
        posX = viewportWidth - menuWidth - 10;
    }
    
    // 确保不会超出视口边界
    posX = Math.max(10, Math.min(posX, viewportWidth - menuWidth - 10));
    posY = Math.max(10, Math.min(posY, viewportHeight - menuHeight - 10));
    
    // 显示遮罩层
    mask.style.display = 'block';
    mask.addEventListener('click', hideContextMenu);
    
    // 应用位置
    contextMenu.style.left = `${posX}px`;
    contextMenu.style.top = `${posY}px`;
    contextMenu.classList.add('visible');
}

// 更新上下文菜单按钮
function updateContextMenuButton(isEnabled) {
    if (isEnabled) {
        contextEnablePages.innerHTML = '<i class="fas fa-ban mr-2 text-red-500"></i><span class="text-red-500">禁用静态网站</span>';
    } else {
        contextEnablePages.innerHTML = '<i class="fas fa-globe mr-2 text-green-500"></i><span class="text-green-500">启用静态网站</span>';
    }
}

// 隐藏上下文菜单
function hideContextMenu() {
    const mask = document.getElementById('context-menu-mask');
    if (mask) {
        mask.remove();
    }
    contextMenu.classList.remove('visible');
    contextMenuTarget = null;
    
    // 确保移除所有事件监听器
    document.removeEventListener('click', hideContextMenu);
}

// 打开上下文菜单项
function openContextItem(fileInfo) {
    if (fileInfo.type === 'dir') {
        loadRepositoryContents(currentRepo, `${currentPath ? currentPath + '/' : ''}${fileInfo.name}`);
    } else if (fileInfo.type === 'repo') {
        loadRepositoryContents(fileInfo.path);
    } else if (fileInfo.type === 'file' && fileInfo.download_url) {
        window.open(fileInfo.download_url, '_blank');
    }
}

// 显示批量操作工具栏
function showBatchToolbar() {
    batchToolbar.classList.add('visible');
}

// 隐藏批量操作工具栏
function hideBatchToolbar() {
    batchToolbar.classList.remove('visible');
}

// 更新选中文件计数
function updateSelectedCount() {
    selectedCount.textContent = selectedFiles.size;
}

// 切换选择模式
function toggleSelectMode() {
    if (selectedFiles.size > 0) {
        exitSelectMode();
    } else {
        enterSelectMode();
    }
}

// 进入选择模式
function enterSelectMode() {
    selectBtn.innerHTML = '<i class="fas fa-times text-red-500"></i>';
    selectBtn.title = '取消选择';
    showBatchToolbar();
}

// 退出选择模式
function exitSelectMode() {
    selectedFiles.clear();
    updateSelectedCount();
    hideBatchToolbar();
    
    // 移除所有选中状态
    document.querySelectorAll('.file-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    selectBtn.innerHTML = '<i class="fas fa-check-square text-blue-500"></i>';
    selectBtn.title = '选择文件';
}

// 认证按钮点击事件
authBtn.addEventListener('click', () => {
    const token = githubTokenInput.value.trim();
    
    // Token 格式验证
    if (!token) {
        showTokenError('请输入 GitHub Token');
        return;
    }
    
    if (token.length !== 40) {
        showTokenError('Token 应为 40 位字符');
        return;
    }
    
    verifyToken(token);
});

// 验证 Token
async function verifyToken(token = githubToken) {
    try {
        // 显示加载状态
        authBtnText.textContent = '认证中...';
        authSpinner.classList.remove('hidden');
        authBtn.disabled = true;
        
        // 设置超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // 发送验证请求
        const response = await fetch('https://api.github.com/user', {
            signal: controller.signal,
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('GitHub API 错误:', errorData);
            
            let errorMessage = '认证失败';
            if (response.status === 401) {
                errorMessage = 'Token 无效或已过期';
            } else if (response.status === 403) {
                errorMessage = '权限不足，请检查 Token 权限';
            } else {
                errorMessage = `服务器错误: ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // 认证成功
        const userData = await response.json();
        console.log('认证成功:', userData);
        
        githubToken = token;
        currentUser = userData;
        localStorage.setItem('github_token', token);
        showToast(`欢迎: ${userData.login || '用户'}！`);
        showMainScreen();
        loadRepositories();
        
        // 更新用户信息
        usernameElement.textContent = userData.login;
        
    } catch (error) {
        console.error('认证错误:', error);
        
        let errorMessage = error.message;
        if (error.name === 'AbortError') {
            errorMessage = '请求超时，请检查网络连接';
        }
        
        showTokenError(errorMessage);
        showToast(errorMessage);
        
    } finally {
        // 重置按钮状态
        authBtnText.textContent = '认证并继续';
        authSpinner.classList.add('hidden');
        authBtn.disabled = false;
    }
}

// 显示 Token 错误
function showTokenError(message) {
    tokenError.textContent = message;
    tokenError.classList.remove('hidden');
}

// 退出登录
function logout() {
    githubToken = '';
    currentUser = null;
    localStorage.removeItem('github_token');
    mainScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    githubTokenInput.value = '';
    tokenError.classList.add('hidden');
    showToast('已退出登录');
}

// 显示主界面
function showMainScreen() {
    authScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    toolbar.classList.remove('hidden');
    newRepoBtn.classList.remove('hidden');
}

// 显示提示
function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.remove('opacity-0');
    toastElement.classList.add('opacity-100');
    
    setTimeout(() => {
        toastElement.classList.remove('opacity-100');
        toastElement.classList.add('opacity-0');
    }, 3000);
}

// 加载仓库列表
async function loadRepositories() {
    showLoading();
    currentPath = '';
    currentRepo = '';
    updateBreadcrumb([]);
    
    // 更新按钮状态
    backBtn.classList.add('hidden');
    uploadBtn.classList.add('hidden');
    newFolderBtn.classList.add('hidden');
    selectBtn.classList.add('hidden');
    staticSiteBtn.classList.add('hidden');
    newRepoBtn.classList.remove('hidden');
    forkRepoBtn.classList.remove('hidden');

    try {
        // 使用GraphQL API获取仓库列表
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                query: `
                    query {
                        viewer {
                            repositories(first: 100, ownerAffiliations: [OWNER], orderBy: {field: NAME, direction: ASC}) {
                                nodes {
                                    name
                                    owner {
                                        login
                                    }
                                    isPrivate
                                    description
                                    updatedAt
                                }
                            }
                        }
                    }
                `
            })
        });
        
        if (!response.ok) {
            throw new Error('获取仓库列表失败');
        }
        
        const data = await response.json();
        const repos = data.data.viewer.repositories.nodes;
        
        renderFileList(repos.map(repo => ({
            name: repo.name,
            type: 'repo',
            path: `${repo.owner.login}/${repo.name}`,
            private: repo.isPrivate,
            description: repo.description,
            updatedAt: repo.updatedAt
        })));
    } catch (error) {
        console.error('加载仓库列表错误:', error);
        showToast('加载失败: ' + error.message);
        showEmptyState();
    }
}

// 加载仓库内容
async function loadRepositoryContents(repo, path = '') {
    showLoading();
    currentRepo = repo;
    currentPath = path;
    
    // 更新按钮状态
    backBtn.classList.remove('hidden');
    uploadBtn.classList.remove('hidden');
    newFolderBtn.classList.remove('hidden');
    selectBtn.classList.remove('hidden');
    staticSiteBtn.classList.add('hidden'); // 先隐藏，后面再判断
    newRepoBtn.classList.add('hidden');
    forkRepoBtn.classList.add('hidden');
        
    // 更新面包屑导航
    const pathParts = path ? path.split('/') : [];
    updateBreadcrumb([repo, ...pathParts]);
    
    try {
        // 使用GraphQL API获取仓库内容
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                query: `
                    query {
                        repository(owner: "${repo.split('/')[0]}", name: "${repo.split('/')[1]}") {
                            object(expression: "HEAD:${path}") {
                                ... on Tree {
                                    entries {
                                        name
                                        type
                                        object {
                                            ... on Blob {
                                                byteSize
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `
            })
        });
        
        if (!response.ok) {
            throw new Error('获取仓库内容失败');
        }
        
        const data = await response.json();
        
        if (!data.data.repository.object) {
            showEmptyState();
            return;
        }
        
        const contents = data.data.repository.object.entries.map(entry => ({
            name: entry.name,
            type: entry.type === 'tree' ? 'dir' : 'file',
            size: entry.object?.byteSize || 0,
            path: path ? `${path}/${entry.name}` : entry.name,
            download_url: entry.type === 'blob' ? 
                `https://raw.githubusercontent.com/${repo}/HEAD/${path ? path + '/' : ''}${entry.name}` : null
        }));
        
        currentFiles = contents;
        
        const sortedContents = [...contents].sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'dir' ? -1 : 1;
        });
        
        renderFileList(sortedContents);
        
        // 智能显示静态网站按钮：检查是否有index.html或index.md
        const hasWebContent = contents.some(file => 
            file.type === 'file' && 
            (file.name.toLowerCase() === 'index.html' || 
             file.name.toLowerCase() === 'index.md')
        );
        
        // 同时检查当前目录是否是根目录
        const isRoot = path === '';
        
        if (hasWebContent && isRoot) {
            staticSiteBtn.classList.remove('hidden');
        } else {
            staticSiteBtn.classList.add('hidden');
        }
        
        // 检查该仓库的Pages状态
        await checkPagesStatus(repo);
    } catch (error) {
        console.error('加载仓库内容错误:', error);
        showToast('加载失败: ' + error.message);
        showEmptyState();
    }
}

// 更新面包屑导航
function updateBreadcrumb(parts) {
    const breadcrumbContainer = currentPathElement.querySelector('.breadcrumb');
    breadcrumbContainer.innerHTML = '';
    
    // 添加"我的仓库"根路径
    const rootItem = document.createElement('div');
    rootItem.className = 'breadcrumb-item';
    rootItem.innerHTML = '<i class="fab fa-github mr-1"></i><span>我的仓库</span>';
    rootItem.onclick = () => loadRepositories();
    breadcrumbContainer.appendChild(rootItem);
    
    if (parts.length === 0) return;
    
    // 添加分隔符
    const separator = document.createElement('div');
    separator.className = 'breadcrumb-separator';
    separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
    breadcrumbContainer.appendChild(separator);
    
    // 添加仓库部分
    const repoItem = document.createElement('div');
    const repoName = parts[0].split('/').pop();
    repoItem.textContent = repoName;
    repoItem.onclick = () => loadRepositoryContents(parts[0]);
    breadcrumbContainer.appendChild(repoItem);
    
    // 添加路径部分
    for (let i = 1; i < parts.length; i++) {
        // 添加分隔符
        const separator = document.createElement('div');
        separator.className = 'breadcrumb-separator';
        separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
        breadcrumbContainer.appendChild(separator);
        
        // 添加路径项
        const pathItem = document.createElement('div');
        pathItem.className = 'breadcrumb-item';
        pathItem.textContent = parts[i];
        pathItem.onclick = () => {
            loadRepositoryContents(parts[0], parts.slice(1, i + 1).join('/'));
        };
        breadcrumbContainer.appendChild(pathItem);
    }
}

// 获取文件图标
function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    return fileTypeIcons[extension] || 'fas fa-file text-gray-400';
}

// 渲染文件列表
function renderFileList(items) {
    fileListElement.innerHTML = '';
    loadingElement.classList.add('hidden');
    emptyStateElement.classList.add('hidden');
    
    if (items.length === 0) {
        showEmptyState();
        return;
    }
    
    fileListElement.classList.remove('hidden');
    
    items.forEach(item => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item p-4 flex items-center';
        fileItem.dataset.name = item.name;
        fileItem.dataset.type = item.type;
        
        // 添加右键菜单
        fileItem.addEventListener('contextmenu', (e) => {
            showContextMenu(e, item);
        });
        
// 修复文件点击行为
fileItem.addEventListener('click', (e) => {
    // 阻止默认行为（防止链接跳转）
    e.preventDefault();
    e.stopPropagation();
    
    if (batchToolbar.classList.contains('visible')) {
        toggleFileSelection(fileItem, item);
        return;
    }
    
    if (item.type === 'dir') {
        loadRepositoryContents(currentRepo, `${currentPath ? currentPath + '/' : ''}${item.name}`);
    } else if (item.type === 'repo') {
        loadRepositoryContents(item.path);
    } else if (item.type === 'file') {
        const fileExt = item.name.split('.').pop().toLowerCase();
        
        // 文本文件 - 在编辑器中打开
        if (textFileExtensions.includes(fileExt)) {
            openFileInEditor(item);
        } 
        // 图片文件 - 直接预览
        else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(fileExt)) {
            showImagePreview(item);
        }
        // PDF文件 - 在新窗口打开
        else if (fileExt === 'pdf') {
            window.open(item.download_url, '_blank');
        }
        // 其他文件 - 直接下载
        else {
            downloadFile(item);
        }
    }
});

// 背景预览函数
function showImagePreview(item) {
    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'image-preview-container';
    previewContainer.innerHTML = `
        <div class="image-preview-content">
            <div class="image-preview-header">
                <div class="image-preview-title">${item.name}</div>
                <button class="image-preview-close" title="关闭">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="image-preview-body">
                <img src="${item.download_url}" alt="${item.name}" loading="lazy">
            </div>
            <div class="image-preview-footer">
                <div class="background-toggle">
                    <button class="btn-bg-light" title="浅色背景">
                        <i class="fas fa-sun"></i>
                    </button>
                    <button class="btn-bg-dark" title="深色网格背景">
                        <i class="fas fa-moon"></i>
                    </button>
                    <button class="btn-bg-grid" title="浅色网格背景">
                        <i class="fas fa-border-all"></i>
                    </button>
                </div>
                
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(previewContainer);
    document.body.style.overflow = 'hidden';
    
    // 获取图片元素
    const img = previewContainer.querySelector('img');
    const imgBody = previewContainer.querySelector('.image-preview-body');
    
    // 根据图片类型设置初始背景
    const ext = item.name.split('.').pop().toLowerCase();
    const isTransparent = ['png', 'gif', 'svg', 'webp'].includes(ext);
    
    if (isTransparent) {
        imgBody.classList.add('checkerboard-dark-bg'); // 默认使用深色网格背景
    }
    
    // 背景切换功能
    previewContainer.querySelector('.btn-bg-light').addEventListener('click', () => {
        imgBody.className = 'image-preview-body light-bg';
    });
    
    previewContainer.querySelector('.btn-bg-dark').addEventListener('click', () => {
        imgBody.className = 'image-preview-body checkerboard-dark-bg';
    });
    
    previewContainer.querySelector('.btn-bg-grid').addEventListener('click', () => {
        imgBody.className = 'image-preview-body checkerboard-bg';
    });
    
    // 关闭预览的函数
    const closePreview = () => {
        document.body.removeChild(previewContainer);
        document.body.style.overflow = '';
    };
    
    // 添加关闭事件
    previewContainer.querySelector('.image-preview-close').addEventListener('click', closePreview);
    
    // ESC键关闭
    document.addEventListener('keydown', function escClose(e) {
        if (e.key === 'Escape') {
            closePreview();
            document.removeEventListener('keydown', escClose);
        }
    });
    
    // 图片加载错误处理
    img.onerror = () => {
        imgBody.innerHTML = '<div class="text-red-500">图片加载失败</div>';
    };
}
        
        const icon = document.createElement('i');
        icon.className = `file-icon ${item.type === 'dir' ? 'fas fa-folder folder-icon' : 
                                 item.type === 'repo' ? 'fab fa-github text-gray-700' : 
                                 getFileIcon(item.name)}`;
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'flex-1 min-w-0';
        
        const name = document.createElement('div');
        name.className = 'font-medium truncate';
        name.textContent = item.name;
        
        const meta = document.createElement('div');
        meta.className = 'text-xs text-gray-500 truncate';
        
        if (item.type === 'repo') {
            meta.textContent = item.private ? '私有仓库' : '公开仓库';
            if (item.description) {
                meta.textContent += ' • ' + item.description;
            }
            if (item.updatedAt) {
                meta.textContent += ' • 更新: ' + formatDate(item.updatedAt);
            }
        } else if (item.type === 'file') {
            meta.textContent = formatFileSize(item.size);
        } else {
            meta.textContent = '文件夹 • 点击进入';
        }
        
        // 添加文件操作链接
        if (item.type === 'file') {
            const openLink = document.createElement('a');
            openLink.href = '#';
            openLink.className = 'text-blue-500 hover:underline ml-2 text-xs hidden md:inline';
            openLink.textContent = '编辑';
            openLink.addEventListener('click', (e) => {
                e.stopPropagation();
                openFileInEditor(item);
            });
            
            const downloadLink = document.createElement('a');
            downloadLink.href = '#';
            downloadLink.className = 'text-blue-500 hover:underline ml-2 text-xs hidden md:inline';
            downloadLink.textContent = '下载';
            downloadLink.addEventListener('click', (e) => {
                e.stopPropagation();
                downloadFile(item);
            });
            
            meta.appendChild(openLink);
            meta.appendChild(downloadLink);
        }
        
        infoContainer.appendChild(name);
        infoContainer.appendChild(meta);                               
        fileItem.appendChild(icon);
        fileItem.appendChild(infoContainer);                               
        fileListElement.appendChild(fileItem);
    });
}

// 切换文件选择状态
function toggleFileSelection(fileItem, fileInfo) {
    if (fileItem.classList.contains('selected')) {
        fileItem.classList.remove('selected');
        selectedFiles.delete(fileInfo);
    } else {
        fileItem.classList.add('selected');
        selectedFiles.add(fileInfo);
    }
    updateSelectedCount();
    
    // 如果没有选中文件，退出选择模式
    if (selectedFiles.size === 0) {
        exitSelectMode();
    }
}

// 下载选中的文件
async function downloadSelectedFiles() {
    if (selectedFiles.size === 0) return;

    // 单个文件直接下载
    if (selectedFiles.size === 1) {
        const file = selectedFiles.values().next().value;
        await downloadFile(file);
        return;
    }

    // 多个文件打包下载
    try {
        showToast(`开始打包 ${selectedFiles.size} 个文件...`);
        const zip = new JSZip();
        let count = 0;
        let errors = 0;

        // 创建并显示进度提示
        const progressToast = document.createElement('div');
        progressToast.id = 'zip-progress';
        progressToast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-panel px-6 py-3 rounded-full text-sm font-medium';
        document.body.appendChild(progressToast);
        
        // 更新进度提示
        const updateProgress = () => {
            progressToast.textContent = `打包中: ${count}/${selectedFiles.size} 个文件 (${errors} 失败)`;
        };
        
        updateProgress();

        // 使用原始下载URL获取文件内容
        const downloadPromises = Array.from(selectedFiles).map(async file => {
            if (file.type !== 'file' || !file.download_url) return;
            
            try {
                // 使用原始下载URL获取文件内容
                const response = await fetch(file.download_url);
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                // 获取原始文件名
                const originalFilename = file.name;
                
                // 添加到ZIP
                const blob = await response.blob();
                zip.file(originalFilename, blob);
                count++;
                updateProgress();
            } catch (error) {
                console.error(`下载 ${file.name} 失败:`, error);
                errors++;
                updateProgress();
            }
        });

        // 等待所有下载完成
        await Promise.all(downloadPromises);
        
        // 生成ZIP文件
        const repoName = currentRepo.split('/')[1] || 'download';
        const dateString = new Date().toISOString().slice(0,10);
        const zipFilename = `${repoName}-${dateString}.zip`;
        
        const content = await zip.generateAsync({ type: 'blob' });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
        
        document.body.removeChild(progressToast);
        
        if (errors === 0) {
            showToast(`已成功打包下载 ${count} 个文件`);
        } else {
            showToast(`打包完成: ${count} 成功, ${errors} 失败`);
        }
    } catch (error) {
        console.error('打包下载失败:', error);
        showToast('打包下载失败: ' + error.message);
    } finally {
        exitSelectMode();
    }
}

// 下载单个文件
async function downloadFile(file) {
    if (file.type !== 'file' || !file.download_url) return;
    
    try {
        showToast(`正在下载 ${file.name}...`);
        
        // 使用原始下载URL获取文件内容
        const response = await fetch(file.download_url);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        // 获取原始文件名
        const originalFilename = file.name;
        
        // 创建Blob并下载
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = originalFilename; // 确保使用原始文件名
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
        
        showToast(`已下载 ${originalFilename}`);
    } catch (error) {
        console.error('下载失败:', error);
        showToast(`下载失败: ${error.message}`);
    }
}

        // 源码下载功能
async function downloadRepositorySource(repoInfo) {
    try {
        showToast(`正在准备下载 ${repoInfo.name} 仓库...`);
        const [owner, repo] = repoInfo.path.split('/');

        // 步骤1: 获取仓库默认分支
        const { defaultBranch, repoData } = await getRepositoryInfo(owner, repo);
        
        // 步骤2: 尝试直接下载
        const directDownloadSuccess = await tryDirectDownload(owner, repo, defaultBranch);
        if (directDownloadSuccess) {
            showToast(`仓库 ${repoInfo.name} 下载完成`);
            return;
        }

        // 步骤3: 直接下载失败时使用API打包
        await downloadViaAPI(owner, repo, defaultBranch, repoInfo.name);
        
    } catch (error) {
        console.error('下载仓库失败:', error);
        showToast('下载失败: ' + error.message);
        removeProgressToast(); // 清理进度提示
    }
}

// 获取仓库信息（含默认分支）
async function getRepositoryInfo(owner, repo) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) throw new Error('获取仓库信息失败');
    const repoData = await response.json();
    return {
        defaultBranch: repoData.default_branch,
        repoData
    };
}

// 尝试直接下载方法
async function tryDirectDownload(owner, repo, branch) {
    return new Promise((resolve) => {
        const testLink = document.createElement('a');
        testLink.href = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
        testLink.download = `${repo}-${branch}.zip`;
        
        // 设置超时检测（5秒）
        const timeoutId = setTimeout(() => {
            document.body.removeChild(testLink);
            resolve(false);
        }, 5000);
        
        testLink.onclick = () => {
            clearTimeout(timeoutId);
            testLink.onclick = null;
            setTimeout(() => {
                document.body.removeChild(testLink);
                resolve(true);
            }, 100);
        };
        
        document.body.appendChild(testLink);
        testLink.click();
    });
}

// API打包下载方法
async function downloadViaAPI(owner, repo, branch, repoName) {
    // 创建进度提示
    const progressToast = createProgressToast('正在准备打包仓库内容...');
    
    try {
        // 递归获取所有文件
        progressToast.textContent = '正在扫描仓库文件...';
        const allFiles = await getAllFilesRecursive(owner, repo, branch, '');
        
        if (allFiles.length === 0) throw new Error('仓库为空，无法下载');
        
        // 创建ZIP文件
        progressToast.textContent = `正在打包 ${allFiles.length} 个文件...`;
        const zip = new JSZip();
        const folder = zip.folder(`${repo}-${branch}`); // 创建顶层目录
        
        let count = 0;
        const updateProgress = () => {
            progressToast.textContent = `打包进度: ${count}/${allFiles.length}`;
        };
        
        // 分批下载避免内存溢出
        const BATCH_SIZE = 10;
        for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
            const batch = allFiles.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (file) => {
                try {
                    const response = await fetch(file.download_url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const blob = await response.blob();
                    // 保留完整目录结构
                    folder.file(file.path, blob);
                    count++;
                    updateProgress();
                } catch (error) {
                    console.warn(`文件 ${file.path} 下载跳过:`, error);
                }
            }));
        }

        // 生成ZIP文件
        progressToast.textContent = '正在生成压缩文件...';
        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        }, updateProgress);

        // 触发下载
        const date = new Date().toISOString().slice(0, 10);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${repo}-${branch}-${date}.zip`;
        link.click();
        
        // 清理资源
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
        }, 100);
        
        showToast(`仓库 ${repoName} 打包下载完成`);
    } finally {
        removeProgressToast();
    }
}

// 递归获取仓库文件（保持原始结构）
async function getAllFilesRecursive(owner, repo, branch, path) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) return [];
        const items = await response.json();
        
        const files = [];
        for (const item of items) {
            if (item.type === 'file') {
                files.push({
                    path: item.path,
                    download_url: item.download_url
                });
            } else if (item.type === 'dir') {
                const subFiles = await getAllFilesRecursive(owner, repo, branch, item.path);
                files.push(...subFiles);
            }
        }
        return files;
    } catch (error) {
        console.error('获取文件列表错误:', error);
        return [];
    }
}

// 创建进度提示元素
function createProgressToast(text) {
    removeProgressToast(); // 先清理现有提示
    
    const toast = document.createElement('div');
    toast.id = 'zip-progress';
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-panel px-6 py-3 rounded-full text-sm font-medium';
    toast.textContent = text;
    document.body.appendChild(toast);
    return toast;
}

// 移除进度提示
function removeProgressToast() {
    const existing = document.getElementById('zip-progress');
    if (existing) document.body.removeChild(existing);
}

// 复制到剪贴板
function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage);
    }).catch((error) => {
        console.error('复制错误:', error);
        showToast('复制失败: ' + error.message);
    });
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// 删除文件
async function deleteFile(fileInfo) {
    try {
        // 如果是批量删除
        if (Array.isArray(fileInfo)) {
            return deleteFiles(fileInfo);
        }
        
        // 获取文件SHA
        const shaResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${fileInfo.name}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!shaResponse.ok) {
            throw new Error('获取文件信息失败');
        }
        
        const shaData = await shaResponse.json();
        const sha = shaData.sha;

        // 删除文件
        const deleteResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${fileInfo.name}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Delete ${fileInfo.name}`,
                    sha: sha
                })
            }
        );

        if (!deleteResponse.ok) {
            const errorData = await deleteResponse.json();
            throw new Error(errorData.message || '删除文件失败');
        }
        
        showToast('文件删除成功');
        loadRepositoryContents(currentRepo, currentPath);
        
    } catch (error) {
        console.error('删除文件错误:', error);
        showToast('删除文件失败: ' + error.message);
    }
}

// 批量删除文件
async function deleteFiles(files) {
    try {
        let successCount = 0;
        let failCount = 0;
        
        for (const file of files) {
            try {
                // 获取文件SHA
                const shaResponse = await fetch(
                    `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${file.name}`,
                    {
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (!shaResponse.ok) {
                    throw new Error('获取文件信息失败');
                }
                
                const shaData = await shaResponse.json();
                const sha = shaData.sha;

                // 删除文件
                const deleteResponse = await fetch(
                    `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${file.name}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify({
                            message: `Delete ${file.name}`,
                            sha: sha
                        })
                    }
                );

                if (!deleteResponse.ok) {
                    throw new Error('删除文件失败');
                }
                
                successCount++;
            } catch (error) {
                console.error(`删除文件 ${file.name} 失败:`, error);
                failCount++;
            }
        }
        
        if (failCount === 0) {
            showToast(`成功删除 ${successCount} 个文件`);
        } else {
            showToast(`删除完成: ${successCount} 成功, ${failCount} 失败`);
        }
        
        exitSelectMode();
        loadRepositoryContents(currentRepo, currentPath);
        
    } catch (error) {
        console.error('批量删除文件错误:', error);
        showToast('批量删除文件失败: ' + error.message);
    }
}

// 删除仓库
async function deleteRepository(repoInfo) {
    try {
        const [owner, repoName] = repoInfo.path.split('/');
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '删除仓库失败');
        }
        
        showToast('仓库删除成功');
        loadRepositories();
        
    } catch (error) {
        console.error('删除仓库错误:', error);
        showToast('删除仓库失败: ' + error.message);
    }
}

// 创建文件夹
async function createFolder(folderName) {
    try {
        const filePath = currentPath ? `${currentPath}/${folderName}/.gitkeep` : `${folderName}/.gitkeep`;
        const content = btoa(''); // 空内容
        
        const response = await fetch(`https://api.github.com/repos/${currentRepo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Create folder ${folderName}`,
                content: content
            })
        });
        
        if (response.ok) {
            showToast('文件夹创建成功');
            loadRepositoryContents(currentRepo, currentPath);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || '创建文件夹失败');
        }
    } catch (error) {
        console.error('创建文件夹错误:', error);
        showToast('创建文件夹失败: ' + error.message);
    }
}

// 创建仓库
async function createRepository(name, description, isPrivate) {
    try {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name,
                description,
                private: isPrivate,
                auto_init: true
            })
        });
        
        if (response.ok) {
            showToast('仓库创建成功');
            loadRepositories();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || '创建仓库失败');
        }
    } catch (error) {
        console.error('创建仓库错误:', error);
        showToast('创建仓库失败: ' + error.message);
    }
}

// 重命名文件
async function renameFile(fileInfo) {
    try {
        // 获取文件内容
        const contentResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${fileInfo.name}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!contentResponse.ok) {
            throw new Error('获取文件内容失败');
        }
        
        const contentData = await contentResponse.json();
        const sha = contentData.sha;
        const content = contentData.content;
        const encoding = contentData.encoding;
        
        // 提示用户输入新文件名
        const newName = prompt('请输入新的文件名:', fileInfo.name);
        if (!newName || newName === fileInfo.name) return;
        
        // 删除原文件
        const deleteResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${fileInfo.name}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Rename ${fileInfo.name} to ${newName}`,
                    sha: sha
                })
            }
        );
        
        if (!deleteResponse.ok) {
            throw new Error('删除原文件失败');
        }
        
        // 创建新文件
        const createResponse = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${currentPath ? currentPath + '/' : ''}${newName}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Rename ${fileInfo.name} to ${newName}`,
                    content: content,
                    encoding: encoding
                })
            }
        );
        
        if (createResponse.ok) {
            showToast('文件重命名成功');
            loadRepositoryContents(currentRepo, currentPath);
        } else {
            const errorData = await createResponse.json();
            throw new Error(errorData.message || '创建新文件失败');
        }
    } catch (error) {
        console.error('重命名文件错误:', error);
        showToast('重命名文件失败: ' + error.message);
    }
}

// 上传选中的文件
async function uploadSelectedFile() {
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('请先选择文件');
        return;
    }

    try {
        const files = Array.from(fileInput.files);
        let successfulUploads = 0;
        let failedUploads = 0;
        
        // 显示上传进度
        const progressToast = document.createElement('div');
        progressToast.id = 'upload-progress';
        progressToast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-panel px-6 py-3 rounded-full text-sm font-medium';
        progressToast.innerHTML = `准备上传 ${files.length} 个文件...`;
        document.body.appendChild(progressToast);

        // 顺序上传每个文件
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                progressToast.innerHTML = `正在上传 ${i+1}/${files.length}: ${file.name}...`;
                
                // 上传文件并等待完成
                await uploadSingleFile(file);
                successfulUploads++;
                
                // 小延迟避免速率限制
                if (i < files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`文件 ${file.name} 上传失败:`, error);
                failedUploads++;
                
                // 如果是速率限制错误，等待一段时间再继续
                if (error.message.includes('API rate limit')) {
                    progressToast.innerHTML = `遇到速率限制，等待60秒后继续...`;
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    i--; // 重试当前文件
                    continue;
                }
                
                // 其他错误继续下一个文件
                continue;
            }
        }

        // 移除进度提示
        document.body.removeChild(progressToast);
        
        // 显示最终结果
        if (failedUploads === 0) {
            showToast(`成功上传 ${successfulUploads} 个文件`);
        } else {
            showToast(`上传完成: ${successfulUploads} 成功, ${failedUploads} 失败`);
        }

        // 刷新文件列表
        loadRepositoryContents(currentRepo, currentPath);
    } catch (error) {
        console.error('上传过程中发生错误:', error);
        showToast('上传过程中发生错误: ' + error.message);
    } finally {
        fileInput.value = '';
    }
}

// 上传单个文件
async function uploadSingleFile(file) {
    try {
        // 1. 读取文件内容为Base64
        const base64Content = await readFileAsBase64(file);
        
        // 2. 构建文件路径
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        const encodedPath = encodeGitHubPath(filePath);
        
        // 3. 检查文件是否存在并获取SHA
        const sha = await getFileShaIfExists(encodedPath);
        
        // 4. 构建上传数据
        const uploadData = {
            message: `Upload ${file.name}`,
            content: base64Content,
            ...(sha && { sha }) // 只有sha存在时才包含
        };
        
        // 5. 执行上传
        const response = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${encodedPath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // 处理速率限制
            if (response.status === 403 && errorData.message.includes('API rate limit')) {
                const resetTime = new Date(response.headers.get('x-ratelimit-reset') * 1000);
                throw new Error(`API速率限制，请等待到 ${resetTime.toLocaleTimeString()}`);
            }
            
            throw new Error(errorData.message || '上传失败');
        }
        
        return { file: file.name, status: 'success' };
    } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error);
        throw error;
    }
}

// 辅助函数：将文件读取为Base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result;
            const binaryString = Array.from(new Uint8Array(arrayBuffer))
                .map(b => String.fromCharCode(b))
                .join('');
            resolve(btoa(binaryString));
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsArrayBuffer(file);
    });
}

// 辅助函数：检查文件是否存在并返回SHA
async function getFileShaIfExists(filePath) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${currentRepo}/contents/${filePath}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Cache-Control': 'no-cache'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.sha;
        } else if (response.status === 404) {
            return null; // 文件不存在
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || '检查文件状态失败');
        }
    } catch (error) {
        console.error('获取SHA错误:', error);
        throw error;
    }
}

// 辅助函数：编码GitHub路径
function encodeGitHubPath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
}

// 辅助函数：将文件读取为Base64
        function readFileAsBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const arrayBuffer = reader.result;
                    const binaryString = Array.from(new Uint8Array(arrayBuffer))
                        .map(b => String.fromCharCode(b))
                        .join('');
                    resolve(btoa(binaryString));
                };
                reader.onerror = () => reject(new Error('文件读取失败'));
                reader.readAsArrayBuffer(file);
            });
        }

        // 辅助函数：检查文件是否存在并返回SHA
        async function getFileShaIfExists(filePath) {
            try {
                const response = await fetch(
                    `https://api.github.com/repos/${currentRepo}/contents/${filePath}`,
                    {
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    return data.sha;
                }
                return null;
            } catch (error) {
                return null;
            }
        }
        
// 显示加载状态
function showLoading() {
    fileListElement.classList.add('hidden');
    emptyStateElement.classList.add('hidden');
    loadingElement.classList.remove('hidden');
}

// 显示空状态
function showEmptyState() {
    fileListElement.classList.add('hidden');
    loadingElement.classList.add('hidden');
    emptyStateElement.classList.remove('hidden');
}

// 返回按钮点击事件
backBtn.addEventListener('click', () => {
    if (!currentPath) {
        loadRepositories();
        return;
    }
    
    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');
    
    if (pathParts.length === 0) {
        loadRepositoryContents(currentRepo);
    } else {
        loadRepositoryContents(currentRepo, newPath);
    }
});

// 刷新按钮点击事件
refreshBtn.addEventListener('click', () => {
    if (currentRepo) {
        loadRepositoryContents(currentRepo, currentPath);
    } else {
        loadRepositories();
    }
});

// 强制刷新状态
async function checkPagesStatus(repo, forceRefresh = false) {
    // 如果有缓存且不需要强制刷新，直接返回缓存值
    if (!forceRefresh && pagesEnabledMap.has(repo)) {
        return pagesEnabledMap.get(repo);
    }
    
    try {
        const [owner, repoName] = repo.split('/');
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pages`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const isEnabled = (data.status === 'built' || data.status === 'building');
            pagesEnabledMap.set(repo, isEnabled);
            return isEnabled;
        }
        
        return false;
    } catch (error) {
        console.error('检查Pages状态错误:', error);
        return false;
    }
}

// GitHub Pages功能
function showStaticSiteDialog(repoInfo = null) {
    const targetRepo = repoInfo ? getTargetRepo(repoInfo) : currentRepo;
    
    // 存储目标仓库到对话框
    staticSiteDialog.dataset.targetRepo = targetRepo;
    
    // 智能预填充设置
    pagesBranch.value = 'main'; // 默认分支
    pagesFolder.value = '/';    // 默认根目录
    
    // 检查是否存在docs目录，如果存在则优先推荐
    const hasDocs = currentFiles.some(file => 
        file.type === 'dir' && file.name.toLowerCase() === 'docs'
    );
    
    if (hasDocs) {
        pagesFolder.value = '/docs';
    }
    
    // 更新状态显示
    updatePagesStatusDisplay(targetRepo);
    
    staticSiteDialog.classList.add('opacity-100', 'pointer-events-auto');
    document.getElementById('static-site-content').classList.add('scale-100');
    document.getElementById('static-site-content').classList.remove('scale-90');
}

// 更新Pages状态显示
async function updatePagesStatusDisplay(repo) {
    const isEnabled = await checkPagesStatus(repo);
    
    if (isEnabled) {
        pagesStatus.classList.remove('hidden');
        staticSiteEnable.classList.add('hidden');
        
        try {
            const [owner, repoName] = repo.split('/');
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pages`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                pagesUrl.href = data.html_url;
                pagesUrl.textContent = data.html_url;
                
                // 更新分支和目录显示
                pagesBranch.value = data.source.branch;
                pagesFolder.value = data.source.path === '/docs' ? '/docs' : '/';
            }
        } catch (error) {
            console.error('获取Pages详情失败:', error);
        }
    } else {
        pagesStatus.classList.add('hidden');
        staticSiteEnable.classList.remove('hidden');
    }
}

// 启用静态网站功能
async function enableGitHubPages() {
    const enableBtn = staticSiteEnable;
    const originalText = enableBtn.innerHTML;
    
    try {
        // 显示加载状态
        enableBtn.disabled = true;
        enableBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        
        const targetRepo = staticSiteDialog.dataset.targetRepo;
        if (!targetRepo) throw new Error("无法确定目标仓库");
        
        const [owner, repoName] = targetRepo.split('/');
        const branch = pagesBranch.value;
        const path = pagesFolder.value === '/docs' ? '/docs' : '/';
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: {
                    branch: branch,
                    path: path
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '启用失败');
        }
        
        pagesEnabledMap.set(targetRepo, true);
        showToast(`静态网站已启用: ${targetRepo}`);
        hideStaticSiteDialog();
        
    } catch (error) {
        console.error('启用静态网站错误:', error);
        showToast('操作失败: ' + error.message);
    } finally {
        enableBtn.disabled = false;
        enableBtn.innerHTML = originalText;
    }
}

async function disableGitHubPages(repo) {
    const menuItem = contextEnablePages;
    const originalHTML = menuItem.innerHTML;
    menuItem.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span>处理中...</span>';
    
    try {
        const [owner, repoName] = repo.split('/');
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pages`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status !== 204) {
            const errorData = await response.json();
            throw new Error(errorData.message || '禁用失败');
        }
        
        pagesEnabledMap.set(repo, false);
        showToast('静态网站已禁用');
        
    } catch (error) {
        console.error('禁用静态网站错误:', error);
        showToast('禁用失败: ' + error.message);
    } finally {
        menuItem.innerHTML = originalHTML;
    }
}

// 隐藏静态网站对话框
function hideStaticSiteDialog() {
    staticSiteDialog.classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('static-site-content').classList.add('scale-90');
    document.getElementById('static-site-content').classList.remove('scale-100');
    delete staticSiteDialog.dataset.targetRepo;
}

// 运行工作流
async function buildApp(repoInfo) {
    try {
        const [owner, repo] = repoInfo.path.split('/');
        
        // 显示构建状态
        buildStatusEl.classList.remove('hidden');
        buildIcon.className = 'fas fa-cog animate-spin text-blue-500 mr-2';
        buildMessage.textContent = '正在扫描工作流文件...';
        
        // 1. 获取工作流文件列表
        const workflowsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!workflowsResponse.ok) {
            const errorData = await workflowsResponse.json();
            throw new Error(errorData.message || '获取工作流文件失败');
        }
        
        const workflowFiles = await workflowsResponse.json();
        const validWorkflows = workflowFiles.filter(file => 
            file.name.endsWith('.yml') || file.name.endsWith('.yaml')
        );
        
        if (validWorkflows.length === 0) {
            throw new Error('未找到工作流文件');
        }
        
        // 2. 自动选择工作流
        let selectedWorkflow = validWorkflows.find(file => 
            file.name.toLowerCase().includes('build')
        ) || validWorkflows[0];
        
        const workflowFileName = selectedWorkflow.name;
        buildMessage.textContent = `找到工作流: ${workflowFileName}`;
        
        // 3. 获取仓库默认分支
        const repoInfoResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!repoInfoResponse.ok) {
            throw new Error('获取仓库信息失败');
        }
        
        const repoData = await repoInfoResponse.json();
        const defaultBranch = repoData.default_branch;
        
        // 4. 触发工作流
        const dispatchResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFileName}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref: defaultBranch
                })
            }
        );
        
        if (dispatchResponse.status === 204) {
            buildMessage.textContent = `工作流 ${workflowFileName} 已触发！监控进度中...`;
            monitorBuildProgress(owner, repo);
        } else {
            const errorData = await dispatchResponse.json();
            throw new Error(errorData.message || '触发工作流失败');
        }
    } catch (error) {
        console.error('构建APP错误:', error);
        buildIcon.className = 'fas fa-times-circle text-red-500 mr-2';
        buildMessage.textContent = '构建失败: ' + error.message;
    }
}

// 监控构建进度
async function monitorBuildProgress(owner, repo) {
    // 清除之前的定时器
    clearInterval(buildTimer);
    
    // 设置进度条动画
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 95) {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
    }, 2000);
    
    // 每10秒检查一次构建状态
    buildTimer = setInterval(async () => {
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
        if (!response.ok) {
            throw new Error('获取构建状态失败');
        }
        
        const data = await response.json();
        const latestRun = data.workflow_runs[0];
        
        if (!latestRun) {
            return;
        }
        
        // 更新构建状态
        buildStatus = latestRun.status;
        
        switch (latestRun.status) {
            case 'completed':
                clearInterval(progressInterval);
                clearInterval(buildTimer);
                
                if (latestRun.conclusion === 'success') {
                    progressBar.style.width = '100%';
                    progressText.textContent = '100%';
                    buildIcon.className = 'fas fa-check-circle text-green-500 mr-2';
                    
                    // 获取制品信息
                    const artifactsResponse = await fetch(latestRun.artifacts_url, {
                        headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    
                    if (artifactsResponse.ok) {
                        const artifactsData = await artifactsResponse.json();
                        if (artifactsData.artifacts.length > 0) {
                            const artifactLinks = artifactsData.artifacts.map(a => 
                                `<a href="${a.archive_download_url}" target="_blank" class="text-blue-500">${a.name}</a>`
                            ).join('<br>');
                            
                            buildMessage.innerHTML = `构建成功！下载制品:<br>${artifactLinks}`;
                        } else {
                            buildMessage.innerHTML = '构建成功！<br>可在仓库的Actions页面查看详情';
                        }
                    } else {
                        buildMessage.innerHTML = '构建成功！<br>可在仓库的Actions页面查看详情';
                    }
                } else {
                    buildIcon.className = 'fas fa-times-circle text-red-500 mr-2';
                    buildMessage.textContent = `构建失败: ${latestRun.conclusion}`;
                }
                break;
                
            case 'in_progress':
                buildMessage.textContent = '构建正在进行中...';
                break;
                
            case 'queued':
                buildMessage.textContent = '构建任务排队中...';
                break;
        }
    } catch (error) {
        console.error('监控构建进度错误:', error);
        clearInterval(progressInterval);
        clearInterval(buildTimer);
        buildIcon.className = 'fas fa-times-circle text-red-500 mr-2';
        buildMessage.textContent = '监控失败: ' + error.message;
    }
}, 10000);
}

// 复刻仓库函数
async function forkRepository(repoUrl) {
    try {
        // 从URL中提取owner和repo名称
        const urlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/i;
        const match = repoUrl.match(urlPattern);
        
        if (!match || match.length < 3) {
            throw new Error('无效的GitHub仓库URL');
        }
        
        const owner = match[1];
        const repo = match[2];
        
        showToast('正在复刻仓库...');
        hideForkRepoDialog();
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '复刻仓库失败');
        }
                
        showToast('仓库复刻中，请稍后刷新查看...');
        
        // 8秒后自动刷新
        setTimeout(() => {
            loadRepositories();
        }, 8000);
        
    } catch (error) {
        console.error('复刻仓库错误:', error);
        showToast('复刻仓库失败: ' + error.message);
    }
}

// 通用对话框隐藏函数
function hideDialog(dialogElement) {
    dialogElement.classList.remove('opacity-100', 'pointer-events-auto');
    dialogElement.querySelector('.dialog-content').classList.add('scale-90');
    dialogElement.querySelector('.dialog-content').classList.remove('scale-100');
}

// 修改所有对话框的取消按钮事件
document.querySelectorAll('.dialog-cancel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const dialog = this.closest('.dialog-overlay');
        hideDialog(dialog);
    });
});

// 修改所有对话框的遮罩层点击事件
document.querySelectorAll('.dialog-overlay').forEach(dialog => {
    dialog.addEventListener('click', function(e) {
        if (e.target === this) {
            hideDialog(this);
        }
    });
});