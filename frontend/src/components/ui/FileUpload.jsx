import React, { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import Button from './Button';
import Alert from './Alert';

/**
 * FileUpload Component
 * @param {object} props
 * @param {Function} props.onUpload - Callback when file is uploaded
 * @param {string} props.accept - Accepted file types
 * @param {number} props.maxSize - Max file size in MB
 * @param {boolean} props.multiple - Allow multiple files
 * @param {string} props.label - Upload button label
 * @param {string} props.description - Helper text
 */
const FileUpload = ({
    onUpload,
    accept = '*/*',
    maxSize = 10,
    multiple = false,
    label = 'Upload File',
    description = 'Click to upload or drag and drop',
    className = ''
}) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        const maxSizeBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `File size must be less than ${maxSize}MB`;
        }
        return null;
    };

    const handleFiles = (files) => {
        setError('');
        const fileArray = Array.from(files);

        // Validate files
        for (const file of fileArray) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        if (multiple) {
            setSelectedFiles(prev => [...prev, ...fileArray]);
        } else {
            setSelectedFiles(fileArray);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await onUpload(selectedFiles);
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="w-8 h-8 text-blue-500" />;
        } else if (file.type === 'application/pdf') {
            return <FileText className="w-8 h-8 text-red-500" />;
        }
        return <File className="w-8 h-8 text-gray-500" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className={`w-full ${className}`}>
            {error && (
                <Alert variant="error" className="mb-4">
                    {error}
                </Alert>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept={accept}
                    multiple={multiple}
                />

                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

                <p className="text-lg font-medium text-gray-900 mb-2">
                    {label}
                </p>

                <p className="text-sm text-gray-500 mb-4">
                    {description}
                </p>

                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    Select {multiple ? 'Files' : 'File'}
                </Button>

                <p className="text-xs text-gray-400 mt-4">
                    Max file size: {maxSize}MB
                </p>
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                        Selected Files ({selectedFiles.length})
                    </p>

                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {getFileIcon(file)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => removeFile(index)}
                                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                disabled={uploading}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    ))}

                    <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full mt-4"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
