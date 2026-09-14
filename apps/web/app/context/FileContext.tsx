"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "user" | "admin" | null;

export interface UserInfo {
  userName: string;
  clientName: string;
  workDone: string;
  amountReceived: string;
}

export interface RestaurantInfo {
  restaurantName: string;
  locationUrl: string;
  phoneNumber: string;
  logoFile: File | null;
  logoPreview: string | null;
  menuFiles: File[];
  menuPreviews: string[];
}

export interface CustomizationInfo {
  themeId: string;
  qrStyle: string;
}

const initialUserInfo: UserInfo = {
  userName: "",
  clientName: "",
  workDone: "",
  amountReceived: "",
};

const initialRestaurantInfo: RestaurantInfo = {
  restaurantName: "",
  locationUrl: "",
  phoneNumber: "",
  logoFile: null,
  logoPreview: null,
  menuFiles: [],
  menuPreviews: [],
};

const initialCustomization: CustomizationInfo = {
  themeId: "theme-1",
  qrStyle: "style-1",
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
  // Données Restaurant
  restaurantInfo: RestaurantInfo;
  setRestaurantInfo: (info: RestaurantInfo | ((prev: RestaurantInfo) => RestaurantInfo)) => void;
  setRestaurantLogo: (file: File | null) => void;
  addMenuFiles: (files: File[]) => void;
  removeMenuFile: (index: number) => void;
  // Personnalisation Thème & QR
  customization: CustomizationInfo;
  setThemeId: (themeId: string) => void;
  setQrStyle: (qrStyle: string) => void;
  resetAll: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [file, setFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(initialRestaurantInfo);
  const [customization, setCustomization] = useState<CustomizationInfo>(initialCustomization);

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

  const setRestaurantLogo = (logoFile: File | null) => {
    setRestaurantInfo((prev) => {
      if (prev.logoPreview) {
        URL.revokeObjectURL(prev.logoPreview);
      }
      return {
        ...prev,
        logoFile,
        logoPreview: logoFile ? URL.createObjectURL(logoFile) : null,
      };
    });
  };

  const addMenuFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setRestaurantInfo((prev) => ({
      ...prev,
      menuFiles: [...prev.menuFiles, ...newFiles],
      menuPreviews: [...prev.menuPreviews, ...newPreviews],
    }));
  };

  const removeMenuFile = (index: number) => {
    setRestaurantInfo((prev) => {
      const previewToRemove = prev.menuPreviews[index];
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove);
      }
      const updatedFiles = prev.menuFiles.filter((_, i) => i !== index);
      const updatedPreviews = prev.menuPreviews.filter((_, i) => i !== index);
      return {
        ...prev,
        menuFiles: updatedFiles,
        menuPreviews: updatedPreviews,
      };
    });
  };

  const setThemeId = (themeId: string) => {
    setCustomization((prev) => ({ ...prev, themeId }));
  };

  const setQrStyle = (qrStyle: string) => {
    setCustomization((prev) => ({ ...prev, qrStyle }));
  };

  const resetAll = () => {
    clearFile();
    resetUserInfo();
    setRestaurantInfo((prev) => {
      if (prev.logoPreview) URL.revokeObjectURL(prev.logoPreview);
      prev.menuPreviews.forEach((p) => URL.revokeObjectURL(p));
      return initialRestaurantInfo;
    });
    setCustomization(initialCustomization);
  };

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
        restaurantInfo,
        setRestaurantInfo,
        setRestaurantLogo,
        addMenuFiles,
        removeMenuFile,
        customization,
        setThemeId,
        setQrStyle,
        resetAll,
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
