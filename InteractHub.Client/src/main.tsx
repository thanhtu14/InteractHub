import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import GlobalStyles from './components/GlobalStyles.tsx';
import { AuthProvider } from "./context/AuthProvider";
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element. Check your index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    {/* AuthProvider phải bọc ngoài cùng để cung cấp dữ liệu cho App */}
    <AuthProvider>
      <GlobalStyles>
        <App />
      </GlobalStyles>
    </AuthProvider>
  </StrictMode>
);