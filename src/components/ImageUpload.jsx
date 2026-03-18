/**
 * ImageUpload.jsx
 * Reusable drag-and-drop image picker.
 * Props:
 *   value       — current preview URL (string|null)
 *   onChange    — callback(file: File)
 *   label       — helper text
 *   aspect      — 'square' | 'banner'  (controls preview shape)
 *   maxMB       — max file size in MB (default 5)
 */
import React, { useRef, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';

export default function ImageUpload({ value, onChange, label = 'Click or drag to upload', aspect = 'square', maxMB = 5 }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`Image must be under ${maxMB} MB`);
      return;
    }
    onChange(file);
  };

  const onInput = (e) => handleFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value;

  const isBanner = aspect === 'banner';

  return (
    <Box
      className="upload-zone"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      sx={{
        position: 'relative',
        width: '100%',
        height: isBanner ? { xs: 120, sm: 160 } : 110,
        borderRadius: isBanner ? 3 : '50%',
        width: isBanner ? '100%' : 110,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: dragging ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.025)',
        transition: 'all 0.2s ease',
        mx: isBanner ? 0 : 'auto',
        cursor: 'pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onInput}
      />

      {previewUrl ? (
        <>
          <Box
            component="img"
            src={previewUrl}
            alt="preview"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Remove button */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            sx={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              width: 26, height: 26,
              '&:hover': { background: 'rgba(248,113,113,0.8)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', px: 1, pointerEvents: 'none' }}>
          <UploadIcon sx={{ fontSize: isBanner ? 30 : 26, color: 'rgba(129,140,248,0.6)', mb: 0.5 }} />
          {isBanner && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
              {label}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
