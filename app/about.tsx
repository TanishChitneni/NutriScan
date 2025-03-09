import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  TextInputProps,
} from "react-native";
import * as Speech from "expo-speech";
import { Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";

export default function App() {
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const API_KEY = "AIzaSyAEYOaooAogir9uyO_Hx4lDJkt_k4vkcPk"; // Ensure this is valid

  useEffect(() => {
    const startChat = async () => {
      try {
        setLoading(true);
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Hello! How can I assist you today?";
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("Initial response:", text);

        showMessage({
          message: "Welcome to Gemini Chat 🤖",
          description: text,
          type: "info",
          icon: "info",
          duration: 2000,
        });

        setMessages([{ text, user: false }]);
      } catch (error) {
        console.error("Start chat error:", error);
        showMessage({
          message: "Error",
          description: "Failed to start chat. Check API key or network.",
          type: "danger",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    startChat();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    // Cleanup listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    const userMessage = { text: userInput, user: true };
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return newMessages;
    });

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userInput);
      const text = result.response.text();

      setMessages((prev) => {
        const newMessages = [...prev, { text, user: false }];
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return newMessages;
      });
      setUserInput("");

      if (!isSpeaking) {
        Speech.speak(text, {
          onDone: () => {
            setIsSpeaking(false);
            setShowStopIcon(false);
          },
          onError: () => {
            setIsSpeaking(false);
            setShowStopIcon(false);
          },
        });
        setIsSpeaking(true);
        setShowStopIcon(true);
      }
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error: Could not generate response.", user: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setShowStopIcon(false);
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1].text;
      Speech.speak(lastMessage, {
        onDone: () => {
          setIsSpeaking(false);
          setShowStopIcon(false);
        },
        onError: () => {
          setIsSpeaking(false);
          setShowStopIcon(false);
        },
      });
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    Speech.stop();
    setIsSpeaking(false);
    setShowStopIcon(false);
  };

  const renderMessage = ({ item }: { item: { text: string; user: boolean } }) => (
    <View
      style={[
        styles.messageContainer,
        item.user ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.user ? styles.userMessageText : styles.botMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.appContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.flatListContent}
          />
          {loading && (
            <ActivityIndicator size="large" color="#fff" style={styles.loading} />
          )}
          <View
            style={[
              styles.inputContainer,
              keyboardVisible && { marginBottom: 100 },  // Adjust the margin here to move input up
            ]}
          >
            <TextInput
              placeholder="Type a message"
              onChangeText={setUserInput}
              value={userInput}
              onSubmitEditing={sendMessage}
              style={styles.input}
              placeholderTextColor="#fff"
            />
            {showStopIcon && (
              <TouchableOpacity style={styles.stopIcon} onPress={clearMessages}>
                <Entypo name="controller-stop" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
      <FlashMessage position={"top"} />
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#000",
    marginTop: 50,
  },
  flatListContent: {
    flexGrow: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#005BBB",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C7C7CC",
  },
  messageText: {
    fontSize: 16,
    padding: 8,
  },
  userMessageText: {
    color: "#fff",
  },
  botMessageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "black",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 10,
    height: 50,
    color: "white",
    marginHorizontal: 10,
  },
  micIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  stopIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },
});
