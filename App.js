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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatWhatsApp</Text>
        <Text style={styles.headerSubtitle}>Online</Text>
      </View>

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
          <Text style={styles.sendButtonText}>{loading ? "..." : "📤"}</Text>
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
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#25d366",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#e0e0e0",
    marginTop: 5,
  },
  messagesList: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
    marginRight: 10,
  },
  friendBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    marginLeft: 10,
  },
  messageText: {
    fontSize: 14,
    color: "#000",
  },
  userText: {
    color: "#000",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  statusText: {
    fontSize: 10,
    color: "#666",
    marginRight: 4,
  },
  userStatusText: {
    color: "#25d366",
  },
  timeText: {
    fontSize: 10,
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#25d366",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    fontSize: 18,
  },
});
