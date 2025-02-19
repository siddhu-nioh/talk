import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './New.css';
import axios from 'axios'; // Use axios for progress tracking

function New() {
    const Backend_Url = import.meta.env.VITE_BACKEND_URL;
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [video, setVideo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that either an image or a video is provided
        if (!image && !video) {
            setError('Please provide either an image or a video.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('description', description);
        if (image) formData.append('image', image);
        if (video) formData.append('video', video);

        try {
            // const response = await axios.post(`${Backend_Url}/talk`, formData, {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem("token")}`,
            //         'Content-Type': 'multipart/form-data',
            //     },
            //     onUploadProgress: (progressEvent) => {
            //         const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            //         setUploadProgress(percentCompleted); // Update progress
            //     },
            //     withCredentials: true,
            // });
               const response = await fetch(`${Backend_Url}/talk`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                         headers: {
                              'Authorization': `Bearer ${localStorage.getItem("token")}`, 
                          },
                      onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted); // Update progress
                },
                  });

            if (response.status === 200 || response.status === 201) {
                setUploadProgress(100); // Ensure progress bar shows 100% on success
                setTimeout(() => {
                    alert("Post created successfully!");
                    navigate('/talk');
                }, 1000); // Wait for the animation to complete
            } else {
                throw new Error('Failed to upload post.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while uploading the post. Please try again.');
            console.error('Upload Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal" id="uploadModal">
            <div className="modal-content">
                <button
                    className="close"
                    onClick={() => navigate('/talk')}
                >
                    ✖
                </button>
                <button
                    className="btn-back"
                    onClick={() => navigate('/talk')}
                >
                    Back
                </button>
                <form onSubmit={handleSubmit}>
                    <textarea
                        name="description"
                        placeholder="What's on your mind?"
                        className="text-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                    <label className="btn-action">
                        📷 Add Image
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>
                    <label className="btn-action">
                        🎥 Add Video
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            style={{ display: 'none' }}
                            onChange={(e) => setVideo(e.target.files[0])}
                        />
                    </label>
                    {error && <p className="error-message">{error}</p>}
                    <input
                        type="submit"
                        className="btn-action upload"
                        value={isSubmitting ? 'Uploading...' : 'Upload Post'}
                        disabled={isSubmitting}
                    />
                    {/* Progress Bar */}
                    {isSubmitting && (
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                            <span className="progress-text">
                                {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload Done!'}
                            </span>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default New;
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './New.css';

// function New() {
//       const Backend_Url = import.meta.env.VITE_BACKEND_URL;
//       const [description, setDescription] = useState('');
//       const [image, setImage] = useState(null);
//       const [video, setVideo] = useState(null);
//       const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state
//       const [error, setError] = useState(''); // Track errors
//       const navigate = useNavigate();

//       const handleSubmit = async (e) => {
//             e.preventDefault();

//             // Validate that either an image or a video is provided
//             if (!image && !video) {
//                   setError('Please provide either an image or a video.');
//                   return;
//             }

//             setIsSubmitting(true);
//             setError(''); 

//             const formData = new FormData();
//             formData.append('description', description);
//             if (image) formData.append('image', image);
//             if (video) formData.append('video', video);

//             try {
                  // const response = await fetch(`${Backend_Url}/talk`, {
                  //       method: 'POST',
                  //       body: formData,
                  //       credentials: 'include',
                  //        headers: {
                  //             'Authorization': `Bearer ${localStorage.getItem("token")}`, 
                  //         },
                  // });
//                   if (response.ok) {
//                         alert("post created succesfully");
//                         navigate('/talk'); 
//                   } else {
//                         const errorData = await response.json();
//                         setError(errorData.message || 'Failed to upload post. Please try again.');
//                         console.error('Backend Error:', errorData);
//                   }
//             } catch (error) {
//                   setError('An error occurred while uploading the post. Please try again.');
//                   console.error('Network Error:', error);
//             } finally {
//                   setIsSubmitting(false); // Re-enable the submit button
//             }
//       };

//       return (
//             <div className="modal" id="uploadModal">
//                   <div className="modal-content">
//                         <button
//                               className="close"
//                               onClick={() => navigate('/talk')} // Programmatically navigate back
//                         >
//                               ✖
//                         </button>
//                         <button
//                               className="btn-back"
//                               onClick={() => navigate('/talk')} // Programmatically navigate back
//                         >
//                               Back
//                         </button>
//                         <form onSubmit={handleSubmit}>
//                               <textarea
//                                     name="description"
//                                     placeholder="What's on your mind?"
//                                     className="text-input"
//                                     value={description}
//                                     onChange={(e) => setDescription(e.target.value)}
//                                     required
//                               ></textarea>
//                               <label className="btn-action">
//                                     📷 Add Image
//                                     <input
//                                           type="file"
//                                           name="image"
//                                           accept="image/*"
//                                           style={{ display: 'none' }}
//                                           onChange={(e) => setImage(e.target.files[0])}
//                                     />
//                               </label>
//                               <label className="btn-action">
//                                     🎥 Add Video
//                                     <input
//                                           type="file"
//                                           name="video"
//                                           accept="video/*"
//                                           style={{ display: 'none' }}
//                                           onChange={(e) => setVideo(e.target.files[0])}
//                                     />
//                               </label>
//                               {error && <p className="error-message">{error}</p>} {/* Display error messages */}
//                               <input
//                                     type="submit"
//                                     className="btn-action upload"
//                                     value={isSubmitting ? 'Uploading...' : 'Upload Post'} // Update button text
//                                     disabled={isSubmitting} // Disable button while submitting
//                               />
//                         </form>
//                   </div>
//             </div>
//       );
// }

// export default New;
