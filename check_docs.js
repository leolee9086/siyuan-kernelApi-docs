'use strict';

// const fs = require('fs').promises; // 旧的导入方式
const fs = require('fs'); // <-- 导入整个 fs 模块
const fsPromises = require('fs').promises; // <-- 单独导入 promises 版本给异步操作用
const path = require('path');
const https = require('https'); // 这个可能不再需要了
const { execSync } = require('child_process'); // <-- 引入 execSync 用于执行 shell 命令

// --- Git 仓库路径 ---
const siyuanRepoPath = path.resolve(__dirname, '../siyuan');
// -------------------

// --- 自动拉取最新思源代码 --- (新增函数)
function pullLatestSiyuanCode(repoPath) {
    console.log(`\n🔄 正在尝试拉取最新的思源主代码: ${repoPath}`);
    if (!fs.existsSync(repoPath)) { // 现在可以用了
        console.warn(`   ⚠️ 警告：指定的思源仓库目录不存在: ${repoPath}`);
        console.warn('   ⚠️ 跳过 git pull 操作。脚本将使用现有的 router.go (如果存在)。');
        return false;
    }
    try {
        // 检查是否是 Git 仓库
        execSync('git rev-parse --is-inside-work-tree', { cwd: repoPath, stdio: 'ignore' });
        console.log('   ✅ 目录确认是 Git 仓库，执行 git pull...');
        const output = execSync('git pull', { cwd: repoPath, encoding: 'utf-8' });
        console.log('   ✅ git pull 执行完毕。输出:');
        console.log(output.split('\n').map(line => `     ${line}`).join('\n')); // 缩进输出
        return true;
    } catch (error) {
        console.error(`   ❌ 执行 git pull 失败: ${error.message}`);
        if (error.stderr) {
            console.error(`   ❌ Git Stderr: ${error.stderr.toString()}`);
        }
        if (error.stdout) {
             console.error(`   ❌ Git Stdout: ${error.stdout.toString()}`);
        }
        console.warn('   ⚠️ 继续使用当前本地的 router.go。');
        return false;
    }
}
// ------------------------

// --- 本地路径配置 (恢复并更新) ---
// 使用 path.resolve 确保路径正确，相对于当前脚本文件 (__dirname)
const routerGoPath = path.resolve(__dirname, '../siyuan/kernel/api/router.go');
console.log(`ℹ️ 将从本地路径读取 router.go: ${routerGoPath}`); // 添加日志确认路径
// ---------------

// --- 配置路径 ---
const apiDocBasePath = __dirname;
const indexHtmlPath = path.join(apiDocBasePath, 'index.html');
const pagesDir = path.join(apiDocBasePath, 'pages');
// ---------------

// --- 新增：定义需要扫描的API文档子目录 ---
const apiSubDirs = [
    'pages', 'av', 'file', 'export', 'template', 'attr', 'asset', 'archive', 
    'ai', 'account', 'ref', 'search', 'history', 'cloud', 'format', 'lute', 
    'filetree', 'storage', 'tag', 'bookmark', 'outline', 'block', 'notebook', 
    'system', 'query', 'repo', 'riff', 'graph', 'sqlite', 'transactions', 'rpc', 
    'import', 'notification', 'extension',
    'bazaar', 'broadcast', 'clipboard', 'convert', 'setting',
    'network', 'petal', 'snippet', 'sync', // <-- 添加了 sync 目录
    'icon', 'ui' // <-- 添加了 icon 和 ui 目录
    // 如果有新增的分类目录，记得添加到这里
];
// ---------------

