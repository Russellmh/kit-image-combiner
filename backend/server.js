const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Fetch images endpoint
app.post('/fetch-images', async (req, res) => {
    try {
        const { partNumbers } = req.body;
        
        if (!partNumbers || !Array.isArray(partNumbers)) {
            return res.status(400).json({ error: 'Invalid part numbers provided' });
        }
        
        // Validate maximum part numbers (6 parts maximum)
        if (partNumbers.length > 6) {
            return res.status(400).json({ error: 'Maximum 6 part numbers allowed' });
        }
        
        // Validate each part number is a string
        const invalidParts = partNumbers.filter(part => typeof part !== 'string' || part.trim() === '');
        if (invalidParts.length > 0) {
            return res.status(400).json({ error: 'All part numbers must be non-empty strings' });
        }
        
        console.log(`Fetching images for ${partNumbers.length} part numbers:`, partNumbers);
        
        const imagePromises = partNumbers.map(async (partNumber, index) => {
            try {
                const cleanPartNumber = partNumber.trim();
                const imageUrl = `https://assets.rs-online.com/c_scale,w_200,f_auto,q_auto,d_no_image.png/${cleanPartNumber}.jpg`;
                console.log(`[${index + 1}/${partNumbers.length}] Fetching: ${imageUrl}`);
                
                const response = await fetch(imageUrl, {
                    timeout: 10000, // 10 second timeout
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'image/*,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error('Response is not an image');
                }
                
                const buffer = await response.buffer();
                
                // Check if buffer is too small (likely error image)
                if (buffer.length < 1000) {
                    throw new Error('Image file too small (likely not found)');
                }
                
                const base64 = buffer.toString('base64');
                
                console.log(`✅ Successfully fetched image for ${cleanPartNumber} (${buffer.length} bytes)`);
                
                return {
                    partNumber: cleanPartNumber,
                    success: true,
                    data: base64,
                    contentType,
                    size: buffer.length
                };
                
            } catch (error) {
                console.error(`❌ Failed to fetch image for ${partNumber}:`, error.message);
                return {
                    partNumber: partNumber.trim(),
                    success: false,
                    error: error.message
                };
            }
        });
        
        const results = await Promise.allSettled(imagePromises);
        
        // Process settled promises
        const processedResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`❌ Promise rejected for part ${partNumbers[index]}:`, result.reason);
                return {
                    partNumber: partNumbers[index].trim(),
                    success: false,
                    error: result.reason?.message || 'Unknown error occurred'
                };
            }
        });
        
        const successCount = processedResults.filter(r => r.success).length;
        const failureCount = processedResults.length - successCount;
        
        console.log(`📊 Results: ${successCount} successful, ${failureCount} failed out of ${processedResults.length} total`);
        
        res.json({
            success: true,
            images: processedResults,
            summary: {
                total: processedResults.length,
                successful: successCount,
                failed: failureCount
            }
        });
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add a new endpoint to get server capabilities
app.get('/capabilities', (req, res) => {
    res.json({
        maxPartNumbers: 6,
        supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif'],
        maxImageSize: '10MB',
        timeout: '10 seconds',
        version: '2.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /health - Health check',
            'GET /capabilities - Server capabilities',
            'POST /fetch-images - Fetch images by part numbers'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  GET  /health - Health check');
    console.log('  GET  /capabilities - Server capabilities');
    console.log('  POST /fetch-images - Fetch images by part numbers (max 6)');
    console.log(`🔧 Maximum part numbers supported: 6`);
});

module.exports = app;
