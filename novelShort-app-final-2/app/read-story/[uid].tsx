// Importerer nødvendige moduler og komponenter
import { baseURL } from "@/utils/generalUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ALargeSmall, Bookmark } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Novel } from "../history";

// Definerer mulige skriftstørrelser
const fontSizes = ["Small", "Medium", "Large"];

// Hovedkomponent for læsesiden
export default function ReadStory() {
  // Henter uid fra URL-parametre
  const { uid } = useLocalSearchParams();
  // Tilstandsvariabler for komponenten
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState("Large");
  const [isSaved, setIsSaved] = useState(false);

  // Effekt der kører ved komponentens montering
  useEffect(() => {
    fetchNovel();
    checkIfSaved();
  }, []);

  // Funktion til at hente romandata
  const fetchNovel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}api/get-novel/${uid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch novel");
      }
      const data = await response.json();
      setNovel(data.novel);
      addToReadNovels(data.novel);
    } catch (error) {
      console.error("Error fetching novel:", error);
      Alert.alert("Error", "Failed to fetch novel. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion til at tilføje en roman til læsehistorikken
  const addToReadNovels = async (novel: Novel) => {
    try {
      const readNovelsJson = await AsyncStorage.getItem("readNovels");
      let readNovels = readNovelsJson ? JSON.parse(readNovelsJson) : [];

      // Tjekker om romanen allerede er på listen
      const existingNovelIndex = readNovels.findIndex(
        (n: Novel) => n.id === novel.id
      );

      if (existingNovelIndex !== -1) {
        // Hvis romanen findes, fjernes den fra sin nuværende position
        readNovels.splice(existingNovelIndex, 1);
      }

      // Tilføjer romanen til begyndelsen af listen
      readNovels.unshift(novel);

      // Begrænser listen til et bestemt antal (f.eks. 20) for at forhindre den i at vokse for meget
      readNovels = readNovels.slice(0, 20);

      await AsyncStorage.setItem("readNovels", JSON.stringify(readNovels));
    } catch (error) {
      console.error("Error adding novel to read history:", error);
    }
  };

  // Funktion til at tjekke om romanen er gemt
  const checkIfSaved = async () => {
    try {
      const savedNovelsJson = await AsyncStorage.getItem("savedNovels");
      if (savedNovelsJson !== null) {
        const savedNovels = JSON.parse(savedNovelsJson);
        setIsSaved(savedNovels.some((novel: Novel) => novel.id === uid));
      }
    } catch (error) {
      console.error("Error checking if novel is saved:", error);
    }
  };

  // Funktion til at skifte mellem gemt og ikke-gemt tilstand
  const toggleSave = async () => {
    try {
      const savedNovelsJson = await AsyncStorage.getItem("savedNovels");
      let savedNovels = savedNovelsJson ? JSON.parse(savedNovelsJson) : [];

      if (isSaved) {
        savedNovels = savedNovels.filter((novel: Novel) => novel.id !== uid);
      } else {
        if (novel) {
          savedNovels.push(novel);
        }
      }

      await AsyncStorage.setItem("savedNovels", JSON.stringify(savedNovels));
      setIsSaved(!isSaved);
      Alert.alert(isSaved ? "Removed from saved" : "Added to saved");
    } catch (error) {
      console.error("Error toggling save:", error);
      Alert.alert(
        "Error",
        "Failed to save/unsave the novel. Please try again."
      );
    }
  };

  // Funktion til at få overskriftsteksten
  const getHeaderText = () => {
    if (!novel || !novel.title) {
      return "Novel";
    } else {
      return novel.title.length > 30
        ? novel.title.substring(0, 30) + "..."
        : novel.title;
    }
  };

  // Funktion til at få skriftstørrelsen
  const getFontSize = () => {
    switch (selectedFontSize) {
      case "Small":
        return 14;
      case "Large":
        return 18;
      default:
        return 16;
    }
  };

  // Funktion til at udtrække kapitler fra indholdet
  const extractChapters = (content: string) => {
    const chapterRegex = /^(Chapter\s+\d+:?\s*)/gim;
    const chapters = content.split(chapterRegex).filter(Boolean);
    const result = [];

    for (let i = 0; i < chapters.length; i += 2) {
      result.push({
        header: chapters[i].trim(),
        content: chapters[i + 1]?.trim() || "",
      });
    }

    return result;
  };

  // Viser en indlæsningsindikator, mens data hentes
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#9333ea" />
      </SafeAreaView>
    );
  }

  // Returnerer hovedkomponenten
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="pl-5 py-3 bg-gray-900 z-10 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-white">{getHeaderText()}</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={toggleSave} className="mr-4">
            <Bookmark color={isSaved ? "#9333ea" : "white"} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFontMenu(!showFontMenu)}
            className="pr-5"
          >
            <ALargeSmall size={24} color="#9333ea" />
          </TouchableOpacity>
        </View>
      </View>
      {showFontMenu && (
        <View className="absolute top-[110px] left-0 right-0 bg-gray-800 z-20 p-3 mx-5">
          <Text className="text-white text-center py-2 font-bold">
            Choose Font Size
          </Text>
          {fontSizes.map((size, index) => (
            <TouchableOpacity
              key={size}
              onPress={() => {
                setSelectedFontSize(size);
                setShowFontMenu(false);
              }}
              className={`p-4 ${
                index !== fontSizes.length - 1 && "border-b border-gray-700"
              }`}
            >
              <Text className="text-white">
                {size} (
                {size === "Small" ? "14" : size === "Medium" ? "16" : "18"})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <ScrollView className="flex-1 px-5">
        {novel && novel.chapters && novel.chapters.length > 0 && (
          <View className="mb-5">
            {extractChapters(novel.chapters[0].content).map(
              (chapter, index) => (
                <View key={index} className="mb-6">
                  <Text
                    className="text-white font-bold mb-2"
                    style={{
                      fontSize: getFontSize() + 2,
                    }}
                  >
                    {chapter.header}
                  </Text>
                  <Text
                    className="text-white mb-4"
                    style={{
                      fontSize: getFontSize(),
                    }}
                  >
                    {chapter.content}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
