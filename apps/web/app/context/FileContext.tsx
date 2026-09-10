"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "user" | "admin" | null;

export interface UserInfo {
  userName: string;
  clientName: string;
  workDone: string;
  amountReceived: string;
}

const initialUserInfo: UserInfo = {
  userName: "",
  clientName: "",
  workDone: "",
  amountReceived: "",
};

interface FileContextType {
  file: File | null;
  previewUrl: string | null;
  setFile: (file: File | null) => void;
  clearFile: () => void;
  hasSeenIntro: boolean;
  setHasSeenIntro: (seen: boolean) => void;
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo | ((prev: UserInfo) => UserInfo)) => void;
  resetUserInfo: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);

  const setFile = (newFile: File | null) => {
    setFileState(newFile);
    setPreviewUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return newFile ? URL.createObjectURL(newFile) : null;
    });
  };

  const clearFile = () => setFile(null);
  const resetUserInfo = () => setUserInfo(initialUserInfo);

  return (
    <FileContext.Provider
      value={{
        file,
        previewUrl,
        setFile,
        clearFile,
        hasSeenIntro,
        setHasSeenIntro,
        selectedRole,
        setSelectedRole,
        userInfo,
        setUserInfo,
        resetUserInfo,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
}
