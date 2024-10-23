// Importerer nødvendige moduler og komponenter
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Novel } from "./history";

// Hovedkomponent for gemte romaner
export default function SavedNovels() {
  const router = useRouter();
  const [savedNovels, setSavedNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effekt der kører ved komponentens montering
  useEffect(() => {
    fetchSavedNovels();
  }, []);

  // Funktion til at hente gemte romaner fra AsyncStorage
  const fetchSavedNovels = async () => {
    setIsLoading(true);
    try {
      const savedNovelsJson = await AsyncStorage.getItem("savedNovels");
      if (savedNovelsJson !== null) {
        const novels = JSON.parse(savedNovelsJson);
        setSavedNovels(novels);
      } else {
        setSavedNovels([]);
      }
    } catch (error) {
      console.error("Fejl ved hentning af gemte romaner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion til at rendere et enkelt roman-element
  const renderNovelItem = ({ item }: { item: Novel }) => (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/read-story/[uid]",
          params: { uid: item.id },
        });
      }}
      className="w-1/2 p-2"
    >
      <View className="w-full h-48 rounded-lg bg-gray-800 mb-2 justify-center items-center overflow-hidden">
        <Image
          source={{ uri: item.imageUrl || item.coverImageUrl }}
          className="w-full h-full"
          onLoadStart={() => <ActivityIndicator size="small" color="#9333ea" />}
        />
      </View>
      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        className="text-white text-sm"
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // Returnerer hovedkomponenten
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-5 pt-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Saved Novels</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Search color="white" size={24} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6B6B" />
        ) : savedNovels.length > 0 ? (
          <FlatList
            data={savedNovels}
            renderItem={renderNovelItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">No saved novels yet</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
