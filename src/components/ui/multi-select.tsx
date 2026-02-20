import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ChevronDown, X, Check } from 'lucide-react-native';
import { Button } from './button';

interface MultiSelectProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = "Select options",
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleOption = (option: string) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter((v) => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Pressable
                style={styles.trigger}
                onPress={() => setIsVisible(true)}
            >
                <View style={styles.selectedContent}>
                    {selectedValues.length === 0 ? (
                        <Text style={styles.placeholder}>{placeholder}</Text>
                    ) : (
                        <View style={styles.tagContainer}>
                            {selectedValues.map((val) => (
                                <View key={val} style={styles.tag}>
                                    <Text style={styles.tagText}>{val}</Text>
                                    <Pressable onPress={() => toggleOption(val)}>
                                        <X size={14} color="#64748b" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <ChevronDown size={20} color="#94a3b8" />
            </Pressable>

            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={false}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => setIsVisible(false)}
                        >
                            <Text style={styles.doneText}>Done</Text>
                        </Button>
                    </View>
                    <ScrollView style={styles.modalList}>
                        {options.map((option) => (
                            <Pressable
                                key={option}
                                style={[
                                    styles.optionItem,
                                    selectedValues.includes(option) && styles.optionItemSelected,
                                ]}
                                onPress={() => toggleOption(option)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedValues.includes(option) && styles.optionTextSelected,
                                ]}>
                                    {option}
                                </Text>
                                {selectedValues.includes(option) && (
                                    <Check size={20} color="#ec4899" />
                                )}
                            </Pressable>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    trigger: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        backgroundColor: '#f8fafc',
    },
    selectedContent: {
        flex: 1,
    },
    placeholder: {
        color: '#94a3b8',
        fontSize: 16,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 6,
    },
    tagText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: '#ffffff',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0f172a',
    },
    doneText: {
        color: '#ec4899',
        fontWeight: '700',
        fontSize: 18,
    },
    modalList: {
        flex: 1,
        padding: 12,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
    },
    optionItemSelected: {
        backgroundColor: '#fff1f2',
    },
    optionText: {
        fontSize: 17,
        color: '#475569',
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#be185d',
        fontWeight: '700',
    },
});
