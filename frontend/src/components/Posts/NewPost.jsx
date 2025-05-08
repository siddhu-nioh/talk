// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './New.css';

// function New() {
//     const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//     const [description, setDescription] = useState('');
//     const [image, setImage] = useState(null);
//     const [video, setVideo] = useState(null);
//     const [preview, setPreview] = useState(null);
//     const [progress, setProgress] = useState(0);
//     const [isUploading, setIsUploading] = useState(false);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     // Handle Image Selection
//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         setImage(file);
//         if (file) {
//             setPreview(URL.createObjectURL(file));
//         }
//     };

//     // Handle Video Selection
//     const handleVideoChange = (e) => {
//         const file = e.target.files[0];
//         setVideo(file);
//         if (file) {
//             setPreview(URL.createObjectURL(file));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!image && !video) {
//             setError('Please provide either an image or a video.');
//             return;
//         }

//         setIsUploading(true);
//         setError('');
//         setProgress(0);

//         const formData = new FormData();
//         formData.append('description', description);
//         if (image) formData.append('image', image);
//         if (video) formData.append('video', video);

//         let progressInterval = setInterval(() => {
//             setProgress((prev) => (prev < 90 ? prev + 5 : prev));
//         }, 300);

//         try {
//             const response = await fetch(`${Backend_Url}/talk`, {
//                 method: 'POST',
//                 body: formData,
//                 credentials: 'include',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem("token")}`, 
//                 },
//             });

