import { Controller, Get, Req, Res, StreamableFile } from "@nestjs/common";
import { join } from "path";
import fs, { createReadStream } from "node:fs";
import { Response, Request } from 'express';

@Controller()
export class AppController {

  @Get()
  downloadOversizeFile(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const filePath = "C:\\Users\\Administrator\\Downloads\\9G.mp4"; // 替换成具体的视频文件
    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range.split('=')[1];
    const [start, end] = range.split('-');
    const startPos = Number(start);
    const endPos = Number(end) > fileSize ? fileSize : Number(end);
    console.log(startPos, endPos);
    const file = createReadStream(filePath, {
      start: startPos,
      end: endPos || undefined,
    });

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': endPos - startPos,
      'Content-Disposition': `attachment; filename="${Date.now()}.mp4"`,
      'File-Total-Size': fileSize,
      'Access-Control-Expose-Headers': 'Content-Disposition, File-Total-Size',
    });
    return new StreamableFile(file);
  }
}
