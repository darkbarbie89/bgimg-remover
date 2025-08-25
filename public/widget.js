(function() {
    // Create widget container
    const BGImgWidget = {
        init: function(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // Insert widget HTML
            container.innerHTML = `
                <div style="border: 2px dashed #ddd; border-radius: 10px; padding: 40px; text-align: center; cursor: pointer; background: #f9fafb;">
                    <input type="file" id="bgimg-file-input" accept="image/*" style="display: none;">
                    <div id="bgimg-upload-area">
                        <svg width="48" height="48" style="margin: 0 auto 20px; display: block; color: #667eea;">
                            <use href="#upload-icon"></use>
                        </svg>
                        <h3 style="margin: 0 0 10px; color: #333;">Remove Background</h3>
                        <p style="margin: 0; color: #666;">Click to upload or drag an image here</p>
                    </div>
                    <div id="bgimg-processing" style="display: none;">
                        <p>Processing... Please wait</p>
                    </div>
                    <div id="bgimg-result" style="display: none;">
                        <img id="bgimg-output" style="max-width: 100%;">
                        <button id="bgimg-download" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Download Result
                        </button>
                    </div>
                    <div style="margin-top: 20px; font-size: 12px;">
                        <a href="https://bgimg.com" target="_blank" style="color: #667eea; text-decoration: none;">
                            Powered by BGImg.com
                        </a>
                    </div>
                </div>
            `;
            
            // Add click handler
            const uploadArea = container.querySelector('#bgimg-upload-area');
            const fileInput = container.querySelector('#bgimg-file-input');
            
            uploadArea.onclick = () => fileInput.click();
            
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    // For demo - in reality, this would process the image
                    alert('In production, this would remove the background. Redirect to bgimg.com for full version.');
                    window.open('https://bgimg.com', '_blank');
                }
            };
        }
    };
    
    // Auto-initialize if container exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            BGImgWidget.init('bgimg-widget');
        });
    } else {
        BGImgWidget.init('bgimg-widget');
    }
    
    // Expose to global
    window.BGImgWidget = BGImgWidget;
})();