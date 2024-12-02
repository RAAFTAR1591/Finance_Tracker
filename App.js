import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SMS from "expo-sms";

export default function App() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Function to parse transaction messages
  const parseTransactionMessage = (message) => {
    if (message.toLowerCase().includes("credited")) {
      const amount = parseFloat(message.match(/[\d,]+(\.\d+)?/)[0].replace(/,/g, ""));
      return { type: "credit", amount };
    }
    if (message.toLowerCase().includes("debited")) {
      const amount = parseFloat(message.match(/[\d,]+(\.\d+)?/)[0].replace(/,/g, ""));
      return { type: "debit", amount };
    }
    return null;
  };

  const fetchMessages = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      console.warn("SMS is not available on this device.");
      return;
    }

    // Fetch SMS messages (this is platform-dependent and works on Android only)
    const result = await SMS.getMessagesAsync({ maxResults: 10 });
    if (result.messages) {
      result.messages.forEach((msg) => {
        const transaction = parseTransactionMessage(msg.body);
        if (transaction) {
          setTransactions((prev) => [...prev, transaction]);
          setBalance((prev) =>
            transaction.type === "credit" ? prev + transaction.amount : prev - transaction.amount
          );
        }
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💳 Money Tracker</Text>
      <Text style={styles.balance}>Balance: ₹{balance.toFixed(2)}</Text>
      <Text style={styles.subHeader}>Transactions:</Text>
      <ScrollView style={styles.scrollView}>
        {transactions.map((txn, index) => (
          <View key={index} style={styles.transaction}>
            <Text style={styles.transactionText}>
              {txn.type === "credit" ? "Credited" : "Debited"} ₹{txn.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

// Dark theme styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffcc00",
    marginBottom: 20,
  },
  balance: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00ff00",
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  scrollView: {
    width: "100%",
  },
  transaction: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#2b2b2b",
    borderRadius: 8,
  },
  transactionText: {
    fontSize: 16,
    color: "#ffffff",
  },
});
