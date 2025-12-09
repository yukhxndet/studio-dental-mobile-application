import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput
} from "react-native";
import React from "react";
import { globalStyles } from "../styles/global";
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderComponent";
import { GiftedChat, Send, Bubble, InputToolbar } from 'react-native-gifted-chat'
import { useState, useEffect, useCallback } from "react";
import apiService from "../apiService";

export default function ChatBotScreen() {
  const navigation = useNavigation();

  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'สวัสดีค่ะ , ให้ฉันช่วยอะไรคุณ?\n\nตัวอย่างคำสั่ง\n- สอบถามข้อมูลทั่วไป\n- แนะนำการใช้แอพพลิเคชั่น\n- ติดต่อเจ้าหน้าที่',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'ยุคลเดช',
          avatar: 'https://studiodentalclinic.com/wp-content/uploads/2018/12/cropped-IT390N3L_StudioDental_Logo.png.webp',
        },
      },
    ])
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

    // Send message to the backend
    apiService.post('/chat', {
      message: messages[0].text,
    })
    .then(response => {
      const botMessage = {
        _id: Math.random().toString(),
        text: response.data.response,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Bot',
        },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage));
    })
    .catch(error => {
      console.error(error);
    });
  }, []);

  const renderSend = (props) => {
    return (
        <Send {...props}>
            <View
                style={{
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    borderRadius: 12,
                    backgroundColor: '#1D364A',
                    marginRight: 8,
                    marginBottom: 8,
                    marginTop: 8,
                    padding: 8
                }}
            >
                 <Ionicons name="send" size={20} color={'white'}/>
            </View>
        </Send>
    )
  }

  // Customize sender messages
  const renderBubble = (props) => {
    return (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: '#1D364A',
                },
            }}
            textStyle={{
                right: {
                    color: 'white',
                    fontFamily: 'Kanit_400Regular'
                },
                left: {
                  fontFamily: 'Kanit_400Regular'
                }
            }}
        />
    )
  }

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={{ backgroundColor: 'white', borderBlockColor: 'white', justifyContent: 'center' }}
      placeholder="ส่งข้อความ" // Set your desired placeholder text here
    />
  );

  // Updated Avatar component
  const Avatar = ({ avatar = 'https://studiodentalclinic.com/wp-content/uploads/2023/09/logowebp.webp', ...props }) => {
    return (
      <Image
        source={{ uri: avatar }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
        {...props}
      />
    );
  };

  return (
    <View className="flex-1 bg-white pb-8"> 
       <Header title="ChatBot" />
       <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            user={{
                _id: 1,
            }}
            renderBubble={renderBubble}
            alwaysShowSend
            renderSend={renderSend}
            scrollToBottom
            textInputStyle={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#eaeaea',
                marginRight: 6,
                padding: 8,    
                backgroundColor: '#fafafa', 
                fontFamily: 'Kanit_400Regular'
            }}
            renderInputToolbar={renderInputToolbar}
            renderAvatar={(props) => <Avatar {...props} />}
          />
    </View>
  );
}
