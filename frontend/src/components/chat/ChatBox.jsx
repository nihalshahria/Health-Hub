import styled from "@emotion/styled";
import { Stack, Paper, Typography, Avatar } from "@mui/material";
import moment from "moment";
import { useEffect, useRef } from "react";
import { API_HOST } from "../../constants/apiLinks";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  height: 70vh;
  padding: 1rem 2rem;

  ::-webkit-scrollbar {
    background-color: transparent;
    width: 16px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-track:hover {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #babac0;
    border-radius: 16px;
    border: 4px solid #f4f4f4;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a5;
    border: 4px solid #f4f4f4;
  }
  ::-webkit-scrollbar-button {
    display: none;
  }
`;

function ChatBox({ messageList }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  return (
    <Container>
      {messageList.map((msg, index) => (
        <Stack
          key={index}
          direction={msg.isReceived ? "row" : "row-reverse"}
          alignSelf={msg.isReceived ? "start" : "end"}
          spacing={1}
        >
          <Avatar
            alt="image"
            src={`${API_HOST}/${msg.senderPic}`}
            sx={{ width: 30, height: 30, alignSelf: "end", mb: 1 }}
          />
          <Stack alignItems={msg.isReceived ? "start" : "end"}>
            <Paper
              variant={"outlined"}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: msg.isReceived ? "start" : "end",
                color: msg.isReceived ? "text.primary" : "#fff",
                bgcolor: msg.isReceived ? "#fff" : "primary.main",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                borderBottomLeftRadius: msg.isReceived ? "0px" : "10px",
                borderBottomRightRadius: msg.isReceived ? "10px" : "0px",
              }}
            >
              <Typography variant="body1" fontWeight={"bold"}>
                {msg.sender}
              </Typography>

              <pre style={{ fontFamily: "inherit", margin: 0 }}>
                <Typography variant="body1">{msg.text}</Typography>
              </pre>
            </Paper>

            <Typography variant="caption" color={"text.secondary"}>
              {moment(Number(msg.timeStamp)).fromNow()}
            </Typography>
          </Stack>
        </Stack>
      ))}

      <div ref={messagesEndRef} />
    </Container>
  );
}

export default ChatBox;
