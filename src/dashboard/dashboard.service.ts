import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Product, ProductDocument } from 'src/products/schemas/products.schemas';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { Category, CategoryDocument } from 'src/category/schemas/category.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async getFullDashboard() {
    // ===========================
    // 1. Tổng sản phẩm
    // ===========================
    const totalProducts = await this.productModel.countDocuments({
      $or: [{ isDeleted: null }, { isDeleted: false }],
    });

    // ===========================
    // 2. Tổng đơn hàng
    // ===========================
    const totalOrders = await this.orderModel.countDocuments({
      $or: [{ isDeleted: null }, { isDeleted: false }],
    });

    // ===========================
    // 3. Tổng doanh thu
    // ===========================
    const orders = await this.orderModel.find({
      status: { $in: ['completed', 'delivered'] },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );

    // ===========================
    // 4. Sản phẩm sắp hết hàng
    // (tồn kho <= 5)
    // ===========================
    const lowStockProducts = await this.productModel
      .find({
        $and: [
          { quantity: { $lte: 5 } },
          { quantity: { $gt: 0 } }
        ]
      })

      .select('name quantity thumbnail')
      .limit(10);

    // ===========================
    // 5. Sản phẩm bán chạy
    // (sort theo sold)
    // ===========================
    const bestSellingProducts = await this.productModel
      .find()
      .sort({ sold: -1 })
      .limit(10)
      .select('name sold thumbnail price');

    // ===========================
    // 6. Đơn hàng gần đây
    // ===========================
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name totalPrice status createdAt');

    // ===========================
    // 7. Thống kê danh mục CHA + CON
    // ===========================
    const categories = await this.categoryModel
      .find()
      .select('name parent ancestors depth');

    const categoryStats = [];

    for (const cat of categories) {
      const totalProductsInCategory = await this.productModel.countDocuments({
        category: cat._id,
      });

      categoryStats.push({
        _id: cat._id,
        name: cat.name,
        depth: cat.depth,
        parent: cat.parent,
        totalProducts: totalProductsInCategory,
      });
    }

    // ===========================
    // KẾT QUẢ TRẢ VỀ
    // ===========================
    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      bestSellingProducts,
      recentOrders,
      categoryStats,
    };
  }
}
