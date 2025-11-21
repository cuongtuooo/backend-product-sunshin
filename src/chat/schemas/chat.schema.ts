import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ChatConversationDocument = HydratedDocument<ChatConversation>;
export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatConversation {
    @Prop({ required: true })
    sessionId: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    userId?: Types.ObjectId;

    @Prop()
    customerName?: string;

    @Prop()
    customerEmail?: string;

    @Prop({ default: false })
    hasUnread: boolean;
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation);


// ===================== MESSAGE ========================

@Schema({ timestamps: true })
export class ChatMessage {
    @Prop({ type: Types.ObjectId, ref: 'ChatConversation', required: true })
    conversationId: Types.ObjectId;


    @Prop({ enum: ["USER", "ADMIN"], required: true })
    sender: "USER" | "ADMIN";

    @Prop({ required: true })
    content: string;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
