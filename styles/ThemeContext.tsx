import React, { createContext, ReactNode, useState } from 'react';

const lightTheme = {background: '#f5f5f5', text: '#111'};
const darkTheme = { background: '#0b0d17', text: '#fff'};

const ThemeContext = createContext({theme: darkTheme, toggle: () => {} });

export function ThemeProvider({children}: {children: ReactNode}){
    const [isDark, setIsDark] = useState(true);
    const theme = isDark ? darkTheme : lightTheme;

    function toggle(){
        setIsDark(prev => !prev);
    }

    return (
        <ThemeContext.Provider value={{theme, toggle}} >
            {children} 
        </ThemeContext.Provider>
    );
}