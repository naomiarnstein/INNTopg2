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

// Definerer interface for Novel-objektet
export interface Novel {
  id: string;
  title: string;
  category: string;
  coverImageUrl: string;
  imageUrl: string | null;
  chapters: Chapter[];
}

// Definerer interface for Chapter-objektet
export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
}

// Hovedkomponent for læsehistorik
export default function ReadHistory() {
  const router = useRouter();
  const [readNovels, setReadNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effekt der kører ved komponentens montering
  useEffect(() => {
    fetchReadNovels();
  }, []);

  // Funktion til at hente læste romaner fra AsyncStorage
  const fetchReadNovels = async () => {
    setIsLoading(true);
    try {
      const readNovelsJson = await AsyncStorage.getItem("readNovels");
      if (readNovelsJson !== null) {
        const novels = JSON.parse(readNovelsJson);
        setReadNovels(novels);
      } else {
        setReadNovels([]);
      }
    } catch (error) {
      console.error("Fejl ved hentning af læste romaner:", error);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-5 pt-2">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Læsehistorik</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Search color="white" size={24} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6B6B" />
        ) : readNovels.length > 0 ? (
          <FlatList
            data={readNovels}
            renderItem={renderNovelItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-lg">
              Ingen læste romaner endnu
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
