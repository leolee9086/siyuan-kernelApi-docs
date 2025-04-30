'use strict';

const fs = require('fs').promises;
const path = require('path');
const https = require('https'); // <-- 引入 https 模块
const { execSync } = require('child_process'); // <-- 引入 execSync 用于执行命令

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
const siyuanRepoPath = path.resolve(__dirname, '../siyuan'); // <-- 新增：定义思源仓库路径
console.log(`ℹ️ 将从本地路径读取 router.go: ${routerGoPath}`); // 这行日志可以移到后面，先更新仓库
// ---------------

// --- 配置路径 ---
// const routerGoPath = path.resolve(__dirname, '../kernel/api/router.go'); // <--- 注释掉本地路径
const apiDocBasePath = __dirname;
const indexHtmlPath = path.join(apiDocBasePath, 'index.html');
const pagesDir = path.join(apiDocBasePath, 'pages');
// ---------------

// --- API文档子目录将从 router.go 动态确定 --- 

// --- 新增：API 路径清理函数 ---
function cleanApiPath(apiPath) {
    if (!apiPath) return '';
    // 移除路径参数 :param 和通配符 *path (修正了 * 的转义)
    let cleanedPath = apiPath.trim().replace(/\/:[^/]+/g, '').replace(/\/\*[^/]+/g, ''); // Corrected regex for *path
    // 如果路径以 / 结尾且长度大于1，移除结尾的 /
    if (cleanedPath.endsWith('/') && cleanedPath.length > 1) {
       cleanedPath = cleanedPath.slice(0, -1);
    }
    return cleanedPath;
}
// ---------------------------

