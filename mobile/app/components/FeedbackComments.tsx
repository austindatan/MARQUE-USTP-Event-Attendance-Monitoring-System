// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackComment {
    _id: string;
    user_id: {
        firstname: string;
        lastname: string;
        profile_image?: string;
    };
    comment: string;
    ratings: {
        overall_experience: number;
        venue_facilities: number;
        speakers_program: number;
        event_organization: number;
    };
    is_anonymous: boolean;
    createdAt: string;
}

interface FeedbackCommentsProps {
    comments: FeedbackComment[];
}

const FeedbackComments: React.FC<FeedbackCommentsProps> = ({ comments }) => {
    if (!comments || comments.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No feedback comments yet</Text>
            </View>
        );
    }

    const calculateAverageRating = (ratings) => {
        const sum = ratings.overall_experience + ratings.venue_facilities +
            ratings.speakers_program + ratings.event_organization;
        return (sum / 4).toFixed(1);
    };

    const renderStars = (rating) => {
        const stars = [];
        const avgRating = parseFloat(rating);

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= avgRating ? "star" : "star-outline"}
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    const renderAvatar = (user, isAnonymous) => {
        if (isAnonymous) {
            // Show anonymous icon
            return (
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color="#fff" />
                </View>
            );
        }

        if (user?.profile_image) {
            return (
                <Image
                    source={{ uri: user.profile_image }}
                    style={styles.avatarImage}
                />
            );
        }

        // Fallback to initials if no profile image
        return (
            <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                    {user?.firstname?.charAt(0) || '?'}
                    {user?.lastname?.charAt(0) || ''}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Ionicons name="chatbubbles" size={20} color="#0A0F51" />
                <Text style={styles.sectionTitle}>Feedback Comments ({comments.length})</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {comments.map((feedback) => (
                    <View key={feedback._id} style={styles.commentCard}>
                        <View style={styles.userHeader}>
                            {renderAvatar(feedback.user_id, feedback.is_anonymous)}
                            <View style={styles.userInfo}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.userName}>
                                        {feedback.is_anonymous
                                            ? 'Anonymous'
                                            : `${feedback.user_id?.firstname || 'Anonymous'} ${feedback.user_id?.lastname || ''}`
                                        }
                                    </Text>
                                    <Text style={styles.dateText}>
                                        {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <View style={styles.ratingContainer}>
                                    {renderStars(calculateAverageRating(feedback.ratings))}
                                    <Text style={styles.ratingText}>
                                        {calculateAverageRating(feedback.ratings)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {feedback.comment && (
                            <Text style={styles.commentText} numberOfLines={6}>
                                "{feedback.comment}"
                            </Text>
                        )}


                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#0A0F51',
        marginLeft: 8,
        fontFamily: 'DMSans-Bold',
    },
    scrollView: {
        maxHeight: 400,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    commentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0A0F51',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'DMSans-Bold',
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: '#E8E8E8',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0A0F51',
        marginBottom: 4,
        fontFamily: 'DMSans-Medium',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
        fontFamily: 'DMSans-Regular',
    },
    commentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 10,
        fontStyle: 'italic',
        fontFamily: 'DMSans-Regular',
    },
    dateText: {
        fontSize: 11,
        color: '#999',
        fontFamily: 'DMSans-Regular',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
        fontFamily: 'DMSans-Regular',
    },
});

export default FeedbackComments;
