document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('fetch-form');
    const urlInput = document.getElementById('youtube-url');
    const fetchBtn = document.getElementById('fetch-btn');
    const btnText = form.querySelector('.btn-text');
    const loader = form.querySelector('.loader');
    const errMsg = document.getElementById('error-message');
    
    const resultContainer = document.getElementById('result-container');
    const thumbnailImg = document.getElementById('thumbnail-img');
    const downloadBtn = document.getElementById('download-btn');
    
    const ctaSection = document.getElementById('cta-section');

    let currentImageUrl = '';

    // Extract Video ID from various YouTube URL formats
    const extractVideoId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        const videoId = extractVideoId(url);

        if (!videoId) {
            showError();
            return;
        }

        // Hide error if previously shown
        errMsg.classList.add('hidden');
        
        // Show loading state
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        fetchBtn.disabled = true;

        // Construct high-res thumbnail URL
        // maxresdefault.jpg is the highest resolution (1080p).
        // Fallbacks like hqdefault.jpg exist but we try max first.
        currentImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Simulate a slight delay for dramatic "fetching" effect, though it's instant client-side
        setTimeout(() => {
            // Test if the maxresdefault exists by loading it
            const tempImg = new Image();
            tempImg.onload = () => {
                // If the width is 120 (YouTube's default tiny fallback response for missing maxres), 
                // it means maxres isn't available. We fallback to sddefault (640x480).
                if (tempImg.width === 120) {
                    currentImageUrl = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                }
                
                thumbnailImg.src = currentImageUrl;
                
                // Reset button state
                btnText.classList.remove('hidden');
                loader.classList.add('hidden');
                fetchBtn.disabled = false;

                // Show results and CTAs
                resultContainer.classList.remove('hidden');
                ctaSection.classList.remove('hidden');
                
                // Scroll down slightly
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };
            
            tempImg.onerror = () => {
                showError();
                btnText.classList.remove('hidden');
                loader.classList.add('hidden');
                fetchBtn.disabled = false;
            };

            tempImg.src = currentImageUrl;

        }, 800);
    });

    function showError() {
        errMsg.classList.remove('hidden');
        resultContainer.classList.add('hidden');
    }

    // Handle Download
    downloadBtn.addEventListener('click', async () => {
        if (!currentImageUrl) return;

        try {
            // Fetch the image as a blob to force download instead of just opening in a new tab
            const response = await fetch(currentImageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            // Name the file based on the ID for uniqueness
            const vidId = extractVideoId(urlInput.value) || 'thumbnail';
            a.download = `yt_thumbnail_${vidId}.jpg`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (err) {
            // Fallback if CORS prevents blob fetch (YouTube img server usually allows it, but just in case)
            window.open(currentImageUrl, '_blank');
        }
    });

    // Auto-focus input
    urlInput.focus();
});
