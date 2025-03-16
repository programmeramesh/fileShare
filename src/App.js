import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import './App.css';
import { uploadFile } from './service/api';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: 
    linear-gradient(120deg, 
      rgba(66, 66, 255, 0.5), 
      rgba(128, 78, 255, 0.5), 
      rgba(255, 85, 220, 0.5)
    ),
    radial-gradient(
      circle at top left,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  background-size: 300% 300%, 100% 100%, 100% 100%;
  animation: gradientShift 15s ease infinite;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.03)' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.5;
    animation: patternMove 60s linear infinite;
  }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 1px 8px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  max-width: 600px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const UploadButton = styled(motion.button)`
  background: linear-gradient(45deg, #4568dc, #b06ab3, #4568dc);
  background-size: 200% 200%;
  color: white;
  border: none;
  padding: 10px 3px;
  border-radius: 99px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(69, 104, 220, 0.2);
  animation: gradientShift 5s infinite linear;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(69, 104, 220, 0.3);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 15px rgba(69, 104, 220, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &::before {
      display: none;
    }
  }

  /* Add icon and loading animation */
  svg {
    margin-right: 8px;
    vertical-align: middle;
    transition: transform 0.3s ease;
  }

  // &:hover svg {
  //   transform: rotate(15deg);
  // }
`;

const DownloadLink = styled(motion.a)`
  display: inline-block;
  color: #4568dc;
  text-decoration: none;
  margin-top: 20px;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 15px;
  background: rgba(69, 104, 220, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(69, 104, 220, 0.15);
    transform: translateY(-2px);
  }
`;

const ProgressBar = styled(motion.div)`
  width: 100%;
  height: 6px;
  background: rgba(69, 104, 220, 0.1);
  border-radius: 3px;
  margin: 20px 0;
  overflow: hidden;
`;

const Progress = styled(motion.div)`
  height: 100%;
  background: linear-gradient(45deg, #4568dc, #b06ab3);
`;

function App() {
  const [file, setFile] = useState('');
  const [result, setResult] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef();

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        setUploading(true);
        setUploadProgress(0);
        
        const data = new FormData();
        data.append("name", file.name);
        data.append("file", file);

        try {
          const response = await uploadFile(data);
          setResult(response.path);
          setUploadProgress(100);
        } catch (error) {
          console.error('Upload failed:', error);
        } finally {
          setUploading(false);
        }
      }
    }
    getImage();
  }, [file]);

  const onUploadClick = () => {
    fileInputRef.current.click();
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <Container>
      <Card
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Simple File Sharing
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Upload and share files instantly
        </motion.p>

        <UploadButton
          onClick={onUploadClick}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          disabled={uploading}
        >
          <motion.span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '8px' }}
            >
              <motion.path
                d="M12 16V4M7 9L12 4L17 9M20 20H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
            {uploading ? 'Uploading...' : 'Choose File'}
          </motion.span>
        </UploadButton>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <AnimatePresence>
          {uploading && (
            <ProgressBar>
              <Progress
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </ProgressBar>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <DownloadLink
              href={result}
              target='_blank'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Download Link: {result}
            </DownloadLink>
          )}
        </AnimatePresence>
      </Card>
    </Container>
  );
}

export default App;