// --- 修改 getDefinedApis 函数，强制读取本地文件，并增加按分类返回 ---
async function getDefinedApis(filePath) {
    let content = '';
    let sourceDesc = `本地文件 ${path.basename(filePath)}`;
    try {
        content = await fs.readFile(filePath, 'utf-8');

        const lines = content.split('\n');
        const allApiPaths = new Set();        // 所有清理后的 API 路径
        const apiPathsByCategory = {}; // 按分类存储 API 路径
        const apiRegex = /^\s*ginServer\.(?:Handle|Any|GET|POST|PUT|DELETE|PATCH)\(\s*"[^"]+",\s*"(\/api\/[^"+,]+)"/;

        for (const line of lines) {
            if (line.trim().startsWith('//') || line.trim() === '') {
                continue;
            }
            const match = line.match(apiRegex);
            if (match && match[1]) {
                const rawApiPath = match[1];
                // 不再忽略 WebSocket 路径
                const cleanedPath = cleanApiPath(rawApiPath);
                if(cleanedPath) {
                    allApiPaths.add(cleanedPath);

                    // 按分类存储 (需要考虑 /ws/ 路径的分类方式)
                    const parts = cleanedPath.split('/');
                    if (parts.length > 2 && (parts[1] === 'api' || parts[1] === 'ws')) {
                        const category = parts[2]; // 例如 /ws/main -> category 'main'
                        if (!apiPathsByCategory[category]) {
                            apiPathsByCategory[category] = new Set();
                        }
                        apiPathsByCategory[category].add(cleanedPath);
                    } else if (parts.length === 3 && parts[1] === 'ws') {
                        // 处理根 WebSocket 路径，如 /ws/
                        const category = 'websocket'; // 或者其他合适的默认分类名
                        if (!apiPathsByCategory[category]) {
                            apiPathsByCategory[category] = new Set();
                        }
                        apiPathsByCategory[category].add(cleanedPath);
                    } else {
                         // 可以考虑为 /api/xxx 这种无明确分类的设置默认分类
                         // console.warn(`   ⚠️ 未能确定 API 路径 ${cleanedPath} 的分类`);
                    }
                }
            }
        }
        console.log(`\n🔍 从 ${sourceDesc} 中找到 ${allApiPaths.size} 个 API/WS 定义，分布在 ${Object.keys(apiPathsByCategory).length} 个分类中。`);
        return { allDefinedApis: allApiPaths, definedApisByCategory: apiPathsByCategory };
    } catch (err) {
        if (err.code === 'ENOENT') {
             console.error(`❌ 错误：无法在指定路径找到 router.go 文件: ${filePath}`);
             console.error(`   请确认 '../siyuan' 目录是否存在于 '${apiDocBasePath}' 的同级目录下，并且包含 'kernel/api/router.go'。`);
        } else {
            console.error(`❌ 读取或解析 ${sourceDesc} 出错:`, err);
        }
        return { allDefinedApis: new Set(), definedApisByCategory: {} }; // 返回空集合，避免后续出错
    }
}

async function getDocumentedApis(basePath, indexFile) {
    const documentedApis = new Set();
    const pageFiles = new Set(); // Keep for logging or potential future use

    // Regex for fallback (kept for compatibility) - Corrected regex and lookahead
    const apiPathRegexFallback = /(?:(?:GET|POST|PUT|DELETE|PATCH)?\s+)?(?:<code>)?(?:POST\s+)?(\/api\/[a-zA-Z0-9\/-]+)(?:<\/code>)?(?=[\s<"']|$)/g;
    // Regex to find the new meta tag - Making it more robust
    const metaTagRegex = /<meta[^>]*name\s*=\s*["']siyuan-api-endpoint["'][^>]*content\s*=\s*["'](\/api\/[^"']+)["'][^>]*>/i; // Corrected regex


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
                                const apiPath = cleanApiPath(metaMatch[1]); // <--- 使用清理函数
                                // if (isTargetFile) console.log(`  [DEBUG Meta Found] Cleaned API Path: ${apiPath}`); // DEBUG META FOUND - Modified
                                if (apiPath) { // 确保清理后路径有效
                                   documentedApis.add(apiPath);
                                   foundApi = true;
                                }
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
                                        const apiPath = cleanApiPath(apiMatchFallback[1]); // <--- 使用清理函数
                                        if (apiPath) { // 确保清理后路径有效
                                            documentedApis.add(apiPath);
                                        }
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

// --- 检查 API 文件结构 (一对一) ---
// (改为扫描所有物理目录检查孤立文件，并基于定义检查缺失文件)
async function checkApiFileStructure(definedApisSet, basePath) {
    console.log('\n📂 开始检查 API 文件结构 (一对一匹配)...');
    const orphanedDocs = [];
    const missingDocs = [];
    const foundDocFilePaths = new Set(); // 存储找到的实际文档文件绝对路径
    let scannedFilesCount = 0;

    // --- 第一遍：扫描物理目录，查找孤立文件并记录实际文件路径 ---
    let physicalDirs = [];
    try {
        physicalDirs = (await fs.readdir(basePath, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.')); // 过滤掉隐藏目录等
    } catch (err) {
        console.error(`   ❌ 无法读取基础目录 ${basePath}:`, err.message);
        return; // 无法继续检查
    }

    for (const physDir of physicalDirs) {
        const dirPath = path.join(basePath, physDir.name);
        let filesInDir = [];
        try {
            filesInDir = await fs.readdir(dirPath);
        } catch (dirErr) {
            if (dirErr.code !== 'ENOENT') {
                console.error(`   ❌ 读取目录 ${dirPath} 出错:`, dirErr.message);
            }
            continue; // 跳过无法读取的目录
        }

        for (const file of filesInDir) {
            if (file.endsWith('.html') && file !== 'index.html') {
                scannedFilesCount++;
                const actualFilePath = path.resolve(dirPath, file); // 使用绝对路径
                foundDocFilePaths.add(actualFilePath);

                // 推断 API 并检查是否孤立
                const fileNameWithoutExt = path.basename(file, '.html');
                const expectedApiPath = cleanApiPath(`/api/${physDir.name}/${fileNameWithoutExt}`);

                if (expectedApiPath && !definedApisSet.has(expectedApiPath)) {
                     // 检查推断出的 API 是否在定义中
                     orphanedDocs.push({ path: expectedApiPath, file: path.join(physDir.name, file) });
                }
            }
        }
    }

    // --- 第二遍：基于 API 定义检查缺失的文件 ---
    for (const definedApi of definedApisSet) {
        const parts = definedApi.split('/');
        // 假设 API 路径格式为 /api/category/endpoint 或更长
        if (parts.length >= 4 && parts[1] === 'api') {
            const category = parts[2];
            const endpointName = parts[parts.length - 1]; 
            // 构建预期的绝对文件路径
            const expectedFilePath = path.resolve(basePath, category, `${endpointName}.html`);

            if (!foundDocFilePaths.has(expectedFilePath)) {
                missingDocs.push(definedApi);
            }
        } else {
            // 可以选择报告格式不规范的 API 定义
            // console.warn(`   ⚠️ 无法为 API ${definedApi} 推断预期的文件路径，格式不符合 /api/category/endpoint`);
        }
    }

    // --- 报告结果 ---
    console.log(`   扫描了 ${physicalDirs.length} 个物理子目录中的 ${scannedFilesCount} 个非索引 HTML 文件.`);
    if (missingDocs.length === 0) {
        console.log('   ✅ 文件结构检查：所有定义的 API 都有对应的文档文件。');
    } else {
        console.log(`   🚨 文件结构检查：发现 ${missingDocs.length} 个 API 缺少对应的文档文件:`);
        missingDocs.sort().forEach(api => console.log(`     - ${api}`));
    }

    if (orphanedDocs.length === 0) {
        console.log('   ✅ 文件结构检查：未发现孤立的文档文件。');
    } else {
        console.log(`   ⚠️ 文件结构检查：发现 ${orphanedDocs.length} 个孤立的文档文件 (定义不存在或路径/名称错误):`);
        orphanedDocs.sort((a, b) => a.path.localeCompare(b.path)).forEach(doc => console.log(`     - ${doc.path} (来自文件: ${doc.file})`));
    }
}

// --- 检查分组索引文件 (index.html) ---
// (改为扫描所有物理目录的 index.html, 再与代码定义对比)
async function checkGroupIndices(definedApisByCategory, basePath) {
    console.log('\n📄 开始检查分组索引文件 (index.html)... ');
    const indexLinkRegex = /<a\s+[^>]*href\s*=\s*["'][^"']+\.html["'][^>]*>(\/api\/[^<]+)<\/a>/gi; // 提取链接文本中的 API
    const categoriesFromCode = Object.keys(definedApisByCategory); // 从代码确定分类
    
    const foundIndexFilesByCategory = {}; // 存储找到的 index.html 内容: { category: Set<apiPath> }
    const categoriesWithExistingIndex = new Set(); // 记录哪些分类实际找到了 index.html

    // --- 第一步：扫描物理目录，查找并解析所有存在的 index.html ---
    let physicalDirs = [];
    try {
        physicalDirs = (await fs.readdir(basePath, { withFileTypes: true }))
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));
    } catch (err) {
        console.error(`   ❌ 无法读取基础目录 ${basePath}:`, err.message);
        return; // 无法继续检查
    }

    for (const physDir of physicalDirs) {
        const categoryName = physDir.name;
        const indexPath = path.join(basePath, categoryName, 'index.html');
        let apisInIndexHtml = new Set();

        try {
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            categoriesWithExistingIndex.add(categoryName); // 标记找到了 index.html
            let match;
            while ((match = indexLinkRegex.exec(indexContent)) !== null) {
                if (match[1]) {
                    const cleanedPath = cleanApiPath(match[1]);
                    // 暂时不过滤是否属于本分类，后续比较时处理
                    if (cleanedPath) {
                         apisInIndexHtml.add(cleanedPath);
                    }
                }
            }
            foundIndexFilesByCategory[categoryName] = apisInIndexHtml;
        } catch (readErr) {
            if (readErr.code !== 'ENOENT') { // 只忽略文件不存在错误
                console.error(`   ❌ 读取索引文件 ${path.join(categoryName, 'index.html')} 出错:`, readErr.message);
            }
            // 如果文件不存在， categoriesWithExistingIndex 就不会包含这个 categoryName
        }
    }

    // --- 第二步：对比并报告 --- 
    
    // 2.1 检查代码中定义的分类
    console.log('   --- 对比代码定义与索引文件 ---');
    for (const codeCategory of categoriesFromCode) {
        const definedApisInThisCategory = definedApisByCategory[codeCategory];

        if (categoriesWithExistingIndex.has(codeCategory)) {
            // 代码定义的分类，且找到了 index.html
            const apisInIndexHtml = foundIndexFilesByCategory[codeCategory];
            const missingInIndex = [];
            const extraneousInIndex = [];
            const actuallyInCategoryInIndex = new Set(); // 存储 index.html 中真正属于本分类的 API

            // 筛选 index.html 中真正属于本分类的 API
            for(const api of apisInIndexHtml){
                if(api.startsWith(`/api/${codeCategory}/`)){
                    actuallyInCategoryInIndex.add(api);
                }
                // (可以考虑报告那些不属于本分类的链接)
            }

            // 比较
            for (const definedApi of definedApisInThisCategory) {
                if (!actuallyInCategoryInIndex.has(definedApi)) {
                    missingInIndex.push(definedApi);
                }
            }
            for (const indexApi of actuallyInCategoryInIndex) {
                if (!definedApisInThisCategory.has(indexApi)) {
                    extraneousInIndex.push(indexApi);
                }
            }

            if (missingInIndex.length === 0 && extraneousInIndex.length === 0) {
                console.log(`   ✅ 索引检查 [${codeCategory}]: index.html 内容与 API 定义一致 (${definedApisInThisCategory.size} 个)。`);
            } else {
                if (missingInIndex.length > 0) {
                    console.log(`   🚨 索引检查 [${codeCategory}]: index.html 中缺少 ${missingInIndex.length} 个 API 列表项:`);
                    missingInIndex.sort().forEach(api => console.log(`     - ${api}`));
                }
                if (extraneousInIndex.length > 0) {
                    console.log(`   ⚠️ 索引检查 [${codeCategory}]: index.html 中包含 ${extraneousInIndex.length} 个多余/错误的 API 列表项:`);
                    extraneousInIndex.sort().forEach(api => console.log(`     - ${api}`));
                }
            }
        } else {
            // 代码定义的分类，但没有找到 index.html
            console.log(`   🚨 索引检查 [${codeCategory}]: 分组在代码中存在 API 定义，但缺少 index.html 文件!`);
        }
    }

    // 2.2 检查实际找到但代码中未定义的索引文件 (孤立索引)
    console.log('   --- 检查孤立的索引文件 ---');
    let foundOrphanedIndex = false;
    for (const indexCategory of categoriesWithExistingIndex) {
        if (!definedApisByCategory.hasOwnProperty(indexCategory)) {
            foundOrphanedIndex = true;
            const apisInIndexHtml = foundIndexFilesByCategory[indexCategory];
            console.log(`   ⚠️ 索引检查 [${indexCategory}]: index.html 存在但分组无对应 API 定义 (可能已过时或指代特殊路由)。`);
            if (apisInIndexHtml.size > 0) {
                console.log(`      > 该 index.html 文件中包含 ${apisInIndexHtml.size} 个无法验证的 API 列表项:`);
                [...apisInIndexHtml].sort().forEach(api => console.log(`        - ${api}`));
            }
        }
    }
    if (!foundOrphanedIndex) {
        console.log('   ✅ 未发现孤立的 index.html 文件。');
    }
}

// 主函数 - 重构以执行双重校验
async function findUndocumentedApis() {
    // --- 更新本地思源仓库 ---
    console.log(`\n🔄 正在尝试更新本地思源仓库: ${siyuanRepoPath}`);
    try {
        await fs.access(siyuanRepoPath);
        await fs.access(path.join(siyuanRepoPath, '.git'));
        console.log(`   切换到目录: ${siyuanRepoPath}`);
        const pullOutput = execSync('git pull', { cwd: siyuanRepoPath, encoding: 'utf-8', stdio: 'pipe' });
        console.log('✅ 本地思源仓库更新成功:');
        const lines = pullOutput.split('\n').filter(line => line.trim() !== '' && !line.startsWith('From '));
        console.log(lines.join('\n'));
    } catch (error) {
        if (error.code === 'ENOENT') {
             console.error(`❌ 错误：找不到本地思源仓库目录或 .git 目录: ${siyuanRepoPath}`);
             console.error('   请确认已将思源主仓库克隆到与文档仓库同级的 siyuan 目录下。');
        } else {
            console.error(`❌ 更新本地思源仓库失败: ${error.message}`);
            if (error.stderr) {
                console.error("Stderr:", error.stderr.toString().trim());
            }
            if (error.stdout) { // 有时错误信息在 stdout
                 console.error("Stdout:", error.stdout.toString().trim());
            }
        }
        console.log('⚠️ 将继续使用当前本地代码进行检查。');
    }
    // --- 更新结束 ---

    // --- 读取和解析 router.go ---
    console.log(`\nℹ️ 将从本地路径读取 router.go: ${routerGoPath}`);
    const { allDefinedApis, definedApisByCategory } = await getDefinedApis(routerGoPath);
    if (allDefinedApis.size === 0) {
        console.log('🤷‍♀️ 未能在本地 router.go 中找到任何 API 定义或读取文件失败，检查结束。');
        return;
    }
    console.log('🚀 开始双重校验 API 文档覆盖情况...');

    // --- 执行校验 ---
    // 1. 检查文件结构 (一对一)
    await checkApiFileStructure(allDefinedApis, apiDocBasePath);

    // 2. 检查分组索引 (index.html)
    await checkGroupIndices(definedApisByCategory, apiDocBasePath);

    // --- (移除旧的比较逻辑) ---
    /*
    const documentedApisRaw = await getDocumentedApis(apiDocBasePath, indexHtmlPath);
    const definedApis = new Set([...allDefinedApis].map(api => api.trim())); // 使用 allDefinedApis
    const documentedApis = new Set([...documentedApisRaw].map(api => api.trim()));

    const undocumentedApis = [];
    for (const api of definedApis) {
        if (!documentedApis.has(api)) {
            undocumentedApis.push(api);
        }
    }

    const extraneousApis = [];
    for (const api of documentedApis) {
        if (!definedApis.has(api)) {
            extraneousApis.push(api);
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

    if (extraneousApis.length > 0) {
        console.log(`\n⚠️ 警告：发现 ${extraneousApis.length} 个 API 引用存在于文档中，但在 router.go 中未定义：`);
        extraneousApis.sort().forEach(api => console.log(`   - ${api}`));
        console.log('\n   请检查这些文档是否已过时、meta 标签是否错误，或是否是脚本解析 fallback 导致的误报。');
    }
    */
    // --- 结束移除旧逻辑 ---

    console.log('\n🏁 双重校验完成。请查看上面的详细报告。 ');
}

findUndocumentedApis(); 