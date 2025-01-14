import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firebase from '../Config/Index';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import PhoneCall from 'react-native-phone-call';
const List_Profile = (props) => {
  const route = useRoute();
  const navigation = useNavigation();
  const currentid = route.params?.currentid; // Access the currentid parameter from route.params
  const database = firebase.database();
  const profilesRef = database.ref('profils');
  const [profilesData, setProfilesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [counted, setcounted] = useState({ id: '', count: 0 });
  const [filteredProfiles, setFilteredProfiles] = useState([]);

  useEffect(() => {
    console.log(currentid);
    console.log(currentid);
    profilesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const profiles = Object.values(data);

        // Filter out the profile where uid matches the key
        const filteredProfiles = profiles.filter(profile => profile.uid !== currentid);

        setProfilesData(filteredProfiles);
        setFilteredProfiles(filteredProfiles);
      }
    });

  }, []);

  const ref_msg = database.ref("msgS");

  // Function to retrieve the count of unread messages
  const countUnreadMessages = async () => {
    try {
      const snapshot = await ref_msg.orderByChild('status')
        .equalTo(false)
        .once('value');

      const profilesCopy = [...profilesData]; // Make a copy of the profiles list

      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        const senderId = message.sender;

        // Find the index of the sender in the profiles list
        const senderIndex = profilesCopy.findIndex(profile => profile.uid === senderId);
        if (senderIndex !== -1) {
          profilesCopy[senderIndex].unreadCount = profilesCopy[senderIndex].unreadCount ? profilesCopy[senderIndex].unreadCount + 1 : 1;
        }
      });

      // Update the state with the updated profiles list including unread counts
      setProfilesData(profilesCopy);
      console.log(profilesCopy)
    } catch (error) {
      console.error('Error counting unread messages:', error);
    }
  };

  useEffect(() => {
    countUnreadMessages();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);

    const searchWords = text.toLowerCase().split(' ');

    const filtered = profilesData.filter((profile) =>
      searchWords.every((word) =>
        profile.nom.toLowerCase().includes(word) ||
        profile.prenom.toLowerCase().includes(word) ||
        profile.tel.toLowerCase().includes(word)
      )
    );

    setFilteredProfiles(filtered);
  };

  const renderProfile = ({ item }) => (
    <View style={styles.profileItem} onClick={() => {
      alert(`
      Profil Details
      Nom : ${item.nom}
      Prenom : ${item.prenom}
      Tel : ${item.tel}
      `)
    }}>
      <Image source={item.url ? item.url : require('../assets/user.png')} style={styles.profileImage} />

      <View style={styles.profileInfo} >
        <Text>{`${item.nom} ${item.prenom}`}</Text>
        <Text>{item.tel}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => {
          navigation.navigate('Chat', { currentId: currentid, id_user: item.uid }); // Adjust 'Chat' and 'currentId' as needed
        }}>
          <Feather name="message-square" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleCall(item)}>
          <Feather name="phone" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDelete = (item) => {
    // Handle delete action for the profile
    console.log('Deleting:', item);
  };

  const handleCall = (item) => {
    const args = {
      number: item.tel, // phone number to call
      prompt: true, // whether to prompt the user before the call
    };

    PhoneCall(args).catch(console.error);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search profiles..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfile}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileTel: {
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  messageButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  callButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    margin: 15, // Add margin between icon buttons
  },
});

export default List_Profile;
