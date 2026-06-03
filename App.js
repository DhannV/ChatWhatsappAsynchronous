import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

// Simulasi async API call untuk mengirim pesan
const sendMessageToServer = async (message) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, timestamp: new Date().getTime() });
    }, 2000); // Delay 2 detik simulasi
  });
};

// Simulasi async API call untuk receive pesan
const receiveMessageFromServer = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const messages = [
        "Halo! Apa kabar?",
        "Sudah lihat pesan ku?",
        "Oke siap!",
        "Mantap deh!",
        "Terima kasih banyak",
      ];
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      resolve({ text: randomMessage, timestamp: new Date().getTime() });
    }, 3000); // Delay 3 detik simulasi
  });
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Halo! Selamat datang",
      sender: "friend",
      status: "delivered",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  // Scroll ke pesan terbaru
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mengirim pesan dengan async
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const tempId = Math.random().toString();

    // Tambah pesan ke state dengan status "sending"
    const newMessage = {
      id: tempId,
      text: inputText,
      sender: "user",
      status: "sending",
      timestamp: new Date().getTime(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Tunggu response dari server (async)
      const response = await sendMessageToServer(inputText);

      // Update status pesan menjadi "sent"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "sent" } : msg,
        ),
      );

      // Simulasi delay untuk "delivered"
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update status menjadi "delivered"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "delivered" } : msg,
        ),
      );

      // Simulasi menerima balasan dari friend (async)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const receivedMessage = await receiveMessageFromServer();

      const friendMessage = {
        id: Math.random().toString(),
        text: receivedMessage.text,
        sender: "friend",
        status: "delivered",
        timestamp: receivedMessage.timestamp,
      };

      setMessages((prev) => [...prev, friendMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Update status menjadi "failed"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "failed" } : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Render pesan bubble
  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.friendBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>
          {item.text}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, isUser && styles.userStatusText]}>
            {getStatusIcon(item.status)}
          </Text>
          <Text style={[styles.timeText, isUser && styles.userStatusText]}>
            {getTimeString(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#0d47a1", "#1565c0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ChatWhatsApp</Text>
          <Text style={styles.headerSubtitle}>● Online</Text>
        </View>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollToBottom()}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>{loading ? "..." : "→"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Helper functions
const getStatusIcon = (status) => {
  switch (status) {
    case "sending":
      return "⏱";
    case "sent":
      return "✓";
    case "delivered":
      return "✓✓";
    case "failed":
      return "✗";
    default:
      return "";
  }
};

const getTimeString = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#e3f2fd",
    marginTop: 6,
    fontWeight: "500",
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
  },
  messageBubble: {
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0d47a1",
    marginRight: 12,
    shadowColor: "#0d47a1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  friendBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#1565c0",
  },
  messageText: {
    fontSize: 15,
    color: "#1a1a1a",
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    justifyContent: "flex-end",
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginRight: 5,
    fontWeight: "600",
  },
  userStatusText: {
    color: "#81d4fa",
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#e8ecf1",
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: "#f0f3f7",
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
    color: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0d47a1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0d47a1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: "#bdbdbd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  sendButtonText: {
    fontSize: 20,
    color: "#fff",
  },
});
