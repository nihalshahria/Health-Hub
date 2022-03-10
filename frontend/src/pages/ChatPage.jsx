import { Stack, Button } from "@mui/material";
import ChatField from "../components/chat/ChatField";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatBox from "../components/chat/ChatBox";
import { useDispatch } from "react-redux";
import { getUserDetails } from "../actions/userActions";

function ChatPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [messageList, setMessageList] = useState([]);

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
      socket.emit("join-chat-room", chatRoomId, userInfo.name);

      socket.on("user-connected", (userName) => {
        console.log("user-connected " + userName);
      });

      socket.on("user-sent-Msg", (data) => {
        console.log(data);
        setMessageList((previousMessages) => [
          ...previousMessages,
          {
            isReceived: true,
            sender: data.sender,
            senderPic: data.senderPic,
            text: data.text,
            timeStamp: data.timeStamp,
          },
        ]);
      });
    }
  }, [chatRoomId, socket]);

  const handleChatSend = (chatText) => {
    const sendingTime = Date.now();

    socket.emit("chatMsg", {
      roomId: chatRoomId,
      text: chatText,
      sender: user.name,
      senderPic: user.profileImage,
      timeStamp: sendingTime,
    });

    setMessageList((previousMessages) => [
      ...previousMessages,
      {
        isReceived: false,
        sender: "Me",
        senderPic: user.profileImage,
        text: chatText,
        timeStamp: sendingTime,
      },
    ]);
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
