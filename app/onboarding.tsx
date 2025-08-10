import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

// Fitness options as constants
const FITNESS_INTERESTS = ['Weightlifting', 'Running', 'Yoga', 'Boxing', 'Swimming', 'CrossFit', 'Calisthenics'];
const FITNESS_GOALS = ['Build Muscle', 'Lose Weight', 'Increase Strength', 'Improve Endurance', 'General Fitness'];
const WORKOUT_FREQUENCY = ['1-2 times/week', '3-4 times/week', '5+ times/week'];

export default function OnboardingScreen() {
  const { session } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Form state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);

  const onNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onSubmit();
    }
  };

  const onBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const pickImage = async () => {
    // Request camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Ask for base64 representation
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
        // The image is now in base64 format, ready for upload
        const base64 = result.assets[0].base64;
        setImage(`data:image/jpeg;base64,${base64}`);
    }
  };


  const onSubmit = async () => {
    if (!session) return;
    setLoading(true);
    try {
        let avatarUrl = '';
        if (image) {
            const match = image.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/);
            const base64Data = match ? match[2] : null;
            const fileExt = match ? match[1] : 'jpg';
            
            if (!base64Data) {
              // This can happen if the URI is a local file path instead of a data URI
              // A more robust solution would handle file-to-base64 conversion here
              throw new Error("Could not extract image data. Please select the image again.");
            }

            const filePath = `${session.user.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64Data), {
                    contentType: `image/${fileExt}`,
                    upsert: true, // Overwrite file if it exists
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = data.publicUrl;
        }

      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        height,
        weight,
        fitness_interests: interests,
        primary_goal: goal,
        workout_frequency: frequency,
        city,
        avatar_url: avatarUrl,
        bio,
        username: session.user.email?.split('@')[0], // A default username
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      router.replace('/(tabs)/');

    } catch (error: any) {
      Alert.alert('Error completing profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Step ${step} of 3` }} />

      {/* STEP 1 */}
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Core Stats</Text>
          <TextInput placeholder="Height (e.g., 5ft 10in or 178cm)" value={height} onChangeText={setHeight} style={styles.input} />
          <TextInput placeholder="Weight (e.g., 165 lbs or 75 kg)" value={weight} onChangeText={setWeight} style={styles.input} keyboardType="numeric" />
        </View>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Fitness Details</Text>
          
          <Text style={styles.label}>Interests (select at least one)</Text>
          <View style={styles.choicesContainer}>
            {FITNESS_INTERESTS.map(item => (
              <Pressable key={item} onPress={() => toggleInterest(item)} style={[styles.choiceChip, interests.includes(item) && styles.choiceChipSelected]}>
                <Text style={[styles.choiceText, interests.includes(item) && styles.choiceTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.label}>Primary Goal</Text>
          <View style={styles.choicesContainer}>
            {FITNESS_GOALS.map(item => (
              <Pressable key={item} onPress={() => setGoal(item)} style={[styles.choiceChip, goal === item && styles.choiceChipSelected]}>
                <Text style={[styles.choiceText, goal === item && styles.choiceTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.label}>Workout Frequency</Text>
           <View style={styles.choicesContainer}>
            {WORKOUT_FREQUENCY.map(item => (
              <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.choiceChip, frequency === item && styles.choiceChipSelected]}>
                <Text style={[styles.choiceText, frequency === item && styles.choiceTextSelected]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Personalization</Text>
          <Pressable onPress={pickImage} style={styles.avatarPicker}>
            {image ? <Image source={{ uri: image }} style={styles.avatar} /> : <Text>Select Photo</Text>}
          </Pressable>
          <TextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />
          <TextInput placeholder="Short Bio (max 150 chars)" value={bio} onChangeText={setBio} style={styles.input} maxLength={150} multiline />
        </View>
      )}

      {/* NAVIGATION BUTTONS */}
      <View style={styles.buttonContainer}>
        {step > 1 && <Button title="Back" onPress={onBack} disabled={loading} />}
        <View style={{ flex: 1 }} />
        <Button title={step === 3 ? "Finish" : "Next"} onPress={onNext} disabled={loading} />
      </View>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
    fontWeight: '600',
  },
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  choiceChip: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  choiceChipSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  choiceText: {
    color: '#000',
  },
  choiceTextSelected: {
      color: '#fff',
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
