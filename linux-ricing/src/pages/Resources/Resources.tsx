import React, { useState, useEffect } from 'react'
import {data} from './data'
import './Resources.css'

const Resources = () => {
    const [selectedSection, setSelectedSection] = useState(Object.keys(data.packages)[0])
    const [selectedSubSection, setSelectedSubSection] = useState('')
    const [screenshots, setScreenshots] = useState<Record<string, string>>({})
    const [selectedTools, setSelectedTools] = useState<string[]>([])



    const handleToolSelect = (tool: any) => {
        setSelectedTools(prev => 
            prev.includes(tool.name) 
                ? prev.filter(t => t !== tool.name)
                : [...prev, tool.name]
        );
    };

    const generateInstallScript = async () => {
        try {
            const response = await fetch('/.netlify/functions/generate-script', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tools: selectedTools })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'install.sh';
                a.click();
            }
        } catch (error) {
            console.error('Error generating script:', error);
        }
    };

    return (
        <div className="resources-container">
            <div className="tab-buttons">
                {Object.keys(data.packages).map(section => (
                    <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`tab-button ${selectedSection === section ? 'active' : ''}`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            <div className="subtab-buttons">
                {Object.keys(data.packages[selectedSection]).map(subsection => (
                    <button
                        key={subsection}
                        onClick={() => setSelectedSubSection(subsection)}
                        className={`tab-button ${selectedSubSection === subsection ? 'active' : ''}`}
                    >
                        {subsection}
                    </button>
                ))}
            </div>

            <div className="content-grid">
                {data.packages[selectedSection][selectedSubSection]?.map((item: any, index: number) => (
                    <div key={index} className="content-card">
                        <div className="tool-header">
                            <input 
                                type="checkbox"
                                checked={selectedTools.includes(item.name)}
                                onChange={() => handleToolSelect(item)}
                            />
                            <h3>{item.name}</h3>
                        </div>
                        {item.description && <p className="description">{item.description}</p>}
                        {item.language && <p className="language">Language: {item.language}</p>}
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            View Project
                        </a>
                      
                    </div>
                ))}
            </div>

            {selectedTools.length > 0 && (
                <button 
                    className="generate-script-button"
                    onClick={generateInstallScript}
                >
                    Generate Installation Script ({selectedTools.length} tools)
                </button>
            )}
        </div>
    )
}

export default Resources