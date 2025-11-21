import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/products/schemas/products.schemas';
import { Category, CategoryDocument } from 'src/category/schemas/category.schema';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class ChatAiService {
    private genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenerativeAI(apiKey!);
    }

    /**
     * Lấy context (knowledge) từ hệ thống của bạn:
     * - Top sản phẩm bán chạy
     * - Danh mục cha – con
     * - 1 số đơn hàng gần đây
     * - v.v...
     * Tuỳ bạn muốn chat bot trả lời về cái gì.
     */
    private async buildContext() {
        // Ví dụ: lấy 10 sản phẩm bán chạy
        const bestSellers = await this.productModel
            .find({ isDeleted: null })
            .sort({ sold: -1 })
            .limit(10)
            .select('name price sold quantity category')
            .populate({ path: 'category', select: 'name slug parent' })
            .lean();

        // Lấy danh mục tree (cha – con) đơn giản
        const categories = await this.categoryModel
            .find({ isActive: true, isDeleted: null })
            .select('name slug parent')
            .lean();

        // 5 đơn hàng gần đây
        const recentOrders = await this.orderModel
            .find({ isDeleted: null })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name address phone totalPrice status createdAt')
            .lean();

        // Bạn có thể build context dạng text
        const productContext = bestSellers.map((p, idx) => {
            // category có thể là ObjectId hoặc object populate
            const catName =
                (p as any).category?.name || 'Không rõ danh mục';

            return `${idx + 1}. ${p.name} | Giá: ${p.price} | Đã bán: ${p.sold} | Còn lại: ${p.quantity} | Danh mục: ${catName}`;
        }).join('\n');

        const categoryContext = categories.map(c => {
            const parent = categories.find(x => String(x._id) === String(c.parent));
            const parentName = parent ? parent.name : 'ROOT';
            return `- ${c.name} (slug: ${c.slug}) | Cha: ${parentName}`;
        }).join('\n');

        const orderContext = recentOrders.map(o => {
            return `- Đơn của ${o.name} | Tổng tiền: ${o.totalPrice} | Trạng thái: ${o.status} | Ngày: ${o.createdAt}`;
        }).join('\n');

        const contextText = `
[DỮ LIỆU SẢN PHẨM BÁN CHẠY]
${productContext || 'Chưa có dữ liệu.'}

[DANH MỤC NHẠC CỤ]
${categoryContext || 'Chưa có dữ liệu.'}

[MỘT SỐ ĐƠN HÀNG GẦN ĐÂY]
${orderContext || 'Chưa có dữ liệu.'}
`;

        return contextText;
    }

    /**
     * Hàm chính: nhận câu hỏi, build context, gọi Gemini, trả lời.
     */
    async askQuestion(question: string, user?: IUser) {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash', // hoặc model khác nếu thích
        });

        const context = await this.buildContext();

        const systemPrompt = `
Bạn là trợ lý hỗ trợ nội bộ cho hệ thống bán nhạc cụ.
LUẬT BẮT BUỘC:
- Chỉ được trả lời dựa trên DỮ LIỆU NỘI BỘ phía dưới (DỮ LIỆU SẢN PHẨM, DANH MỤC, ĐƠN HÀNG).
- Nếu dữ liệu không đủ để trả lời thì phải nói: "Em không tìm thấy thông tin trong hệ thống."
- Không được bịa số liệu, không được trả lời theo hiểu biết bên ngoài.
- Trả lời ngắn gọn, tiếng Việt, dễ hiểu.

${context}
`;

        const fullPrompt = `
[HỆ THỐNG]
${systemPrompt}

[NGƯỜI DÙNG HỎI]
${question}
`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        return {
            answer: text,
            // tuỳ bạn muốn gửi thêm gì
        };
    }
}
