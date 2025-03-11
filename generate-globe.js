const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  // 启动无头浏览器
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 设置浏览器视窗大小，可根据实际需要调整
  await page.setViewport({ width: 800, height: 600 });

  // 构造 globe.html 的文件 URL（确保 generate-globe.js 与 globe.html 在同一目录下）
  const filePath = path.resolve(__dirname, 'globe.html');
  const fileUrl = 'file://' + filePath;

  // 打开 HTML 页面，等待网络稳定
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });

  // 等待一定时间确保 widget 渲染完成（此处等待 3 秒，可根据实际情况调整）
  await page.waitForTimeout(3000);

  // 查找页面中的 SVG 元素（如果 widget 渲染后产生的是 SVG）
  const svgHandle = await page.$('svg');
  if (!svgHandle) {
    console.error('未找到 SVG 元素，请检查 widget 是否已生成 SVG，或者调整等待时间/选择器');
    await browser.close();
    process.exit(1);
  }

  // 获取 SVG 元素的 outerHTML 内容
  const svgContent = await page.evaluate(svg => svg.outerHTML, svgHandle);

  // 确保输出目录（例如 dist）存在
  const outputDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // 将 SVG 内容写入文件（此处保存为 globe-widget.svg）
  const outputPath = path.join(outputDir, 'globe-widget.svg');
  fs.writeFileSync(outputPath, svgContent);

  console.log('SVG 文件已生成：', outputPath);
  await browser.close();
})();
