// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 300 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-personas') {
    try {
      const { url } = msg;
      
      // Send progress update
      figma.ui.postMessage({ type: 'status', message: 'Analyzing website...' });
      
      // Step 1: Analyze website
      const analyzeResponse = await fetch('https://flowtusk.vercel.app/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!analyzeResponse.ok) {
        throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
      }
      
      const { factsJson } = await analyzeResponse.json();
      
      // Send progress update
      figma.ui.postMessage({ type: 'status', message: 'Generating personas...' });
      
      // Step 2: Generate ICPs
      const icpResponse = await fetch('https://flowtusk.vercel.app/api/generate-icps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factsJson })
      });
      
      if (!icpResponse.ok) {
        throw new Error(`ICP generation failed: ${icpResponse.statusText}`);
      }
      
      const { icps } = await icpResponse.json();
      
      if (!icps || icps.length === 0) {
        throw new Error('No personas generated');
      }
      
      // Step 3: Analyze Figma template structure
      figma.ui.postMessage({ type: 'status', message: 'Analyzing template...' });
      
      const textLayerMetadata = extractTextLayerMetadata();
      
      if (textLayerMetadata.length === 0) {
        throw new Error('No text layers found. Create text layers in your Figma file first.');
      }
      
      // Step 4: Get intelligent field mapping from GPT
      figma.ui.postMessage({ type: 'status', message: 'Mapping fields intelligently...' });
      
      const mappingResponse = await fetch('https://flowtusk.vercel.app/api/figma-template-mapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textLayers: textLayerMetadata,
          icpData: icps[0] // Use first ICP
        })
      });
      
      if (!mappingResponse.ok) {
        throw new Error(`Mapping failed: ${mappingResponse.statusText}`);
      }
      
      const { templateType, mappings, confidence } = await mappingResponse.json();
      
      console.log('Template type:', templateType);
      console.log('Mappings:', mappings);
      console.log('Confidence:', confidence);
      
      // Step 5: Apply mappings
      figma.ui.postMessage({ type: 'status', message: 'Filling fields...' });
      
      await applyIntelligentMappings(mappings, icps[0]);
      
      // Success
      figma.ui.postMessage({ 
        type: 'success', 
        message: `✅ Filled ${mappings.length} fields (${confidence}% confidence)` 
      });
      
    } catch (error: any) {
      figma.ui.postMessage({ 
        type: 'error', 
        message: error.message || 'An error occurred' 
      });
    }
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Extract text layer metadata for GPT analysis
function extractTextLayerMetadata() {
  const selection = figma.currentPage.selection;
  const nodesToSearch = selection.length > 0 ? selection : [figma.currentPage];
  
  const textNodes = [];
  for (const node of nodesToSearch) {
    textNodes.push(...findAllTextNodes(node));
  }
  
  return textNodes.map(node => ({
    id: node.id,
    name: node.name,
    content: node.characters.substring(0, 200), // Limit to 200 chars for API efficiency
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fontSize: typeof node.fontSize === 'number' ? node.fontSize : undefined,
    fontWeight: typeof node.fontWeight === 'number' ? node.fontWeight : undefined,
    parentName: node.parent?.name,
  }));
}

// Apply intelligent mappings from GPT
async function applyIntelligentMappings(mappings: any[], icpData: any) {
  const textNodeMap = new Map<string, TextNode>();
  
  // Build a map of all text nodes by ID
  const selection = figma.currentPage.selection;
  const nodesToSearch = selection.length > 0 ? selection : [figma.currentPage];
  
  for (const node of nodesToSearch) {
    const textNodes = findAllTextNodes(node);
    for (const textNode of textNodes) {
      textNodeMap.set(textNode.id, textNode);
    }
  }
  
  let fillCount = 0;
  const lowConfidenceMappings: any[] = [];
  
  for (const mapping of mappings) {
    const textNode = textNodeMap.get(mapping.layerId);
    
    if (!textNode) {
      console.warn('Text node not found for mapping:', mapping);
      continue;
    }
    
    // Skip low confidence mappings (below 50%)
    if (mapping.confidence < 50) {
      lowConfidenceMappings.push(mapping);
      continue;
    }
    
    const value = icpData[mapping.icpField];
    
    if (value !== undefined && value !== null) {
      try {
        await figma.loadFontAsync(textNode.fontName as FontName);
        
        // Format value based on type
        if (Array.isArray(value)) {
          // Convert arrays to bullet lists
          textNode.characters = value.map(item => `• ${item}`).join('\n');
        } else {
          textNode.characters = String(value);
        }
        
        fillCount++;
        console.log(`✅ Filled ${textNode.name} with ${mapping.icpField} (${mapping.confidence}% confidence)`);
      } catch (error) {
        console.error('Error filling text node:', error);
      }
    }
  }
  
  // Notify about results
  if (fillCount > 0) {
    figma.notify(`✅ Filled ${fillCount} field${fillCount > 1 ? 's' : ''}`, { 
      timeout: 3000 
    });
  } else {
    figma.notify('⚠️ No fields matched with high confidence. Try renaming your text layers.', { 
      timeout: 5000 
    });
  }
  
  // Log low confidence mappings for debugging
  if (lowConfidenceMappings.length > 0) {
    console.log('Low confidence mappings (not applied):', lowConfidenceMappings);
  }
}

// Recursively find all text nodes
function findAllTextNodes(node: SceneNode | PageNode): TextNode[] {
  const textNodes: TextNode[] = [];
  
  if (node.type === 'TEXT') {
    textNodes.push(node);
  }
  
  if ('children' in node) {
    for (const child of node.children) {
      textNodes.push(...findAllTextNodes(child));
    }
  }
  
  return textNodes;
}

