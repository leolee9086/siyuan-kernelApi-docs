'use strict';

const fs = require('fs').promises;
const path = require('path');

// Note: Using native Node.js methods instead of glob to avoid external dependency

const workspaceRoot = path.resolve(__dirname, '../'); // 文档根目录
const sponsorshipLink = 'https://afdian.com/a/leolee9086?tab=feed';
const ignoreDirs = new Set(['node_modules', '.git', 'scripts']); // 忽略检查的目录 (使用 Set 提高查找效率)
const ignoreFiles = new Set(['api-template.html', 'group-template.html', 'index.html']); // 忽略检查的特定文件

async function findHtmlFilesRecursive(dir, baseDir, allFiles = []) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const fullPath = path.resolve(dir, dirent.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (dirent.isDirectory()) {
            // 检查是否是需要忽略的目录
            if (!ignoreDirs.has(dirent.name)) {
                await findHtmlFilesRecursive(fullPath, baseDir, allFiles);
            }
        } else if (dirent.isFile() && dirent.name.endsWith('.html')) {
            // 检查是否是需要忽略的文件 (只检查文件名部分)
            // 同时确保不是根目录下的 index.html
            if (!ignoreFiles.has(dirent.name) && relativePath !== 'index.html') {
                allFiles.push(fullPath);
            }
        }
    }
    return allFiles;
}

async function checkSponsorshipLink(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content.includes(sponsorshipLink);
    } catch (err) {
        console.error(`   ❌ 读取文件 ${path.relative(workspaceRoot, filePath)} 出错:`, err.message);
        return false; // 读取失败也算作未包含
    }
}

async function main() {
    console.log('🔍 开始检查 HTML 文件中的赞助链接...');
    console.log(`   目标链接: ${sponsorshipLink}`);
    console.log(`   忽略目录: ${Array.from(ignoreDirs).join(', ')}`);
    console.log(`   忽略文件: ${Array.from(ignoreFiles).join(', ')}`);

    let htmlFiles = [];
    try {
        htmlFiles = await findHtmlFilesRecursive(workspaceRoot, workspaceRoot);
    } catch (err) {
        console.error('❌ 查找 HTML 文件时出错:', err);
        return;
    }

    if (htmlFiles.length === 0) {
        console.log('🤷‍♀️ 未找到任何需要检查的 HTML 文件。');
        return;
    }

    console.log(`   找到了 ${htmlFiles.length} 个需要检查的 HTML 文件。
`);

    const missingLinkFiles = [];
    let checkedCount = 0;
    for (const file of htmlFiles) {
        const hasLink = await checkSponsorshipLink(file);
        if (!hasLink) {
            missingLinkFiles.push(path.relative(workspaceRoot, file));
        }
        checkedCount++;
        // 简单的进度反馈
        if (checkedCount % 50 === 0 || checkedCount === htmlFiles.length) {
             process.stdout.write(`   检查进度: ${checkedCount}/${htmlFiles.length}`);
        }
    }
    console.log('\n'); // 确保进度条后换行

    if (missingLinkFiles.length === 0) {
        console.log('✅🎉 所有检查的 HTML 文件都包含了赞助链接！');
    } else {
        console.log(`🚨 发现 ${missingLinkFiles.length} 个文件缺少赞助链接:`);
        missingLinkFiles.sort().forEach(f => console.log(`   - ${f.replace(/\\/g, '/')}`)); // 统一路径分隔符
        console.log('\n   请检查以上文件并添加赞助链接。');
    }
}

main().catch(err => {
    console.error("\n💥 脚本执行过程中发生未捕获的错误:", err);
    process.exit(1);
}); 