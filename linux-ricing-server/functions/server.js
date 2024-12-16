const express = require('express');
const serverless = require('netlify-lambda');
const app = express();
const router = express.Router();
// Middleware to parse JSON requests
app.use(express.json());

// Add CORS middleware
app.use(cors());
// Add your existing routes here
router.get('/health', (req, res) => {
  return res.status(200).send('Alive');
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

app.use('/.netlify/functions/server', router);

module.exports.handler = serverless(app); 