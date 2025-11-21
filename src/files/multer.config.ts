import { Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import fs from 'fs';
import { diskStorage } from "multer";
import path, { join } from "path";
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
    // trả ra đường link thư mục root
    getRootPath = () => {
        return process.cwd();
    };

    // check tồn tại thư mục thì không tạo mới, còn chưa tồn tại thì tạo mới
    ensureExists(targetDirectory: string) {
        fs.mkdir(targetDirectory, { recursive: true }, (error) => {
            if (!error) {
                console.log('Directory successfully created, or it already exists.');
                return;
            }
            switch (error.code) {
                case 'EEXIST':
                    // Error:
                    // Requested location already exists, but it's not a directory.
                    break;
                case 'ENOTDIR':
                    // Error:
                    // The parent hierarchy contains a file with the same name as the dir
                    // you're trying to create.
                    break;
                default:
                    // Some other error like permission denied.
                    console.error(error);
                    break;
            }
        });
    }



    createMulterOptions(): MulterModuleOptions {
        return {
            // lưu trữ file trong ổ đĩa máy tính hoặc là trong con backend
            storage: diskStorage({
                // ghi đè
                destination: (req, file, cb) => {
                    const folder = req?.headers?.['upload-type'] ?? "default";
                    this.ensureExists(`public/images/${folder}`);
                    cb(null, join(this.getRootPath(), `public/images/${folder}`))
                },
                // giúp đổi tên file
                filename: (req, file, cb) => {
                    //get image extension
                    let extName = path.extname(file.originalname);

                    //get image's name (without extension)
                    let baseName = path.basename(file.originalname, extName);

                    let finalName = `${baseName}-${Date.now()}${extName}`
                    cb(null, finalName)
                }
            })
        };
    }

}
