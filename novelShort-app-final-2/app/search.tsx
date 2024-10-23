// Importerer nødvendige moduler og komponenter
import { baseURL } from "@/utils/generalUtils";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Novel } from "./history";

// Hovedkomponent for søgeskærmen
export default function SearchScreen() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  // Effekt der fokuserer på søgefeltet ved komponentens montering
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Funktion til at søge efter romaner
  const searchNovels = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}api/search-novel?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search novels");
      }
      const data = await response.json();
      setNovels(data);
    } catch (error) {
      console.error("Error searching novels:", error);
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
          <View className="flex-1 flex-row items-center bg-gray-800 rounded-lg px-4 py-4">
            <Search color="white" size={16} />
            <TextInput
              ref={searchInputRef}
              className="flex-1 text-white ml-2"
              placeholder="Search novels"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length > 2) {
                  searchNovels(text);
                } else if (text.length === 0) {
                  setNovels([]);
                }
              }}
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FF6B6B" />
        ) : (
          <FlatList
            data={novels}
            renderItem={renderNovelItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-white text-center mt-4">
                {searchQuery.length > 0
                  ? "No results found"
                  : "Start typing to search for novels"}
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
