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

  const { loading, error, socket } = useSelector(
    (state) => state.socketConnection
  );

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
        console.log(data);
        // setMessageList((previousMessages) => [
        //   ...previousMessages,
        //   {
        //     isReceived: true,
        //     sender: data.sender,
        //     senderPic: data.senderPic,
        //     text: data.text,
        //     timeStamp: data.timeStamp,
        //   },
        // ]);
      });
    }
  }, [chatRoomId, socket]);

  const getPreviousChatData = (chatData) => {
    console.log(chatData);
    const chatWithId = chatData.people.find((user) => userInfo.id !== user);

    if (chatWithId) {
      console.log(chatWithId);
      getChatWithInfo(chatWithId);
    }
  };

  const getChatWithInfo = async (id) => {
    try {
      const res = await axios.get(`${GET_USER}/${id}`);
      console.log(res.data);
    } catch (error) {
      console.log(error);
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

    // setMessageList((previousMessages) => [
    //   ...previousMessages,
    //   {
    //     isReceived: false,
    //     sender: "Me",
    //     senderPic: user.profileImage,
    //     text: chatText,
    //     timeStamp: sendingTime,
    //   },
    // ]);
  };

  return (
    <Stack spacing={2} py={2}>
      <Button variant={"contained"} sx={{ mx: 2 }}>
        Set Another Appointment
      </Button>

      <ChatBox messageList={messageList} />

      <ChatField handleChatSend={handleChatSend} />
    </Stack>
  );
}

export default ChatPage;
