import { Body, Controller, Post } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('chat-ai')
export class ChatAiController {
    constructor(private readonly chatAiService: ChatAiService) { }

    @Post()
    @ResponseMessage('AI trả lời câu hỏi')
    async ask(
        @Body('question') question: string,
        @User() user?: IUser,
    ) {
        const result = await this.chatAiService.askQuestion(question, user);
        return result;
    }
}
