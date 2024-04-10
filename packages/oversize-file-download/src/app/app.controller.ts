import { Controller, Get, Head, HttpException, HttpStatus, Req, Res, StreamableFile } from "@nestjs/common";
import fs, { createReadStream } from "node:fs";
import { Response, Request } from 'express';

@Controller()
export class AppController {

  @Head('/')
  downloadOversizeFileInfo(@Res({ passthrough: true }) res: Response) {
    const filePath = "C:\\Users\\Administrator\\Downloads\\test.mp4"; // 替换成具体的视频文件
    const fileSize = fs.statSync(filePath).size;
    res.set({
      'Content-Length': fileSize,
      'Access-Control-Expose-Headers': 'Content-Length',
    });
  }

  @Get('/')
  downloadOversizeFile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filePath = "C:\\Users\\Administrator\\Downloads\\test.mp4"; // 替换成具体的视频文件
    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range.split('=')[1];
    const [start, end] = range.split('-');
    const startPos = Number(start);

    if (startPos > fileSize) {
      // 越界
      throw new HttpException(
        'REQUESTED_RANGE_NOT_SATISFIABLE',
        HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
      );
    }

    let endPos: number;
    if (end === '') {
      // 未指定接受，默认即为总字节长度
      endPos = fileSize;
    } else if (Number(end) > fileSize) {
      // 超过文件总大小，endPos即为总字节大小
      endPos = fileSize;
    } else {
      endPos = Number(end);
    }
    console.log('debug chunk size', startPos, endPos);
    const file = createReadStream(filePath, {
      start: startPos,
      end: endPos,
    });
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': endPos - startPos,
    });
    return new StreamableFile(file);
  }

}

