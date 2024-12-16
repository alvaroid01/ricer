const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { tools } = JSON.parse(event.body);
        
        if (!tools || !Array.isArray(tools)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No tools selected.' })
            };
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

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/x-sh',
                'Content-Disposition': 'attachment; filename=install.sh'
            },
            body: scriptContent,
            isBase64Encoded: false
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate script.' })
        };
    }
}; 