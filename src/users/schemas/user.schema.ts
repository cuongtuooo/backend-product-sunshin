
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {
    @Prop()
    name: string;

    @Prop({required: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop()
    phone: string;

    @Prop()
    avatar: string;

    @Prop(({ type: mongoose.Schema.Types.ObjectId, ref: Role.name }))
    role: mongoose.Schema.Types.ObjectId;

    @Prop()
    refreshToken: string;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    };

    @Prop()
    createAt: string;

    @Prop()
    updatedAt: string;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;

    
}

export const UserSchema = SchemaFactory.createForClass(User);
