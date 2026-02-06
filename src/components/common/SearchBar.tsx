import { Search, X, Filter } from "lucide-react-native";
import { View, TextInput, Pressable, StyleSheet, ViewStyle } from "react-native";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle | ViewStyle[];
  onFilterClick?: () => void;
}

const SearchBar = ({ placeholder = "Search...", value, onChange, style, onFilterClick }: SearchBarProps) => {
  const hasValue = value.trim().length > 0;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchSection}>
        <Search size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        {hasValue && (
          <Pressable
            onPress={() => onChange("")}
            style={styles.clearButton}
          >
            <X size={16} color="#64748b" />
          </Pressable>
        )}
      </View>

      {onFilterClick && (
        <Pressable
          onPress={onFilterClick}
          style={styles.filterButton}
        >
          <Filter size={18} color="#0f172a" />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 24,
    backgroundColor: '#ffffff', // card
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)', // border/60
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#0f172a', // foreground
  },
  clearButton: {
    marginLeft: 4,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  filterButton: {
    height: 42,
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default SearchBar;

