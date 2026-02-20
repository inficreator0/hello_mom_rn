import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CycleDayLogForm } from '../components/cycle/CycleDayLogForm';
import { PageContainer } from '../components/common/PageContainer';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { formatLocalDate } from '../lib/utils/dateUtils';

export const DailyLog: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { date, initialLog } = route.params;

    const formattedDate = formatLocalDate(date, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    return (
        <PageContainer style={styles.container}>
            <ScreenHeader
                title={`Log: ${formattedDate}`}
                onBack={() => navigation.goBack()}
            />
            <View style={styles.content}>
                <CycleDayLogForm
                    date={date}
                    initialLog={initialLog}
                    onSave={() => navigation.goBack()}
                    onClose={() => navigation.goBack()}
                />
            </View>
        </PageContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 0, // CycleDayLogForm has its own padding/scroll
    },
});
