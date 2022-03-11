import { Stack, Button } from "@mui/material";
import ChatField from "../components/chat/ChatField";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatBox from "../components/chat/ChatBox";
import { useDispatch } from "react-redux";
import { getUserDetails } from "../actions/userActions";
import axios from "axios";
import { GET_USER } from "../constants/apiLinks";

function ChatPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [messageList, setMessageList] = useState([]);
  const [chatWith, setChatWith] = useState({});

  const chatRoomId = searchParams.get("roomId");

  const { socket } = useSelector((state) => state.socketConnection);

  const { userInfo } = useSelector((state) => state.userLogin);

  const { user } = useSelector((state) => state.userDetails);

  useEffect(() => {
    if (userInfo && Object.keys(userInfo).length) {
      if (!(user && Object.keys(user).length)) {
        dispatch(getUserDetails());
      }
    }
  }, [dispatch, user, userInfo]);

  useEffect(() => {
    if (socket && chatRoomId) {
      socket.emit(
        "join-chat-room",
        chatRoomId,
        userInfo.id,
        getPreviousChatData
      );

      socket.on("user-sent-Msg", (data) => {
        setMessageList((previousMessages) => [
          ...previousMessages,
          {
            senderId: data.senderId,
            text: data.text,
            timestamp: data.timestamp,
          },
        ]);
      });
    }
  }, [chatRoomId, socket]);

  const getPreviousChatData = async (chatData) => {
    const chatWithId = chatData.people.find((p) => userInfo.id !== p);

    if (chatWithId) {
      try {
        const res = await axios.get(`${GET_USER}/${chatWithId}`);
        setChatWith(res.data);
        setMessageList(chatData.chats);
      } catch (error) {
        console.log(error);
      }
    } else {
      setMessageList(chatData.chats);
    }
  };

  const handleChatSend = (chatText) => {
    const sendingTime = Date.now();

    socket.emit("chatMsg", {
      roomId: chatRoomId,
      senderId: userInfo.id,
      text: chatText,
      timestamp: sendingTime.toString(),
    });

    setMessageList((previousMessages) => [
      ...previousMessages,
      {
        senderId: userInfo.id,
        text: chatText,
        timestamp: sendingTime.toString(),
      },
    ]);
  };

  return (
    <Stack spacing={2} py={2}>
      <Button variant={"contained"} sx={{ mx: 2 }}>
        Set Another Appointment
      </Button>

      <ChatBox messageList={messageList} user={user} chatWith={chatWith} />

      <ChatField handleChatSend={handleChatSend} />
    </Stack>
  );
}

export default ChatPage;
