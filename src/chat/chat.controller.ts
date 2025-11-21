import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
    constructor(private chatService: ChatService) { }

    @Post("user-send")
    sendUserMsg(
        @Body("sessionId") sessionId: string,
        @Body("content") content: string,
        @Body("name") name?: string,
        @Body("email") email?: string,
        @Body("userId") userId?: string,
    ) {
        return this.chatService.sendUserMessage(sessionId, content, name, email, userId);
    }


    @Post("admin-send")
    adminSend(
        @Body("conversationId") conversationId: string,
        @Body("content") content: string,
    ) {
        return this.chatService.adminReply(conversationId, content);
    }

    @Get("messages/:conversationId")
    getMessages(@Param("conversationId") id: string) {
        return this.chatService.getMessages(id);
    }

    @Get("conversations")
    getAll() {
        return this.chatService.getAllConversations();
    }
}
