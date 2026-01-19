import { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onDataLoaded, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    setIsProcessing(true);
    setUploadStatus({ type: 'info', message: 'Processing file...' });

    try {
      // Import utilities dynamically
      const { validateFile } = await import('../utils/dataValidator');
      const { autoConvertToGeoJSON } = await import('../utils/dataConverters');

      // Validate file
      const fileValidation = validateFile(file);

      if (!fileValidation.valid) {
        throw new Error(fileValidation.errors.join('\n'));
      }

      if (fileValidation.warnings.length > 0) {
        console.warn('File validation warnings:', fileValidation.warnings);
      }

      // Read file content
      const content = await readFileContent(file);

      // Convert to GeoJSON
      const geojson = autoConvertToGeoJSON(content, file.name);

      // Validate GeoJSON
      const { validateGeoJSON, getValidationSummary } = await import('../utils/dataValidator');
      const validation = validateGeoJSON(geojson);

      if (!validation.valid) {
        throw new Error(`Invalid data:\n${validation.errors.slice(0, 5).join('\n')}`);
      }

      // Show success message with stats
      const summary = getValidationSummary(validation);
      setUploadStatus({
        type: 'success',
        message: `File loaded successfully!\n${summary}`
      });

      // Pass data to parent
      if (onDataLoaded) {
        onDataLoaded(geojson, {
          filename: file.name,
          validation,
          stats: validation.stats
        });
      }

      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({
        type: 'error',
        message: `Error: ${error.message}`
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const loadExampleFile = async (filename) => {
    setIsProcessing(true);
    setUploadStatus({ type: 'info', message: 'Loading example...' });

    try {
      const response = await fetch(`/examples/${filename}`);

      if (!response.ok) {
        throw new Error(`Failed to load example: ${response.statusText}`);
      }

      const content = await response.text();

      const { autoConvertToGeoJSON } = await import('../utils/dataConverters');
      const geojson = autoConvertToGeoJSON(content, filename);

      const { validateGeoJSON, getValidationSummary } = await import('../utils/dataValidator');
      const validation = validateGeoJSON(geojson);

      if (!validation.valid) {
        throw new Error(`Invalid example data:\n${validation.errors.slice(0, 5).join('\n')}`);
      }

      const summary = getValidationSummary(validation);
      setUploadStatus({
        type: 'success',
        message: `Example loaded!\n${summary}`
      });

      if (onDataLoaded) {
        onDataLoaded(geojson, {
          filename,
          validation,
          stats: validation.stats
        });
      }

    } catch (error) {
      console.error('Error loading example:', error);
      setUploadStatus({
        type: 'error',
        message: `Error loading example: ${error.message}`
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.geojson,.csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isProcessing ? (
          <div className="upload-processing">
            <div className="spinner"></div>
            <p>Processing file...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-primary-text">
              {isDragging ? 'Drop file here' : 'Drag & drop your data file'}
            </p>
            <p className="upload-secondary-text">or click to browse</p>
            <p className="upload-formats">
              Supported: CSV, JSON, GeoJSON
            </p>
          </>
        )}
      </div>

      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.type}`}>
          <pre>{uploadStatus.message}</pre>
        </div>
      )}

      <div className="example-files">
        <p className="example-label">Or try an example:</p>
        <div className="example-buttons">
          <button
            onClick={() => loadExampleFile('city_founding.csv')}
            disabled={isProcessing}
            className="example-button"
          >
            Cities (CSV)
          </button>
          <button
            onClick={() => loadExampleFile('explorer_routes.json')}
            disabled={isProcessing}
            className="example-button"
          >
            Routes (JSON)
          </button>
          <button
            onClick={() => loadExampleFile('world_events.geojson')}
            disabled={isProcessing}
            className="example-button"
          >
            Events (GeoJSON)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
