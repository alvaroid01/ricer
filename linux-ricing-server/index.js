const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');
const app = express();
const PORT = 3001;

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Middleware to parse JSON requests
app.use(express.json());

// Add CORS middleware
app.use(cors());

// Serve static files from screenshots directory
app.use('/screenshots', express.static('screenshots'));

// Helper function to determine package manager
function getPackageManager() {
    try {
        execSync('which apt');
        return 'apt';
    } catch {
        try {
            execSync('which pacman');
            return 'pacman';
        } catch {
            try {
                execSync('which dnf');
                return 'dnf';
            } catch {
                return null;
            }
        }
    }
}

// Route to capture screenshots
app.post('/capture', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required.' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the main URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Capture a screenshot of the main URL
    const mainScreenshotPath = path.join(screenshotsDir, 'main-page.png');
    await page.screenshot({ path: mainScreenshotPath });
    console.log(`Screenshot of main page saved: ${mainScreenshotPath}`);

    // Extract all links from the page
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map((a) => a.href).filter(href => href.startsWith('http'));
    });

    console.log(`Found ${links.length} links on the page.`);

    // Capture screenshots of each link
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      try {
        await page.goto(link, { waitUntil: 'networkidle2' });
        const screenshotPath = path.join(screenshotsDir, `link-${i + 1}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot of ${link} saved: ${screenshotPath}`);
      } catch (err) {
        console.error(`Failed to capture screenshot of ${link}:`, err);
      }
    }

    await browser.close();

    const screenshotUrls = {
      mainPage: `/screenshots/main-page.png`,
      links: links.map((_, index) => `/screenshots/link-${index + 1}.png`)
    };

    res.json({ 
      message: 'Screenshots captured successfully.',
      screenshots: screenshotUrls 
    });
  } catch (error) {
    console.error('Error capturing screenshots:', error);
    res.status(500).json({ error: 'Failed to capture screenshots.' });
  }
});

// Route to generate script
app.post('/generate-script', (req, res) => {
    const { tools } = req.body;
    
    if (!tools || !Array.isArray(tools)) {
        return res.status(400).json({ error: 'No tools selected.' });
    }

    let scriptContent = '#!/bin/bash\n\n';
    scriptContent += 'echo "Starting installation..."\n\n';

    // Add package manager detection
    scriptContent += `
if command -v apt &> /dev/null; then
    PKG_MANAGER="apt"
    INSTALL_CMD="apt install -y"
elif command -v pacman &> /dev/null; then
    PKG_MANAGER="pacman"
    INSTALL_CMD="pacman -S --noconfirm"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    INSTALL_CMD="dnf install -y"
else
    echo "No supported package manager found"
    exit 1
fi\n\n`;

    // Add installation commands for each tool
    tools.forEach(tool => {
        scriptContent += `echo "Installing ${tool}..."\n`;
        scriptContent += `sudo $INSTALL_CMD ${tool.toLowerCase()}\n\n`;
    });

    scriptContent += 'echo "Installation complete!"\n';

    // Save script to file
    const scriptPath = path.join(__dirname, 'install.sh');
    fs.writeFileSync(scriptPath, scriptContent, 'utf8');
    fs.chmodSync(scriptPath, '755');

    res.download(scriptPath, 'install.sh', (err) => {
        if (err) {
            console.error('Error sending script:', err);
            return res.status(500).json({ error: 'Failed to generate script.' });
        }
        // Clean up
        fs.unlinkSync(scriptPath);
    });
});
app.get('/health',(req,res)=>{
 return res.status(200).send('Alive')
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
