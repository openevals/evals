'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface StateContextType {
  settingsVisible: boolean;
  setSettingsVisible: (value: boolean) => void;
  openAIKey: string;
  setOpenAIKey: (value: string) => void;
  geminiKey: string;
  setGeminiKey: (value: string) => void;
  anthropicKey: string;
  setAnthropicKey: (value: string) => void;
  clearData: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ModelStorageProvider = ({ children }: { children: ReactNode }) => {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [openAIKey, saveOpenAIKey] = useState("");
  const [geminiKey, saveGeminiKey] = useState("");
  const [anthropicKey, saveAnthropicKey] = useState("");

  useEffect(() => {
    setOpenAIKey(localStorage.getItem('openai-key') ?? '');
    setGeminiKey(localStorage.getItem('gemini-key') ?? '');
    setAnthropicKey(localStorage.getItem('anthropic-key') ?? '');
  }, []);

  /**
   * Set and save the OpenAI key
   * @param key 
   */
  const setOpenAIKey = (key: string) => {
    saveOpenAIKey(key);
    localStorage.setItem('openai-key', key);
  };

  /**
   * Set and save the Gemini key
   * @param key 
   */
  const setGeminiKey = (key: string) => {
    saveGeminiKey(key);
    localStorage.setItem('gemini-key', key);
  };

  /**
   * Set and save the Anthropic key
   * @param key 
   */
  const setAnthropicKey = (key: string) => {
    saveAnthropicKey(key);
    localStorage.setItem('anthropic-key', key);
  };

  /**
   * Clear the OpenAI key and models
   */
  const clearData = () => {
    setOpenAIKey('');
    setGeminiKey('');
    setAnthropicKey('');
  };

  return (
    <StateContext.Provider value={{ openAIKey, setOpenAIKey, geminiKey, setGeminiKey, anthropicKey, setAnthropicKey, clearData, settingsVisible, setSettingsVisible }}>
      {children}
    </StateContext.Provider>
  );
};

export const useModelStorageContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('Context not ready');
  }
  return context;
};
