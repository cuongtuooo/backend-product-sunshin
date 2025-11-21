import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";

import {
    ChatConversation,
    ChatConversationSchema,
    ChatMessage,
    ChatMessageSchema,
} from "./schemas/chat.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatConversation.name, schema: ChatConversationSchema },
            { name: ChatMessage.name, schema: ChatMessageSchema },
        ]),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
})
export class ChatModule { }