// --- 修改 getDefinedApis 函数，强制读取本地文件 ---
async function getDefinedApis(filePath) { // 参数名改为 filePath 更清晰
    let content = '';
    let sourceDesc = `本地文件 ${path.basename(filePath)}`;
    try {
        // 直接读取本地文件
        content = await fsPromises.readFile(filePath, 'utf-8'); // <-- 使用 promises 版本

        const lines = content.split('\n');
        const apiPaths = new Set();
        // 稍微调整正则，更精确匹配 API 定义行
        const apiRegex = /^\s*ginServer\.(?:Handle|Any|GET|POST|PUT|DELETE|PATCH)\(s*"[^"+]+",\s*"(\/api\/[^"+,]+)"/;

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
    const metaTagRegex = /<meta[^>]*name\s*=\s*["']siyuan-api-endpoint["'][^>]*content\s*=\s*["'](\/api\/[^"']+)["'][^>]*>/i;


    try {
        // 1. Log pages found in index.html (optional)
        const indexContent = await fsPromises.readFile(indexFile, 'utf-8'); // <-- 使用 promises 版本
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
                 // 尝试创建目录（如果不存在），忽略已存在错误
                 await fsPromises.mkdir(dirPath, { recursive: true }); 
                 
                const filesInDir = await fsPromises.readdir(dirPath); // <-- 使用 promises 版本

                for (const file of filesInDir) {
                    if (file.endsWith('.html')) {
                        scannedFilesCount++;
                        const filePath = path.join(dirPath, file);
                        try {
                            const fileContent = await fsPromises.readFile(filePath, 'utf-8'); // <-- 使用 promises 版本
                            let foundApi = false;
                            
                            // --- Priority: Check for meta tag ---
                            const metaMatch = fileContent.match(metaTagRegex);
                            if (metaMatch && metaMatch[1]) {
                                const apiPath = metaMatch[1].trim();
                                documentedApis.add(apiPath);
                                foundApi = true;
                            } 
                            // --- End Meta Tag Check ---

                            // --- Fallback: Use Regex (only if meta tag not found and meta tag was expected) ---
                            // Fallback logic seems less reliable with explicit meta tags, maybe remove or refine?
                            // Let's keep it for now but rely primarily on the meta tag.
                            if (!foundApi) {
                                let apiMatchFallback;
                                while ((apiMatchFallback = apiPathRegexFallback.exec(fileContent)) !== null) {
                                    if (apiMatchFallback[1]) {
                                        const apiPath = apiMatchFallback[1].trim();
                                        // Avoid adding duplicates if meta tag was just missing
                                        // documentedApis.add(apiPath); 
                                        // Maybe log a warning instead?
                                        // console.warn(`   ⚠️ 文件 ${path.join(subDir, file)} 可能缺少 meta 标签，但通过正则匹配到 API: ${apiPath}`);
                                    }
                                }
                            }
                            // --- End Regex Fallback ---

                        } catch (scanErr) {
                            // Log error but continue scanning other files
                            console.error(`   ❌ 读取或解析文档文件 ${path.join(subDir, file)} 出错:`, scanErr.message);
                        }
                    }
                }
            } catch (dirErr) {
                 if (dirErr.code !== 'ENOENT') { // ENOENT should be handled by mkdir now
                    console.error(`   ❌ 读取或创建目录 ${dirPath} 出错:`, dirErr.message);
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
    // 在检查开始前，先拉取最新代码
    pullLatestSiyuanCode(siyuanRepoPath);

    console.log('\n🚀 开始检查 API 文档覆盖情况 (基于本地 router.go)...');

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


    const undocumentedApis = [];
    for (const api of definedApis) {
        if (!documentedApis.has(api)) {
            undocumentedApis.push(api);
        }
    }

    // --- 新增：检查多余文档 ---
    const extraDocumentedApis = [];
    for (const api of documentedApis) {
        if (!definedApis.has(api)) {
            extraDocumentedApis.push(api);
        }
    }
    // --------------------------

    if (undocumentedApis.length === 0 && extraDocumentedApis.length === 0) {
        console.log('\n🎉 太棒了！所有在 router.go 中定义的 API 都已在文档中找到引用，且没有多余的文档。');
    } else {
        if (undocumentedApis.length > 0) {
            console.log(`\n🚨 注意：发现 ${undocumentedApis.length} 个 API 可能缺少文档：`);
            undocumentedApis.sort().forEach(api => console.log(`   - ${api}`));
            console.log('\n   请检查这些 API 是否需要添加到文档中，或者对应的占位符文件是否正确添加了 meta 标签。');
        }
        if (extraDocumentedApis.length > 0) {
            console.log(`\n⚠️ 警告：发现 ${extraDocumentedApis.length} 个 API 在文档中存在引用，但在 router.go 中未定义 (可能是旧文档或 meta 标签错误)：`);
            extraDocumentedApis.sort().forEach(api => console.log(`   - ${api}`));
            console.log('\n   请检查这些文档文件是否需要删除或更新。');
        }
         console.log('\n   注意：此检查基于 API 路径的文本匹配，可能存在误报或漏报。对动态路由（如 :param 或 *path）的处理比较基础。');
    }
    console.log('\n🏁 检查完成。');
}

findUndocumentedApis(); 