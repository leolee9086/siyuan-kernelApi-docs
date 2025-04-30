'use strict';

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const { pinyin } = require('pinyin-pro');

// API 文档根目录 (相对于脚本文件)
const apiDocBasePath = path.resolve(__dirname, '../');
// 输出的索引文件路径 (项目根目录)
const indexFilePath = path.join(apiDocBasePath, 'search_index.json');
// 忽略的目录
const ignoredDirs = new Set(['.git', 'node_modules', 'scripts', 'common', 'diary']); // 忽略 diary 目录

// 辅助函数：提取拼音
function getPinyin(text) {
    if (!text) return { full: '', first: '' };
    try {
        const full = pinyin(text, { toneType: 'none', nonZh: 'consecutive' }).toLowerCase();
        const first = pinyin(text, { pattern: 'first', toneType: 'none', nonZh: 'consecutive' }).toLowerCase();
        return { full, first };
    } catch (e) {
        console.warn(`   ⚠️ Pinyin generation failed for text: "${text.substring(0, 50)}..."`, e.message);
        return { full: text.toLowerCase(), first: '' }; // 出错时使用原文的小写作为全拼
    }
}

async function buildSearchIndex() {
    console.log('🚀 开始构建搜索索引...');
    const searchIndex = [];
    let processedFiles = 0;
    let failedFiles = 0;

    try {
        // 1. 获取所有分类目录
        const allDirents = await fs.readdir(apiDocBasePath, { withFileTypes: true });
        const categoryDirs = allDirents.filter(dirent =>
            dirent.isDirectory() && !ignoredDirs.has(dirent.name)
        );

        console.log(`📂 发现 ${categoryDirs.length} 个分类目录。`);

        // 2. 遍历每个分类目录
        for (const categoryDir of categoryDirs) {
            const categoryName = categoryDir.name;
            const categoryPath = path.join(apiDocBasePath, categoryName);
            let filesInDir = [];

            try {
                filesInDir = await fs.readdir(categoryPath);
            } catch (dirErr) {
                console.error(`   ❌ 读取目录 ${categoryPath} 出错:`, dirErr.message);
                continue;
            }

            // 3. 遍历目录下的 HTML 文件 (非 index.html)
            for (const fileName of filesInDir) {
                if (fileName.endsWith('.html') && fileName.toLowerCase() !== 'index.html') {
                    const apiDocPath = path.join(categoryPath, fileName);
                    let apiDocContent = '';
                    processedFiles++;

                    try {
                        // 4. 读取 API 文档内容
                        apiDocContent = await fs.readFile(apiDocPath, 'utf-8');
                        const $apiDoc = cheerio.load(apiDocContent);

                        // 5. 提取信息
                        const h1 = $apiDoc('h1').first();
                        const apiName = h1.text().trim(); // API 名称 (通常也是文件名)
                        let description = '';
                        let apiPath = '';

                        // 尝试从 h1 后面的第一个 <p> 提取描述
                        let nextElement = h1.next();
                        while (nextElement.length > 0 && !nextElement.is('p, h2, h3, h4, div.risk-warning, div.important-note, div.test-area')) {
                            nextElement = nextElement.next();
                        }
                        if (nextElement.is('p')) {
                            description = nextElement.text().trim();
                        }
                        if (!description) {
                           description = $apiDoc('h1').nextAll('p').first().text().trim();
                        }

                        // 尝试从 <h2>地址</h2> 下面的 <code> 提取 API 路径
                        const addressHeading = $apiDoc('h2:contains("地址")');
                        if (addressHeading.length > 0) {
                             const codeElement = addressHeading.nextAll('p').find('code').first();
                             if(codeElement.length > 0){
                                 // 提取路径，移除方法前缀 (GET/POST等)
                                 const rawPath = codeElement.text().trim();
                                 apiPath = rawPath.replace(/^(GET|POST|PUT|DELETE|PATCH)\s+/i, '');
                             }
                        }

                        // 如果没提取到 API 路径，尝试根据分类和文件名猜测
                        if (!apiPath && apiName) {
                            // 默认猜测 /api/ 前缀，可以根据需要调整或增加 /ws/ 判断
                            apiPath = `/api/${categoryName}/${apiName}`;
                            console.warn(`   ⚠️ 未能在 ${fileName} 中找到明确的 API 地址，猜测为: ${apiPath}`);
                        }

                        if (!apiName || !description || !apiPath) {
                            console.warn(`   ⚠️ 文件 ${fileName} 信息不完整 (名称: ${!!apiName}, 描述: ${!!description}, 路径: ${!!apiPath})，跳过。`);
                            failedFiles++;
                            continue;
                        }

                        // 6. 生成拼音
                        const textToPinyin = `${apiPath} ${description}`;
                        const pinyinData = getPinyin(textToPinyin);

                        // 7. 添加到索引
                        searchIndex.push({
                            category: categoryName,
                            file: `${categoryName}/${fileName}`,
                            path: apiPath,
                            description: description,
                            pinyin_full: pinyinData.full,
                            pinyin_first: pinyinData.first
                        });
                        // console.log(`      ✅ 处理文件: ${fileName}`);

                    } catch (readErr) {
                        console.error(`   ❌ 处理文件 ${apiDocPath} 出错:`, readErr.message);
                        failedFiles++;
                    }
                }
            }
        }

        // 8. 写入 JSON 索引文件
        if (searchIndex.length > 0) {
            try {
                await fs.writeFile(indexFilePath, JSON.stringify(searchIndex, null, 2), 'utf-8');
                console.log(`\n💾 成功将 ${searchIndex.length} 条记录写入到索引文件: ${indexFilePath}`);
            } catch (writeErr) {
                console.error(`\n❌ 写入索引文件 ${indexFilePath} 失败:`, writeErr.message);
            }
        } else {
            console.log('\n🤷‍♀️ 未生成任何索引记录。');
        }

        console.log(`\n🏁 索引构建完成。`);
        console.log(`   总共处理了 ${processedFiles} 个 HTML 文件。`);
        console.log(`   成功生成了 ${searchIndex.length} 条索引记录。`);
        if(failedFiles > 0) {
             console.warn(`   ⚠️ 有 ${failedFiles} 个文件因信息不完整或读取错误未能加入索引。`);
        }

    } catch (error) {
        console.error('\n💥 脚本执行过程中发生错误:', error);
        process.exit(1);
    }
}

// --- 运行主函数 ---
buildSearchIndex(); 