import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import GlobalStyles from './components/GlobalStyles.tsx';

// Tìm phần tử root trong file index.html
const rootElement = document.getElementById('root');

// Kiểm tra nếu rootElement tồn tại để tránh lỗi runtime
if (!rootElement) {
  throw new Error('Failed to find the root element. Check your index.html');
}

// Khởi tạo root với kiểu dữ liệu an toàn
createRoot(rootElement).render(
  <StrictMode>
    <GlobalStyles>
      <App />
    </GlobalStyles>
  </StrictMode>
);