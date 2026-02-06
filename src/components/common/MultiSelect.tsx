import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import { Check, ChevronDown, X } from "lucide-react-native";
import { Button } from "../ui/button";

interface MultiSelectProps {
    label?: string;
    options: string[];
    selectedValues: string[];
    onSelectionChange: (values: string[]) => void;
    placeholder?: string;
}

const MultiSelect = ({
    label,
    options,
    selectedValues,
    onSelectionChange,
    placeholder = "Select options",
}: MultiSelectProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    const toggleSelection = (value: string) => {
        if (selectedValues.includes(value)) {
            onSelectionChange(selectedValues.filter((v) => v !== value));
        } else {
            onSelectionChange([...selectedValues, value]);
        }
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.triggerText, selectedValues.length === 0 && styles.placeholder]}>
                    {selectedValues.length > 0
                        ? `${selectedValues.length} selected`
                        : placeholder}
                </Text>
                <ChevronDown size={20} color="#64748b" />
            </Pressable>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {label || "Options"}</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <X size={24} color="#0f172a" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {options.map((option) => {
                                const isSelected = selectedValues.includes(option);
                                return (
                                    <Pressable
                                        key={option}
                                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                                        onPress={() => toggleSelection(option)}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {option}
                                        </Text>
                                        {isSelected && <Check size={20} color="#ec4899" />}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button onPress={() => setModalVisible(false)} style={styles.doneButton}>
                                Done
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {selectedValues.length > 0 && (
                <View style={styles.chipsContainer}>
                    {selectedValues.map((value) => (
                        <View key={value} style={styles.chip}>
                            <Text style={styles.chipText}>{value}</Text>
                            <Pressable onPress={() => toggleSelection(value)}>
                                <X size={14} color="#ec4899" />
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#0f172a",
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
    },
    triggerText: {
        fontSize: 14,
        color: "#0f172a",
    },
    placeholder: {
        color: "#94a3b8",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f172a",
    },
    optionsList: {
        marginBottom: 16,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    optionItemSelected: {
        backgroundColor: "#fce7f3", // primary/10
        paddingHorizontal: 8,
        borderRadius: 8,
        borderBottomWidth: 0,
        marginBottom: 4,
    },
    optionText: {
        fontSize: 16,
        color: "#0f172a",
    },
    optionTextSelected: {
        color: "#ec4899", // primary
        fontWeight: "500",
    },
    modalFooter: {
        paddingTop: 8,
    },
    doneButton: {
        width: "100%",
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#fce7f3",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#fbcfe8",
    },
    chipText: {
        fontSize: 12,
        color: "#be185d", // primary-dark
    },
});

export default MultiSelect;