//             if (response.ok) {
//                 clearInterval(progressInterval);
//                 setProgress(100);
//                 setTimeout(() => {
//                     alert("Post created successfully!");
//                     navigate('/talk'); 
//                 }, 1000);
//             } else {
//                 clearInterval(progressInterval);
//                 setError('Failed to upload post. Please try again.');
//             }
//         } catch (error) {
//             clearInterval(progressInterval);
//             setError('An error occurred while uploading the post. Please try again.');
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     return (
//         <div className="modal" id="uploadModal">
//             <div className="modal-content">
//                 <button className="close" onClick={() => navigate('/talk')}>✖</button>
//                 <button className="btn-back" onClick={() => navigate('/talk')}>Back</button>
//                 <form onSubmit={handleSubmit}>
//                     <textarea
//                         name="description"
//                         placeholder="What's on your mind?"
//                         className="text-input"
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         required
//                     ></textarea>
//                     <label className="btn-action">
//                         📷 Add Image
//                         <input
//                             type="file"
//                             name="image"
//                             accept="image/*"
//                             style={{ display: 'none' }}
//                             onChange={handleImageChange}
//                         />
//                     </label>
//                     <label className="btn-action">
//                         🎥 Add Video
//                         <input
//                             type="file"
//                             name="video"
//                             accept="video/*"
//                             style={{ display: 'none' }}
//                             onChange={handleVideoChange}
//                         />
//                     </label>

//                     {/* Display preview of selected image or video */}
//                     {preview && (
//                         <div className="preview-container">
//                             {image ? (
//                                 <img src={preview} alt="Selected" className="preview-image" />
//                             ) : (
//                                 <video src={preview} controls className="preview-video"></video>
//                             )}
//                         </div>
//                     )}

//                     {error && <p className="error-message">{error}</p>}

//                     {/* Upload Button with Gradient Progress Animation */}
//                     <button 
//     type="submit" 
//     className="btn-action upload"
//     disabled={isUploading}
//     style={{ 
//         '--progress': `${progress}%`, // Dynamic progress effect,
//         color:'white'
//     }}
// >
//     {isUploading ? `${progress}%` : 'Upload Post'}
// </button>

//                 </form>
//             </div>
//         </div>
//     );
// }

// export default New;

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './New.css'; // We'll create this stylesheet after

function NewPostUpload() {
    // Core state management
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;
    const [activeTab, setActiveTab] = useState('media'); // 'media' or 'tweet'
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 280; // For tweet-style posts
    
    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);
    const navigate = useNavigate();
    
    // Handle description input
    const handleDescriptionChange = (e) => {
        const text = e.target.value;
        if (activeTab === 'tweet' && text.length > MAX_CHARS) return;
        setDescription(text);
        setCharCount(text.length);
    };

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            setImage(file);
            setVideo(null);
        } else if (file.type.startsWith('video/')) {
            setVideo(file);
            setImage(null);
        }
        
        setPreview(URL.createObjectURL(file));
    };
    
    // Handle drag and drop
    useEffect(() => {
        const dropArea = dropAreaRef.current;
        if (!dropArea) return;
        
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        
        const handleDragOver = (e) => {
            preventDefault(e);
            dropArea.classList.add('drag-over');
        };
        
        const handleDragLeave = (e) => {
            preventDefault(e);
            dropArea.classList.remove('drag-over');
        };
        
        const handleDrop = (e) => {
            preventDefault(e);
            dropArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    setImage(file);
                    setVideo(null);
                } else if (file.type.startsWith('video/')) {
                    setVideo(file);
                    setImage(null);
                }
                setPreview(URL.createObjectURL(file));
            }
        };
        
        dropArea.addEventListener('dragover', handleDragOver);
        dropArea.addEventListener('dragleave', handleDragLeave);
        dropArea.addEventListener('drop', handleDrop);
        
        return () => {
            dropArea.removeEventListener('dragover', handleDragOver);
            dropArea.removeEventListener('dragleave', handleDragLeave);
            dropArea.removeEventListener('drop', handleDrop);
        };
    }, []);
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form based on active tab
        if (activeTab === 'media' && !image && !video) {
          setError('Please provide either an image or a video for a media post.');
          return;
        }
        
        if (!description.trim()) {
          setError('Please enter some text for your post.');
          return;
        }
        
        setIsUploading(true);
        setError('');
        setProgress(0);
        
        const formData = new FormData();
        formData.append('description', description);
        formData.append('type', activeTab); // Send post type to backend
        
        // Only append files that are actually defined
        if (activeTab === 'media') {
          if (image) {
            console.log("Appending image to form:", image);
            formData.append('image', image);
          }
          if (video) {
            console.log("Appending video to form:", video);
            formData.append('video', video);
          }
        }
        
        // Log form data contents for debugging
        console.log("Form data entries:");
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(key, ":", value.name, "(size:", value.size, "bytes)");
          } else {
            console.log(key, ":", value);
          }
        }
        
        // Simulate realistic upload progress
        let progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 20) return prev + 2;
            if (prev < 50) return prev + 1;
            if (prev < 80) return prev + 0.5;
            if (prev < 90) return prev + 0.2;
            return prev;
          });
        }, 120);
        
        try {
          const response = await fetch(`${Backend_Url}/talk`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
              // IMPORTANT: Do NOT set Content-Type when sending FormData
              // The browser will set it automatically including the boundary parameter
            },
          });
          
          clearInterval(progressInterval);
          
          if (!response.ok) {
            // Try to get more detailed error info
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { message: `Server error: ${response.status} ${response.statusText}` };
            }
            
            setError(errorData.message || `Upload failed with status: ${response.status}`);
            console.error("Server responded with error:", errorData);
            return;
          }
          
          // Handle success
          const result = await response.json();
          console.log("Upload successful:", result);
          setProgress(100);
          setShowSuccessAnimation(true);
          
          setTimeout(() => {
            navigate('/talk');
          }, 1500);
          
        } catch (error) {
          clearInterval(progressInterval);
          console.error("Upload error:", error);
          setError('Network error. Please check your connection and try again.');
        } finally {
          setTimeout(() => {
            setIsUploading(false);
          }, 500);
        }
      };
    
    // Clear media when switching tabs
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setPreview(null);
        setImage(null);
        setVideo(null);
        setError('');
    };
    
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    
    const clearMedia = () => {
        setPreview(null);
        setImage(null);
        setVideo(null);
    };
    
    const getCharCountColor = () => {
        if (charCount > MAX_CHARS * 0.9) return 'var(--danger)';
        if (charCount > MAX_CHARS * 0.7) return 'var(--warning)';
        return 'var(--text-secondary)';
    };

    return (
        <div className="post-upload-container">
            <div className="post-upload-modal">
                <div className="modal-header">
                    <button className="btn-icon back-button" onClick={() => navigate('/talk')}>
                        <i className="icon-arrow-left"></i>
                    </button>
                    <h2>Create Post</h2>
                    <button className="btn-icon close-button" onClick={() => navigate('/talk')}>
                        <i className="icon-close"></i>
                    </button>
                </div>
                
                <div className="tabs-container">
                    <button 
                        className={`tab ${activeTab === 'media' ? 'active' : ''}`}
                        onClick={() => handleTabChange('media')}
                    >
                        <i className="icon-media"></i>
                        Media Post
                    </button>
                    <button 
                        className={`tab ${activeTab === 'tweet' ? 'active' : ''}`}
                        onClick={() => handleTabChange('tweet')}
                    >
                        <i className="icon-text-2"></i>
                        Text Post
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="post-content-area">
                        <textarea
                            name="description"
                            placeholder={activeTab === 'media' ? "What's on your mind?" : "What's happening?"}
                            value={description}
                            onChange={handleDescriptionChange}
                            className="post-text-input"
                            maxLength={activeTab === 'tweet' ? MAX_CHARS : undefined}
                            autoFocus
                            required
                        ></textarea>
                        
                        {activeTab === 'tweet' && (
                            <div className="char-counter" style={{ color: getCharCountColor() }}>
                                <span className="count-text">{charCount}</span>
                                <span className="divider">/</span>
                                <span className="max-text">{MAX_CHARS}</span>
                            </div>
                        )}
                    </div>
                    
                    {activeTab === 'media' && (
                        <div 
                            className={`media-drop-area ${preview ? 'has-preview' : ''}`}
                            ref={dropAreaRef}
                        >
                            {!preview ? (
                                <div className="upload-placeholder" onClick={triggerFileInput}>
                                    <div className="upload-icon">
                                        <i className="icon-upload-cloud"></i>
                                    </div>
                                    <p className="upload-text">Drag & drop or click to upload</p>
                                    <p className="upload-info">Supports JPG, PNG, GIF, MP4</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            ) : (
                                <div className="preview-container">
                                    {image ? (
                                        <img src={preview} alt="Preview" className="media-preview" />
                                    ) : (
                                        <video src={preview} controls className="media-preview"></video>
                                    )}
                                    <button 
                                        type="button" 
                                        className="remove-media-btn"
                                        onClick={clearMedia}
                                    >
                                        <i className="icon-trash"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {error && (
                        <div className="error-message">
                            <i className="icon-alert-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <div className="upload-controls">
                        {activeTab === 'media' && !preview && (
                            <div className="media-selector">
                                <button 
                                    type="button" 
                                    className="btn-media-select" 
                                    onClick={triggerFileInput}
                                >
                                    <i className="icon-image"></i>
                                    <span>Add Media</span>
                                </button>
                            </div>
                        )}
                        
                        <button 
                            type="submit" 
                            className={`btn-publish ${isUploading ? 'uploading' : ''}`}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <div className="upload-progress-container">
                                    <div 
                                        className="upload-progress-bar"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                    <span className="upload-progress-text">{Math.round(progress)}%</span>
                                </div>
                            ) : (
                                <>
                                    <span className="btn-text">Publish</span>
                                    <i className="icon-send"></i>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            {showSuccessAnimation && (
                <div className="success-overlay">
                    <div className="success-animation">
                        <i className="icon-check-circle"></i>
                        <p>Post published successfully!</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewPostUpload;