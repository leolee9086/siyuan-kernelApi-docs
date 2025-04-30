'use strict';

const fs = require('fs').promises;
const path = require('path');
const https = require('https'); // <-- 引入 https 模块

// --- GitHub 配置 --- (注释掉或删除，因为我们要读本地文件了)
/*
const GITHUB_CONFIG = {
    repo: 'siyuan-note/siyuan', // 仓库路径
    branch: 'master',            // 分支
    filePath: 'kernel/api/router.go' // 文件路径
};
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.filePath}`;
*/
// -------------------

// --- 新增：从 GitHub 下载文件的函数 --- (注释掉或删除)
/*
async function fetchRouterFromGitHub(url) {
    console.log(`\n🌐 正在从 GitHub 下载: ${url}`);
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            if (res.statusCode !== 200) {
                reject(new Error(`下载失败，状态码: ${res.statusCode}`));
                return;
            }
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('✅ 文件下载成功。');
                resolve(data);
            });
        }).on('error', (err) => {
            reject(new Error(`下载出错: ${err.message}`));
        });
    });
}
*/
// -------------------------------------

// --- 本地路径配置 (恢复并更新) ---
// 使用 path.resolve 确保路径正确，相对于当前脚本文件 (__dirname)
const routerGoPath = path.resolve(__dirname, '../siyuan/kernel/api/router.go');
console.log(`ℹ️ 将从本地路径读取 router.go: ${routerGoPath}`); // 添加日志确认路径
// ---------------

// --- 配置路径 ---
// const routerGoPath = path.resolve(__dirname, '../kernel/api/router.go'); // <--- 注释掉本地路径
const apiDocBasePath = __dirname;
const indexHtmlPath = path.join(apiDocBasePath, 'index.html');
const pagesDir = path.join(apiDocBasePath, 'pages');
// ---------------

// --- 新增：定义需要扫描的API文档子目录 ---
const apiSubDirs = [
    'pages', 'av', 'file', 'export', 'template', 'attr', 'asset', 'archive', 
    'ai', 'account', 'ref', 'search', 'history', 'cloud', 'format', 'lute', 
    'filetree', 'storage', 'tag', 'bookmark', 'outline', 'block', 'notebook', 
    'system', 'query', 'repo', 'riff', 'graph', 'sqlite', 'transactions', 'rpc', // <-- 增加了 sqlite, transactions, rpc
    'import', 'notification', 'extension',
    'bazaar', 'broadcast', 'clipboard', 'convert', 'setting',
    'network', 'petal', 'snippet', 'sqlite', 'sync', 'transactions' // <-- 重复添加 sqlite, transactions, 已移动到前面
    // 如果有新增的分类目录，记得添加到这里
];
// ---------------

// --- 修改 getDefinedApis 函数，强制读取本地文件 ---
async function getDefinedApis(filePath) { // 参数名改为 filePath 更清晰
    let content = '';
    let sourceDesc = `本地文件 ${path.basename(filePath)}`;
    try {
        // 直接读取本地文件
        content = await fs.readFile(filePath, 'utf-8');

        const lines = content.split('\n');
        const apiPaths = new Set();
        // 稍微调整正则，更精确匹配 API 定义行
        const apiRegex = /^\s*ginServer\.(?:Handle|Any|GET|POST|PUT|DELETE|PATCH)\(\s*"[^"+]+",\s*"(\/api\/[^"+,]+)"/;

        for (const line of lines) {
            // 跳过注释和空行
            if (line.trim().startsWith('//') || line.trim() === '') {
                continue;
            }
            const match = line.match(apiRegex);
            if (match && match[1]) {
                // 移除路径参数 :param 和通配符 *path
                let apiPath = match[1].replace(/\/:[^/]+/g, '').replace(/\/\*[^/]+/g, '');
                // 如果路径以 / 结尾且长度大于1，移除结尾的 /
                if (apiPath.endsWith('/') && apiPath.length > 1) {
                   apiPath = apiPath.slice(0, -1);
                }
                // 特殊处理 /ws/ 路径
                if (!apiPath.startsWith('/ws/')) {
                    apiPaths.add(apiPath);
                }
            }
        }
        console.log(`\n🔍 从 ${sourceDesc} 中找到 ${apiPaths.size} 个 API 定义。`);
        return apiPaths;
    } catch (err) {
        if (err.code === 'ENOENT') {
             console.error(`❌ 错误：无法在指定路径找到 router.go 文件: ${filePath}`);
             console.error(`   请确认 '../siyuan' 目录是否存在于 '${apiDocBasePath}' 的同级目录下，并且包含 'kernel/api/router.go'。`);
        } else {
            console.error(`❌ 读取或解析 ${sourceDesc} 出错:`, err);
        }
        return new Set(); // 返回空集合，避免后续出错
    }
}

async function getDocumentedApis(basePath, indexFile) {
    const documentedApis = new Set();
    const pageFiles = new Set(); // Keep for logging or potential future use

    // Regex for fallback (kept for compatibility)
    const apiPathRegexFallback = /(?:(?:GET|POST|PUT|DELETE|PATCH)?\s+)?(?:<code>)?(?:POST\s+)?(\/api\/[a-zA-Z0-9\/-]+)(?:<\/code>)?/g;
    // Regex to find the new meta tag - Making it more robust
    // Old: /<meta\s+name=["']siyuan-api-endpoint["']\s+content=["'](\/api\/[^"']+)["']\s*\/?>/i;
    const metaTagRegex = /<meta[^>]*name\s*=\s*["']siyuan-api-endpoint["'][^>]*content\s*=\s*["'](\/api\/[^"']+)["'][^>]*>/i;


    try {
        // 1. Log pages found in index.html (optional)
        const indexContent = await fs.readFile(indexFile, 'utf-8');
        const pageLinkRegex = /href=["'](pages\/[^"]+\.html)["']/g; // Adjusted regex slightly for quotes
        let match;
        while ((match = pageLinkRegex.exec(indexContent)) !== null) {
            pageFiles.add(match[1]);
        }
        console.log(`\n📄 从 ${path.basename(indexFile)} 中找到 ${pageFiles.size} 个文档页面链接 (仅记录)。`);

        // 2. Scan HTML files in all defined API subdirectories
        console.log(`\n🔍 开始扫描以下目录中的 HTML 文件: ${apiSubDirs.join(', ')}`);
        let scannedFilesCount = 0;
        for (const subDir of apiSubDirs) {
            const dirPath = path.join(basePath, subDir);
            try {
                const filesInDir = await fs.readdir(dirPath);

                // Keep debug log for export dir if needed
                // if (subDir === 'export') {
                //     console.log(`\n📂 扫描 ${subDir} 目录中的文件:`, filesInDir);
                // }

                for (const file of filesInDir) {
                    if (file.endsWith('.html')) {
                        scannedFilesCount++;
                        const filePath = path.join(dirPath, file);
                        try {
                            const fileContent = await fs.readFile(filePath, 'utf-8');
                            let foundApi = false;
                            // const isTargetFile = file === 'importStdMd.html' || file === 'pushMsg.html' || file === 'pushErrMsg.html'; // DEBUG: Flag for target files - Removed
                            // if (isTargetFile) console.log(`\\n--- DEBUG Processing Target File: ${path.join(subDir, file)} ---`); // DEBUG START - Removed

                            // --- Priority: Check for meta tag ---
                            const metaMatch = fileContent.match(metaTagRegex);
                            if (metaMatch && metaMatch[1]) {
                                const apiPath = metaMatch[1].trim();
                                // if (isTargetFile) console.log(`  [DEBUG Meta Found] API Path: ${apiPath}`); // DEBUG META FOUND - Removed
                                documentedApis.add(apiPath);
                                foundApi = true;
                            } else {
                                // if (isTargetFile) { // DEBUG META NOT FOUND - Removed
                                //      console.log("  [DEBUG Meta Not Found]"); 
                                //      console.log("  [DEBUG File Head]:\n" + fileContent.split('\n').slice(0, 15).join('\n'));
                                // }
                            }
                            // --- End Meta Tag Check ---

                            // --- Fallback: Use Regex (only if meta tag not found) ---
                            if (!foundApi) {
                                let apiMatchFallback;
                                while ((apiMatchFallback = apiPathRegexFallback.exec(fileContent)) !== null) {
                                    if (apiMatchFallback[1]) {
                                        const apiPath = apiMatchFallback[1].trim();
                                        documentedApis.add(apiPath);
                                    }
                                }
                            }
                            // --- End Regex Fallback ---
                            // if (isTargetFile) console.log("--- End DEBUG Processing Target File ---"); // DEBUG END - Removed

                        } catch (scanErr) {
                            // Log error but continue scanning other files
                            console.error(`   ❌ 读取或解析文档文件 ${path.join(subDir, file)} 出错:`, scanErr.message);
                        }
                    }
                }
            } catch (dirErr) {
                 if (dirErr.code === 'ENOENT') {
                     // Directory doesn't exist (e.g., 'ai' before creation), skip silently
                 } else {
                    console.error(`   ❌ 读取目录 ${dirPath} 出错:`, dirErr.message);
                 }
            }
        }

        console.log(`\n📚 从 ${scannedFilesCount} 个扫描到的 HTML 文件中共识别出 ${documentedApis.size} 个唯一 API 引用 (优先使用 meta 标签)。`);
        return documentedApis;
    } catch (err) {
        console.error(`❌ 处理文档文件出错:`, err);
        return new Set();
    }
}

async function findUndocumentedApis() {
    console.log('🚀 开始检查 API 文档覆盖情况 (基于本地 router.go)...'); // 更新日志

    // 直接传递本地路径给 getDefinedApis
    const definedApisRaw = await getDefinedApis(routerGoPath);
    if (definedApisRaw.size === 0) {
        // 之前的错误消息已在 getDefinedApis 中打印，这里只简单提示
        console.log('🤷‍♀️ 未能在本地 router.go 中找到任何 API 定义或读取文件失败，检查结束。');
        return;
    }

    const documentedApisRaw = await getDocumentedApis(apiDocBasePath, indexHtmlPath);

    // 清理 API 路径：去除首尾空格/换行符
    const definedApis = new Set([...definedApisRaw].map(api => api.trim()));
    const documentedApis = new Set([...documentedApisRaw].map(api => api.trim()));

    // --- DEBUG: Print the contents of both Sets before comparison ---
    // console.log('\n--- Defined APIs (from router.go) --- Check Count:', definedApis.size); // DEBUG - Removed
    // const sortedDefinedApis = [...definedApis].sort();
    // console.log(JSON.stringify(sortedDefinedApis, null, 2));

    // console.log('\n--- Documented APIs (from HTML meta/regex) --- Check Count:', documentedApis.size); // DEBUG - Removed
    // const sortedDocumentedApis = [...documentedApis].sort();
    // console.log(JSON.stringify(sortedDocumentedApis, null, 2));
    // console.log('--- End Debug Print ---\n');
    // --- End DEBUG ---

    const undocumentedApis = [];
    for (const api of definedApis) {
        if (!documentedApis.has(api)) {
            undocumentedApis.push(api);
        }
    }

    if (undocumentedApis.length === 0) {
        console.log('\n🎉 太棒了！所有在 router.go 中定义的 API 都已在文档中找到引用。');
    } else {
        console.log(`\n🚨 注意：发现 ${undocumentedApis.length} 个 API 可能缺少文档：`);
        undocumentedApis.sort().forEach(api => console.log(`   - ${api}`));
        console.log('\n   请检查这些 API 是否需要添加到 apiDoc/pages/ 目录下的相关文档中。\n   注意：此检查基于 API 路径的文本匹配，可能存在误报或漏报。对动态路由（如 :param 或 *path）的处理比较基础。'
        );
    }
    console.log('\n🏁 检查完成。');
}

findUndocumentedApis(); 