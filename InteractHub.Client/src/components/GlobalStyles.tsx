import React from 'react';

interface GlobalStylesProps {
    children: React.ReactNode;
}

const GlobalStyles: React.FC<GlobalStylesProps> = ({ children }) => {
    // Thêm các class Tailwind toàn cục vào đây
    return (
        <div className="min-h-screen bg-background text-textcolor font-sans antialiased">
            {children}
        </div>
    );
};

export default GlobalStyles;